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
}
