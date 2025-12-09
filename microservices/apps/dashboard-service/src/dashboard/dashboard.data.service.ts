import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { widgets } from '@app/postgres-db/schemas';
import { Parser } from '@json2csv/plainjs';
import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DataService as NgsiDataService } from '../../../ngsi-service/src/data/data.service';
import { QueryService as NgsiQueryService } from '../../../ngsi-service/src/query/query.service';
import { WidgetToPanelRepo } from '../widget-to-panel/widget-to-panel.repo';
import { PanelRepo } from '../panel/panel.repo';
import { DataService as OrchideoDataService } from '../../../orchideo-connect-service/src/data/data.service';
import { OrchideoConnectService } from '../../../orchideo-connect-service/src/api.service';
import { TabService } from '../tab/tab.service';
import { DataService as InternlDataService } from '../../../internal-data-service/src/data/data.service';

@Injectable()
export class DashboardDataService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly widgetsToPanelRepo: WidgetToPanelRepo,
    private readonly ngsiDataService: NgsiDataService,
    private readonly orchideoDataService: OrchideoDataService,
    private readonly orchideoConnectService: OrchideoConnectService,
    private readonly ngsiQueryService: NgsiQueryService,
    private readonly panelRepo: PanelRepo,
    private readonly tabService: TabService,
    private readonly internalDataService: InternlDataService,
  ) {}

  async downloadDashboardData(
    dashboardId: string,
    ids: string[],
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

      for (const panelWidget of expandedWidgets) {
        try {
          const queryWithAllInfos =
            await this.ngsiQueryService.getQueryWithAllInfosByWidgetId(
              panelWidget.id,
            );

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
            data_source: queryWithAllInfos.data_source,
            auth_data: queryWithAllInfos.auth_data,
          };
          let rawData: object | object[] = [];
          if (
            queryBatch.auth_data.type === 'ngsi' ||
            queryBatch.auth_data.type === 'ngsi-ld' ||
            queryBatch.auth_data.type === 'ngsi-v2'
          ) {
            queryBatch.query_config.aggrMode = 'none';
            queryBatch.query_config.timeframe = 'year';
            rawData =
              await this.ngsiDataService.downloadDataFromDataSource(queryBatch);
          } else if (queryBatch.auth_data.type === 'api') {
            console.log('DOWNLOAD ORCHIDEO CONNECT DATA');
            console.log(queryBatch.queryIds);
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
            console.log('Transformed rawData:', rawData);
          } else if (queryBatch.auth_data.type === 'internal') {
            console.log('DOWNLOAD INTERNAL CONNECT DATA');
            rawData =
              await this.internalDataService.getDataFromDataSource(queryBatch);
          }

          // Ensure rawData is an array
          const rawDataArray = Array.isArray(rawData) ? rawData : [rawData];

          const flattenedData = rawDataArray.flatMap((dataItem) => {
            // Check for 'attrs' or 'attributes' property

            if (queryBatch.auth_data.type === 'internal') {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const allValues = dataItem.Values.map((v) => ({
                ...v.Meta,
                ...v.Time,
                Value: v.Value,
              }));

              return allValues;
            } else if (
              queryBatch.auth_data.type === 'ngsi' ||
              queryBatch.auth_data.type === 'ngsi-ld' ||
              queryBatch.auth_data.type === 'ngsi-v2'
            ) {
              const attributes = dataItem.attrs || dataItem.attributes;

              if (!attributes) {
                console.warn('Missing attrs/attributes in rawData item');
                return [];
              }

              return attributes.flatMap((attr) => {
                // Handling case where returned object has no 'types' field
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
            }
          });

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
            const csv = parser.parse(flattenedData);
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
