import { Parser } from '@json2csv/plainjs';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { widgets } from '@app/postgres-db/schemas';
import { eq } from 'drizzle-orm';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { TabService } from '../tab/tab.service';
import { CurrentAreaConfig } from './widget.model';
import type { ChartData } from 'apps/data-translation-service/src/data-translation.service';
import { PopulateChartService } from 'apps/data-translation-service/src/populate/populate-chart.service';
import { sortFlattenedTimeSeriesData } from '../util/chart-data-sort.util';
import { flattenNgsiExportData } from '../util/ngsi-export.util';
import { PlatformInternalClientService } from '../platform-internal/platform-internal.client.service';
import { PlatformQueryResolverService } from '../platform-internal/platform-query-resolver.service';

@Injectable()
export class WidgetDataService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly tabService: TabService,
    private readonly populateChartService: PopulateChartService,
    private readonly platformInternalClient: PlatformInternalClientService,
    private readonly platformQueryResolver: PlatformQueryResolverService,
  ) {}

  async getRangeData(
    widgetId: string,
    range: { from: string; to: string },
    usesQueryParameter = false,
    authorization?: string | string[],
  ): Promise<ChartData[]> {
    try {
      if (!range?.from || !range?.to) {
        throw new HttpException(
          'Range body must contain valid from and to dates where from is before to',
          HttpStatus.BAD_REQUEST,
        );
      }

      const fromDate = new Date(range.from);
      const toDate = new Date(range.to);

      if (
        Number.isNaN(fromDate.getTime()) ||
        Number.isNaN(toDate.getTime()) ||
        fromDate > toDate
      ) {
        throw new HttpException(
          'Range body must contain valid from and to dates where from is before to',
          HttpStatus.BAD_REQUEST,
        );
      }

      const queryWithAllInfos =
        await this.platformQueryResolver.getByWidgetId(widgetId);

      if (!queryWithAllInfos) {
        throw new HttpException(
          'No query configuration found for widget',
          HttpStatus.NOT_FOUND,
        );
      }

      if (queryWithAllInfos.auth_data.type === 'ngsi-ld') {
        const queryConfig: typeof queryWithAllInfos.query_config = {
          ...queryWithAllInfos.query_config,
          timeframe: 'user_defined',
          dataStartDate: fromDate,
          dataUntilDate: toDate,
        };
        const queryData = await this.platformInternalClient.getQueryData(
          queryWithAllInfos.auth_data.type,
          queryWithAllInfos.query.id,
          authorization,
          {
            timeframe: queryConfig.timeframe,
            dataStartDate: queryConfig.dataStartDate,
            dataUntilDate: queryConfig.dataUntilDate,
          },
        );

        return this.populateChartService.normalizeHistoricalQueryData(
          queryData,
          queryConfig,
          usesQueryParameter,
        );
      } else {
        throw new HttpException(
          `Range data is not supported for data source type: ${queryWithAllInfos.auth_data.type}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      console.error(
        `Failed to retrieve NGSI-LD range data for widget ${widgetId}`,
        error,
      );
      throw new HttpException(
        'Failed to retrieve and normalize range data from the NGSI-LD data source',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async downloadWidgetData(
    widgetId: string,
    currentAreaConfig: CurrentAreaConfig | CurrentAreaConfig[],
    authorization?: string | string[],
  ): Promise<string> {
    const errorMessages: string[] = [];
    const allCsvData: string[] = [];

    try {
      const widget = await this.db
        .select()
        .from(widgets)
        .where(eq(widgets.id, widgetId));

      if (!widget || widget.length === 0) {
        const warning = `No widget found with id: ${widgetId}`;
        console.warn(warning);
        errorMessages.push(warning);
        return `"entityId","attrName","value","index"\n"No widget found with id: ${widgetId}"`;
      }

      // Expand combined widgets by replacing them with their child widgets
      const expandedWidgets = [];
      const currentWidget = widget[0];

      // Get the tab for this widget to check if it's a combined widget
      const widgetTabs = await this.tabService.getTabsByWidgetId(
        currentWidget.id,
      );

      if (widgetTabs.length > 0) {
        const combinedTab = widgetTabs[0];
        if (
          combinedTab.componentType === 'Kombinierte Komponente' ||
          combinedTab.componentSubType === 'Kombinierte Karte'
        ) {
          if (
            combinedTab.childWidgets &&
            Array.isArray(combinedTab.childWidgets) &&
            combinedTab.childWidgets.length > 0
          ) {
            const childWidgets = await Promise.all(
              combinedTab.childWidgets.map(async (childWidgetId) => {
                const childWidget = await this.db
                  .select()
                  .from(widgets)
                  .where(eq(widgets.id, childWidgetId));
                return childWidget[0];
              }),
            );

            childWidgets.forEach((childWidget) => {
              if (childWidget) {
                expandedWidgets.push(childWidget);
              }
            });
          }
        } else {
          expandedWidgets.push(currentWidget);
        }
      } else {
        expandedWidgets.push(currentWidget);
      }

      const normalizedCurrAreaConfing = Array.isArray(currentAreaConfig)
        ? currentAreaConfig[0]
        : currentAreaConfig;

      // Process each widget (either the original widget or child widgets from combined widget)
      for (const widgetToProcess of expandedWidgets) {
        try {
          const queryWithAllInfos =
            await this.platformQueryResolver.getByWidgetId(widgetToProcess.id);

          if (!queryWithAllInfos) {
            const warning = `No query information found for widget with id: ${widgetToProcess.id}`;
            console.warn(warning);
            errorMessages.push(warning);
            allCsvData.push(
              `"entityId","attrName","value","index"\n"No data found for widget with id: ${widgetToProcess.id}"`,
            );
            continue;
          }
          const queryBatch = {
            queryIds: [queryWithAllInfos.query.id],
            query_config: { ...queryWithAllInfos.query_config },
            auth_data: queryWithAllInfos.auth_data,
          };

          if (
            queryBatch.auth_data.type === 'ngsi' ||
            queryBatch.auth_data.type === 'ngsi-ld' ||
            queryBatch.auth_data.type === 'ngsi-v2'
          ) {
            if (!queryBatch.query_config.aggrMode) {
              queryBatch.query_config.aggrMode = 'none';
            }

            if (normalizedCurrAreaConfing.changeTimeFramePeriod === true) {
              queryBatch.query_config.timeframe =
                normalizedCurrAreaConfing.timeFramePeriod;
            } else {
              if (!queryBatch.query_config.timeframe) {
                queryBatch.query_config.timeframe = 'month';
              }
            }
          }

          const rawData = await this.platformInternalClient.getQueryData<
            object | object[]
          >(queryBatch.auth_data.type, queryBatch.queryIds[0], authorization, {
            timeframe: queryBatch.query_config.timeframe,
            aggrMode: queryBatch.query_config.aggrMode,
            aggrPeriod: queryBatch.query_config.aggrPeriod,
          });

          // Ensure rawData is an array
          const rawDataArray = Array.isArray(rawData) ? rawData : [rawData];
          const flattenedData =
            queryBatch.auth_data.type === 'ngsi' ||
            queryBatch.auth_data.type === 'ngsi-ld' ||
            queryBatch.auth_data.type === 'ngsi-v2'
              ? flattenNgsiExportData(
                  rawDataArray,
                  queryBatch.query_config.attributes || [],
                )
              : rawDataArray.flatMap((dataItem) => {
                  // Check for 'attrs' or 'attributes' property
                  const attributes = dataItem.attrs || dataItem.attributes;

                  if (!attributes) {
                    console.warn('Missing attrs/attributes in rawData item');
                    return [];
                  }

                  return attributes.flatMap((attr) => {
                    if (!attr.types || !Array.isArray(attr.types)) {
                      console.warn(
                        `Missing types for attribute: ${attr.attrName}. Processing without types.`,
                      );

                      // Process without types if not available
                      return attr.values.map((value, index) => ({
                        entityId: dataItem.entityId,
                        attrName: attr.attrName,
                        value: value,
                        index: dataItem.index ? dataItem.index[index] : null,
                      }));
                    }

                    return attr.types.flatMap((type) => {
                      return type.entities.flatMap((entity) => {
                        const index = entity.index || [];
                        const values = entity.values || [];

                        return values.map((value, i: number) => ({
                          entityId: entity.entityId,
                          attrName: attr.attrName,
                          value: value,
                          index: index[i] || null,
                        }));
                      });
                    });
                  });
                });

          if (flattenedData.length === 0) {
            const warning = `No data found for widget with id: ${widgetToProcess.id}`;
            console.warn(warning);
            errorMessages.push(warning);
            allCsvData.push(
              `"entityId","attrName","value","index"\n"No data found for widget with id: ${widgetToProcess.id}"`,
            );
          } else {
            const opts = {
              fields: ['entityId', 'attrName', 'value', 'index'],
            };
            const parser = new Parser(opts);

            const filteredFlattenedData =
              normalizedCurrAreaConfing.downloadCurrentArea === true
                ? sortFlattenedTimeSeriesData(
                    flattenedData,
                    queryBatch.auth_data.type,
                    normalizedCurrAreaConfing.selectedLegendNames,
                    normalizedCurrAreaConfing.minRange,
                    normalizedCurrAreaConfing.maxRange,
                  )
                : flattenedData;

            const csv = parser.parse(filteredFlattenedData);
            allCsvData.push(csv);
          }
        } catch (widgetError) {
          const warning = `Error processing widget with id: ${widgetToProcess.id} - ${widgetError.message}`;
          console.warn(warning);
          errorMessages.push(warning);
        }
      }

      if (allCsvData.length === 0 && errorMessages.length > 0) {
        const errorCsv = `Error downloading data, issues encountered:\n${errorMessages.join(
          '\n',
        )}`;
        return errorCsv;
      }

      const resultCsv = allCsvData.join('\n');
      return resultCsv;
    } catch (error) {
      console.error(
        'Error downloading data for widget with id:',
        widgetId,
        '\ndue to error: ',
        error,
      );

      const errorCsv = `Error downloading data, issues encountered:\n${error.message}`;
      return errorCsv;
    }
  }

  async runQueryDataPopulation(
    queryId: string,
    authDataType: string,
    authorization: string | string[] | undefined,
  ): Promise<void> {
    try {
      await this.platformInternalClient.enqueueQueryPopulation(
        authDataType,
        queryId,
        authorization,
      );
    } catch (error) {
      console.error(
        `Error queuing initial query population for ${queryId}`,
        error,
      );
    }
  }
}
