import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { DataSource } from '@app/postgres-db/schemas/data-source.schema';
import { QueryConfig } from '@app/postgres-db/schemas/query-config.schema';
import { queries, Query } from '@app/postgres-db/schemas/query.schema';
import { AuthData } from '@app/postgres-db/schemas/auth-data.schema';
import { Tab, Widget } from '@app/postgres-db/schemas';
import { ReportService } from './report/report.service';
import { DataService } from './data/data.service';
import { QueryService } from './query/query.service';
import { Parser } from '@json2csv/plainjs';

export type QueryWithAllInfos = {
  query: Query;
  query_config: QueryConfig;
  data_source: DataSource;
  auth_data: AuthData;
};

export type TabQueryWithAllInfos = {
  tab: Tab;
  widget: Widget;
  query: Query;
};

export type QueryBatch = {
  queryIds: string[];
  query_config: QueryConfig;
  data_source: DataSource;
  auth_data: AuthData;
};

@Injectable()
export class NgsiService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly dataService: DataService,
    private readonly reportService: ReportService,
    private readonly queryService: QueryService,
  ) {}

  async updateQueries(): Promise<void> {
    await this.updateFiwareQueries();
    await this.updateImageQueries();
    await this.reportService.updateReportData();
  }

  async updateImageQueries(): Promise<void> {
    const tabQueriesWithAllInfos =
      await this.queryService.getAllImagesWithAllInfos();

    // Only keep the queries that need to be updated (depending on their interval)
    const tabQueriesToUpdate = tabQueriesWithAllInfos.filter(
      (queryWithAllInfos) =>
        this.queryService.queryNeedsUpdate(
          queryWithAllInfos.query,
          queryWithAllInfos.tab.imageUpdateInterval,
        ),
    );

    for (const tabQueryWithAllInfos of tabQueriesToUpdate) {
      const imageData =
        await this.dataService.getImageFromSource(tabQueryWithAllInfos);
      const query = tabQueryWithAllInfos.query;
      // If data just inclused the http error status code

      if (/^[0-9]{3}$/.test(imageData)) {
        query.updateMessage = [
          'Something went wrong, when updating the image.',
        ];
        query.queryData = null;
      } else {
        query.queryData = {
          imageData: imageData,
        };
        query.updateMessage = null;
      }

      await this.updateImageQueryData(query);
    }
  }

  async updateFiwareQueries(): Promise<void> {
    const queryHashMap = await this.queryService.getQueriesToUpdate();

    // Create an array of promises from the dictionary. Each promise will fetch the data
    // from the data source and update all of it's queries (with the same hash) with the new data.
    const updates = Array.from(queryHashMap.values()).map(
      async (queryBatch) => {
        const newData =
          await this.dataService.getDataFromDataSource(queryBatch);

        if (newData) {
          await this.queryService.setQueryDataOfBatch(queryBatch, newData);
        }
      },
    );

    // Wait for all promises to resolve (this will send all the requests
    // to the data sources and update all the queries in parallel)
    await Promise.all(updates);
  }

  async updateImageQueryData(query: Query): Promise<void> {
    try {
      await this.db
        .update(queries)
        .set({
          queryData: query.queryData,
          updateMessage: query.updateMessage,
          updatedAt: new Date(Date.now()),
        })
        .where(eq(queries.id, query.id));
    } catch (error) {
      console.error(
        'Error updating queries with ids:',
        query.id,
        '\ndue to error: ',
        error,
      );
    }
  }

  async downloadData(widgetId: string): Promise<string> {
    try {
      // Define expected format types for incoming query-data
      type Attribute = {
        type: string;
        value: unknown;
        metadata: Record<string, unknown>;
      };

      type DataFormat = {
        id: string;
        type: string;
        [key: string]: Attribute | string | object;
      };

      // Get all query info of specified widget
      const queryWithAllInfos =
        await this.queryService.getQueryWithAllInfosByWidgetId(widgetId);

      if (!queryWithAllInfos) {
        throw new Error(
          `No query information found for widget with id: ${widgetId}`,
        );
      }

      // Set the aggregation method to 'none'
      queryWithAllInfos.query_config.aggrMode = 'none';

      // Create a queryBatch object
      const queryBatch = {
        queryIds: [queryWithAllInfos.query.id],
        query_config: queryWithAllInfos.query_config,
        data_source: queryWithAllInfos.data_source,
        auth_data: queryWithAllInfos.auth_data,
      };

      // Fetch data from data source
      const rawData = await this.dataService.getDataFromDataSource(queryBatch);

      // Handle undefined rawData
      if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
        throw new Error(
          `No valid data returned from data source for widget with id: ${widgetId}`,
        );
      }

      const dataObject = rawData[0]; // Assuming there is exactly one object in the array

      // Check if dataObject is in the expected format
      const isDataInExpectedFormat = (data: unknown): data is DataFormat => {
        return (
          typeof data === 'object' &&
          data !== null &&
          'id' in data &&
          'type' in data
        );
      };

      // Ensure dataObject is in the correct format
      if (!isDataInExpectedFormat(dataObject)) {
        throw new Error(
          'Data format is unexpected; Expected an object with id and type',
        );
      }

      // Flatten the NGSI data format
      const flattenedData = [
        {
          id: dataObject.id,
          type: dataObject.type,
          ...Object.keys(dataObject).reduce(
            (acc, key) => {
              if (
                key !== 'id' &&
                key !== 'type' &&
                (dataObject[key] as Attribute)?.value !== undefined
              ) {
                if (key === 'location') {
                  acc[key] = JSON.stringify(
                    (dataObject[key] as Attribute).value,
                  );
                } else {
                  acc[key] = (dataObject[key] as Attribute).value.toString();
                }
              }
              return acc;
            },
            {} as Record<string, string | object>,
          ),
        },
      ];

      // Initializing json2csv parser
      const opts = {};
      const parser = new Parser(opts);
      // Convert the data from JSON to CSV format
      const csv = parser.parse(flattenedData);
      return csv;
    } catch (error) {
      console.error(
        'Error downloading data for widget with id:',
        widgetId,
        '\ndue to error: ',
        error,
      );
      throw error;
    }
  }
}
