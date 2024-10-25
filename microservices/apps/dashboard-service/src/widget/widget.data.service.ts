import { Parser } from '@json2csv/plainjs';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataService as NgsiDataService } from '../../../ngsi-service/src/data/data.service';
import { QueryService as NgsiQueryService } from '../../../ngsi-service/src/query/query.service';

@Injectable()
export class WidgetDataService {
  constructor(
    private readonly ngsiDataService: NgsiDataService,
    private readonly ngsiQueryService: NgsiQueryService,
  ) {}

  async downloadWidgetData(widgetId: string): Promise<string> {
    try {
      // Get all query info of specified widget
      const queryWithAllInfos =
        await this.ngsiQueryService.getQueryWithAllInfosByWidgetId(widgetId);

      if (!queryWithAllInfos) {
        throw new HttpException(
          `No query information found for widget with id: ${widgetId}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const queryBatch = {
        queryIds: [queryWithAllInfos.query.id],
        query_config: queryWithAllInfos.query_config,
        data_source: queryWithAllInfos.data_source,
        auth_data: queryWithAllInfos.auth_data,
      };
      // Set the aggregation method to 'none' to ensure no aggregation occurs
      queryBatch.query_config.aggrMode = 'none';
      // // Override the timeframe to 'year' for this function
      queryBatch.query_config.timeframe = 'year';

      // Fetch raw data from the data source
      const rawData =
        await this.ngsiDataService.getDataFromDataSource(queryBatch);

      // Handle undefined or empty rawData
      if (!rawData || (Array.isArray(rawData) && rawData.length === 0)) {
        throw new HttpException(
          `No valid data returned from data source for widget with id: ${widgetId}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      // Ensure rawData is treated as an array
      const rawDataArray = Array.isArray(rawData) ? rawData : [rawData];

      // Prepare flattened data
      const flattenedData = rawDataArray.flatMap((dataItem) => {
        const attributes = dataItem.attributes || [];
        const indices = dataItem.index || [];

        // Flatten attributes and indices
        return attributes.flatMap((attr) => {
          return attr.values.map((value, i: number) => {
            const row: Record<string, unknown> = {
              entityId: dataItem.entityId,
              attrName: attr.attrName,
              value: value,
              index: indices[i],
            };
            return row;
          });
        });
      });

      // Initialize json2csv parser and convert to CSV
      const opts = { fields: ['entityId', 'attrName', 'value', 'index'] };
      const parser = new Parser(opts);
      const csv = parser.parse(flattenedData);

      return csv;
    } catch (error) {
      console.error(
        'Error downloading data for widget with id:',
        widgetId,
        '\ndue to error: ',
        error,
      );
      throw error; // Re-throw the error to signal failure to the caller
    }
  }
}
