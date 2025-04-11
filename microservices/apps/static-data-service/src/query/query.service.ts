import { Inject, Injectable } from '@nestjs/common';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  QueryBatch,
  QueryWithAllInfos,
} from '../../../orchideo-connect-service/src/api.service';
import { queries, Query } from '@app/postgres-db/schemas/query.schema';
import { queryConfigs } from '@app/postgres-db/schemas/query-config.schema';
import { eq, inArray } from 'drizzle-orm';
import { dataSources } from '@app/postgres-db/schemas/data-source.schema';
import { authData } from '@app/postgres-db/schemas/auth-data.schema';
import { systemUsers } from '@app/postgres-db/schemas/tenant.system-user.schema';
import { DataService } from '../data/data.service';
import {
  GeoJSONFeatureCollection,
  NGSIv2Entity,
  TransformationService,
} from '../transformation/transformation.service';

@Injectable()
export class QueryService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly dataService: DataService,
    private readonly transformationService: TransformationService,
  ) {}

  async updateQueries(): Promise<void> {
    const queriesToUpdate = await this.getQueriesToUpdate();

    for (const queryBatch of Array.from(queriesToUpdate.values())) {
      const newData = await this.dataService.getDataFromDataSource(queryBatch);
      if (newData) {
        let transformedData: NGSIv2Entity[];

        const unknownData = newData as unknown;
        if (Array.isArray(newData)) {
          transformedData = this.transformationService.transformToNgsi(
            unknownData as GeoJSONFeatureCollection[],
          );
        } else {
          transformedData = this.transformationService.transformToNgsi(
            unknownData as GeoJSONFeatureCollection,
          );
        }

        await this.setQueryDataOfBatch(queryBatch, transformedData);
      }
    }
  }

  private async getQueriesToUpdate(): Promise<Map<string, QueryBatch>> {
    const queriesWithAllInfos = await this.getAllQueriesWithAllInfos();

    // Only keep the queries that need to be updated (depending on their interval)
    const queriesToUpdate = this.filterQueriesToUpdate(queriesWithAllInfos);

    // Create a dictionary with the query_config hashes as keys so that we can
    // only fetch the data once for all queries with the same query_config hash
    return this.buildQueryHashMap(queriesToUpdate);
  }

  private buildQueryHashMap(
    queriesToUpdate: Array<QueryWithAllInfos>,
  ): Map<string, QueryBatch> {
    // Create a dictionary with the query_config hashes as keys so that we can
    // only fetch the data once for all queries with the same query_config hash
    const queryHashMap = new Map<string, QueryBatch>();

    queriesToUpdate.forEach((queryWithAllInfos) => {
      const hash = queryWithAllInfos.query_config.hash;

      if (!queryHashMap.has(hash)) {
        queryHashMap.set(hash, {
          queryIds: [queryWithAllInfos.query.id],
          query_config: queryWithAllInfos.query_config,
          data_source: queryWithAllInfos.data_source,
          auth_data: queryWithAllInfos.auth_data,
          system_user: queryWithAllInfos.system_user,
        });
      } else {
        queryHashMap.get(hash).queryIds.push(queryWithAllInfos.query.id);
      }
    });

    return queryHashMap;
  }

  private filterQueriesToUpdate(
    queriesWithAllInfos: Array<QueryWithAllInfos>,
  ): QueryWithAllInfos[] {
    return queriesWithAllInfos.filter((queryWithAllInfos) => {
      if (queryWithAllInfos != null && queryWithAllInfos.query_config != null) {
        if (
          this.queryNeedsUpdate(
            queryWithAllInfos.query,
            queryWithAllInfos.query_config.interval,
          )
        ) {
          return queryWithAllInfos;
        }
      }
    });
  }

  async setQueryDataOfBatch(
    queryBatch: QueryBatch,
    newData: object | object[],
  ): Promise<void> {
    try {
      await this.db
        .update(queries)
        .set({ queryData: newData, updatedAt: new Date(Date.now()) })
        .where(inArray(queries.id, queryBatch.queryIds));
    } catch (error) {
      console.error(
        'Error updating queries with ids:',
        queryBatch.queryIds,
        '\ndue to error: ',
        error,
      );
    }
  }

  async getAllQueriesWithAllInfos(): Promise<QueryWithAllInfos[]> {
    // Select all queries & their related tables where the origin of the datasource = api
    return this.db
      .select()
      .from(queries)
      .leftJoin(queryConfigs, eq(queries.queryConfigId, queryConfigs.id))
      .leftJoin(dataSources, eq(queryConfigs.dataSourceId, dataSources.id))
      .leftJoin(authData, eq(dataSources.authDataId, authData.id))
      .leftJoin(
        systemUsers,
        eq(authData.tenantAbbreviation, systemUsers.tenantAbbreviation),
      )
      .where(eq(authData.type, 'static-endpoint'));
  }

  queryNeedsUpdate(query: Query, interval: number): boolean {
    const currentTime = new Date();
    const updatedAt = new Date(query.updatedAt);
    const timeDifference = currentTime.getTime() - updatedAt.getTime();

    // Check if the time difference is less than the queryConfig's interval (in seconds)
    return timeDifference > interval * 1000;
  }
}
