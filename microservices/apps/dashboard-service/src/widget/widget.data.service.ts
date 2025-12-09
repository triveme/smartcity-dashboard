import { Parser } from '@json2csv/plainjs';
import { Inject, Injectable } from '@nestjs/common';
import { DataService as NgsiDataService } from '../../../ngsi-service/src/data/data.service';
import { QueryService as NgsiQueryService } from '../../../ngsi-service/src/query/query.service';
import { QueryBatch } from 'apps/ngsi-service/src/ngsi.service';
import { widgets } from '@app/postgres-db/schemas';
import { eq } from 'drizzle-orm';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { DataService as OrchideoDataService } from '../../../orchideo-connect-service/src/data/data.service';
import { OrchideoConnectService } from '../../../orchideo-connect-service/src/api.service';
import { TabService } from '../tab/tab.service';
import { InternalDataService } from 'apps/internal-data-service/src/internal-data.service';

@Injectable()
export class WidgetDataService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly ngsiDataService: NgsiDataService,
    private readonly ngsiQueryService: NgsiQueryService,
    private readonly orchideoDataService: OrchideoDataService,
    private readonly internalDataService: InternalDataService,
    private readonly orchideoConnectService: OrchideoConnectService,
    private readonly tabService: TabService,
  ) {}

  async downloadWidgetData(widgetId: string): Promise<string> {
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

      // Process each widget (either the original widget or child widgets from combined widget)
      for (const widgetToProcess of expandedWidgets) {
        try {
          const queryWithAllInfos =
            await this.ngsiQueryService.getQueryWithAllInfosByWidgetId(
              widgetToProcess.id,
            );

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
            query_config: queryWithAllInfos.query_config,
            data_source: queryWithAllInfos.data_source,
            auth_data: queryWithAllInfos.auth_data,
          };

          let rawData: object | object[] = [];
          if (
            queryBatch.auth_data.type === 'ngsi' ||
            queryBatch.auth_data.type === 'ngsi-ld' ||
            queryBatch.auth_data.type === 'ngsi-v2'
          ) {
            // Configure query batch
            queryBatch.query_config.aggrMode = 'none';
            queryBatch.query_config.timeframe = 'year';

            rawData =
              await this.ngsiDataService.getDataFromDataSource(queryBatch);
          } else if (queryBatch.auth_data.type === 'api') {
            const systemUser =
              await this.orchideoDataService.getSystemUserForTenant(
                queryBatch.auth_data.tenantAbbreviation,
              );
            rawData = await this.orchideoDataService.getDataFromDataSource({
              ...queryBatch,
              system_user: systemUser,
            });
            // Ensure rawData is an array before transforming
            const dataArray = Array.isArray(rawData) ? rawData : [rawData];
            rawData =
              this.orchideoConnectService.transformToTargetModel(dataArray);
          }

          // Ensure rawData is an array
          const rawDataArray = Array.isArray(rawData) ? rawData : [rawData];

          const flattenedData = rawDataArray.flatMap((dataItem) => {
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
            const csv = parser.parse(flattenedData);
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

  // Helper to run data population asynchronously
  async runQueryDataPopulation(queryBatch: QueryBatch): Promise<void> {
    try {
      let newData: object | object[] = [];

      if (
        queryBatch.auth_data.type === 'ngsi' ||
        queryBatch.auth_data.type === 'ngsi-ld' ||
        queryBatch.auth_data.type === 'ngsi-v2'
      ) {
        newData = await this.ngsiDataService.getDataFromDataSource(queryBatch);
      } else if (queryBatch.auth_data.type === 'api') {
        const systemUser =
          await this.orchideoDataService.getSystemUserForTenant(
            queryBatch.auth_data.tenantAbbreviation,
          );
        const orchideoData =
          await this.orchideoDataService.getDataFromDataSource({
            ...queryBatch,
            system_user: systemUser,
          });
        // Ensure data is an array before transforming
        const dataArray = Array.isArray(orchideoData)
          ? orchideoData
          : [orchideoData];
        newData = this.orchideoConnectService.transformToTargetModel(dataArray);
      } else if (queryBatch.auth_data.type === 'internal') {
        newData =
          await this.internalDataService.getDataFromDataSource(queryBatch);
        await this.internalDataService.updateFiwareQueries();
      }

      if (newData) {
        await this.ngsiQueryService.setQueryDataOfBatch(queryBatch, newData);
      }
    } catch (error) {
      console.error('Error in query data population', error);
    }
  }
}
