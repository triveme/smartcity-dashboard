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

@Injectable()
export class WidgetDataService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly ngsiDataService: NgsiDataService,
    private readonly ngsiQueryService: NgsiQueryService,
    private readonly orchideoDataService: OrchideoDataService,
    private readonly orchideoConnectService: OrchideoConnectService,
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

      const queryWithAllInfos =
        await this.ngsiQueryService.getQueryWithAllInfosByWidgetId(widgetId);

      if (!queryWithAllInfos) {
        const warning = `No query information found for widget with id: ${widgetId}`;
        console.warn(warning);
        errorMessages.push(warning);
        allCsvData.push(
          `"entityId","attrName","value","index"\n"No data found for widget with id: ${widgetId}"`,
        );
        return allCsvData.join('\n');
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

        rawData = await this.ngsiDataService.getDataFromDataSource(queryBatch);
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
        rawData = this.orchideoConnectService.transformToTargetModel(dataArray);
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
        const warning = `No data found for widget with id: ${widgetId}`;
        console.warn(warning);
        errorMessages.push(warning);
        allCsvData.push(
          `"entityId","attrName","value","index"\n"No data found for widget with id: ${widgetId}"`,
        );
      } else {
        const opts = {
          fields: ['entityId', 'attrName', 'value', 'index'],
        };
        const parser = new Parser(opts);
        const csv = parser.parse(flattenedData);
        allCsvData.push(csv);
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
      }

      if (newData) {
        await this.ngsiQueryService.setQueryDataOfBatch(queryBatch, newData);
      }
    } catch (error) {
      console.error('Error in query data population', error);
    }
  }
}
