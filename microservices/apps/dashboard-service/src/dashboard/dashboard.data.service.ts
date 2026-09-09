import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { widgets } from '@app/postgres-db/schemas';
import { Parser } from '@json2csv/plainjs';
import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { WidgetToPanelRepo } from '../widget-to-panel/widget-to-panel.repo';
import { PanelRepo } from '../panel/panel.repo';
import { TabService } from '../tab/tab.service';
import { sortFlattenedTimeSeriesData } from '../util/chart-data-sort.util';
import { flattenNgsiExportData } from '../util/ngsi-export.util';
import { CurrentAreaConfig } from '../widget/widget.model';
import { PlatformInternalClientService } from '../platform-internal/platform-internal.client.service';
import { PlatformQueryResolverService } from '../platform-internal/platform-query-resolver.service';

@Injectable()
export class DashboardDataService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly widgetsToPanelRepo: WidgetToPanelRepo,
    private readonly panelRepo: PanelRepo,
    private readonly tabService: TabService,
    private readonly platformInternalClient: PlatformInternalClientService,
    private readonly platformQueryResolver: PlatformQueryResolverService,
  ) {}

  async downloadDashboardData(
    dashboardId: string,
    ids: string[],
    currentAreaConfig: CurrentAreaConfig | CurrentAreaConfig[],
    authorization?: string | string[],
  ): Promise<string> {
    const allCsvData: string[] = [];
    const errorMessages: string[] = [];

    try {
      const widgetIds = new Set(ids.map((id) => id));

      const allWidgets = await Promise.all(
        Array.from(widgetIds).map(async (id) => {
          const widget = await this.db
            .select()
            .from(widgets)
            .where(eq(widgets.id, id));

          return widget[0];
        }),
      );

      // Expand combined widgets by replacing them with their child widgets
      const expandedWidgets = [];
      for (const panelWidget of allWidgets) {
        const widgetTabs = await this.tabService.getTabsByWidgetId(
          panelWidget.id,
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
            expandedWidgets.push(panelWidget);
          }
        } else {
          expandedWidgets.push(panelWidget);
        }
      }

      const currAreaConfing = Array.isArray(currentAreaConfig)
        ? currentAreaConfig
        : [currentAreaConfig];

      for (const panelWidget of expandedWidgets) {
        try {
          const filterConfig = currAreaConfing.filter(
            (item) => item.id === panelWidget.id,
          )[0];

          const queryWithAllInfos =
            await this.platformQueryResolver.getByWidgetId(panelWidget.id);

          if (!queryWithAllInfos) {
            const warning = `No query information found for widget with id: ${panelWidget.id}`;
            console.warn(warning);
            errorMessages.push(warning);
            // Pushing the error messages to the CSV output
            allCsvData.push(
              `"entityId","attrName","value","index"\n"No data found for widget with id: ${panelWidget.id}"`,
            );
            continue;
          }

          const queryBatch = {
            queryIds: [queryWithAllInfos.query.id],
            query_config: queryWithAllInfos.query_config,
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

            if (filterConfig.changeTimeFramePeriod === true) {
              queryBatch.query_config.timeframe = filterConfig.timeFramePeriod;
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
            queryBatch.auth_data.type === 'internal'
              ? rawDataArray.flatMap((dataItem) => {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const allValues = dataItem.Values.map((v) => ({
                    ...v.Meta,
                    ...v.Time,
                    Value: v.Value,
                  }));

                  return allValues;
                })
              : queryBatch.auth_data.type === 'ngsi' ||
                  queryBatch.auth_data.type === 'ngsi-ld' ||
                  queryBatch.auth_data.type === 'ngsi-v2'
                ? flattenNgsiExportData(rawDataArray, [
                    ...(queryBatch.query_config.attributes || []),
                  ])
                : [];

          if (flattenedData.length === 0) {
            const warning = `No data found for widget with id: ${panelWidget.id}`;
            console.warn(warning);
            errorMessages.push(warning);
          } else {
            let opts;

            if (
              queryBatch.auth_data.type === 'ngsi' ||
              queryBatch.auth_data.type === 'ngsi-ld' ||
              queryBatch.auth_data.type === 'ngsi-v2'
            ) {
              opts = {
                fields: ['entityId', 'attrName', 'value', 'index'],
              };
            } else if (queryBatch.auth_data.type === 'internal') {
              opts = {
                fields: [
                  'Quartal',
                  'Geschlecht',
                  'Altersklasse',
                  'Jahr',
                  'Value',
                ],
              };
            }

            const parser = new Parser(opts);

            const normalizedCurrAreaConfing =
              filterConfig.downloadCurrentArea === true
                ? sortFlattenedTimeSeriesData(
                    flattenedData,
                    queryBatch.auth_data.type,
                    filterConfig.selectedLegendNames,
                    filterConfig.minRange,
                    filterConfig.maxRange,
                  )
                : flattenedData;

            const csv = parser.parse(normalizedCurrAreaConfing);
            allCsvData.push(csv);
          }
        } catch (widgetError) {
          const warning = `Error processing widget with id: ${panelWidget.id} - ${widgetError.message}`;
          console.warn(warning);
          errorMessages.push(warning);
        }
      }

      if (allCsvData.length === 0 && errorMessages.length > 0) {
        const errorCsv = `Error downloading data, issues encountered:\n${errorMessages.join('\n')}`;
        return errorCsv;
      }

      const resultCsv = allCsvData.join('\n');
      return resultCsv;
    } catch (error) {
      console.error(
        'Error downloading data for dashboard with id:',
        dashboardId,
        '\ndue to error: ',
        error,
      );

      const errorCsv = `Error downloading data, issues encountered:\n${error.message}`;
      return errorCsv;
    }
  }
}
