import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { DataSource } from '@app/postgres-db/schemas/data-source.schema';
import { AuthData } from '@app/postgres-db/schemas/auth-data.schema';
import { QueryConfig } from '@app/postgres-db/schemas/query-config.schema';
import { SystemUser } from '@app/postgres-db/schemas/tenant.system-user.schema';

export type QueryBatch = {
  queryIds: string[];
  query_config: QueryConfig;
  data_source: DataSource;
  auth_data: AuthData;
  system_user: SystemUser;
};

@Injectable()
export class DataService {
  async getDataFromDataSource(
    queryBatch: QueryBatch,
  ): Promise<AxiosResponse[]> {
    const { queryIds, query_config, data_source, auth_data } = queryBatch;

    try {
      const url = `${auth_data.apiUrl}`;

      let allData = [];
      let fetchedData = [];

      do {
        const response = await axios.get(url);
        fetchedData = response.data;
        allData = allData.concat(fetchedData);
      } while (fetchedData.length === 1000); // Continue if page is full

      return allData;
    } catch (error) {
      console.error(
        'Could not get data for queries with ids:',
        queryIds,
        'from query_config:',
        query_config.id,
        'from data_source:',
        data_source.id,
        'from auth_data:',
        auth_data.id,
        'due to error:',
        error,
      );
      return [];
    }
  }
}
