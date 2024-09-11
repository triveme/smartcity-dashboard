import { Inject, Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { eq } from 'drizzle-orm';

import { AuthService } from '../auth/auth.service';
import { QueryBatch } from '../api.service';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { dataSources } from '@app/postgres-db/schemas/data-source.schema';
import { authData } from '@app/postgres-db/schemas/auth-data.schema';
import { EncryptionUtil } from '../../../dashboard-service/src/util/encryption.util';

@Injectable()
export class DataService {
  private readonly logger = new Logger(DataService.name);
  private readonly apiBaseUrl: string;

  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly authService: AuthService,
  ) {
    this.apiBaseUrl = `${process.env.API_MANDATORS_URL}/collections`;
  }

  async getCollections(
    authorizationToken: string,
    apiId: string,
  ): Promise<string[]> {
    try {
      const apiUrl = await this.getUrl(apiId);

      const url = `${apiUrl}`;

      this.logger.debug('getCollections: ', url);
      this.logger.debug('getCollections: ', authorizationToken);

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${authorizationToken}`,
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch data: ', error);
      throw new Error('Failed to fetch data');
    }
  }

  async getSources(
    collection: string,
    authorizationToken: string,
    apiId?: string,
  ): Promise<string[]> {
    try {
      const apiUrl = await this.getUrl(apiId);
      const url = `${apiUrl}/${collection}`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${authorizationToken}`,
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch data: ', error);
      throw new Error('Failed to fetch data');
    }
  }

  async getEntities(
    collection: string,
    source: string,
    authorizationToken: string,
    apiId?: string,
  ): Promise<string[]> {
    try {
      const apiUrl = await this.getUrl(apiId);
      const url = `${apiUrl}/${collection}/${source}/entities`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${authorizationToken}`,
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error('Failed to fetch data: ', error);
      throw new Error('Failed to fetch data');
    }
  }

  async getAttributes(
    collection: string,
    source: string,
    authorizationToken: string,
    apiId?: string,
  ): Promise<string[]> {
    try {
      const apiUrl = await this.getUrl(apiId);
      const url = `${apiUrl}/${collection}/${source}/dictionary`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${authorizationToken}`,
        },
      });

      return Object.keys(response.data);
    } catch (error) {
      this.logger.error('Failed to fetch data: ', error);
      throw new Error('Failed to fetch data');
    }
  }

  async getDataFromDataSource(
    queryBatch: QueryBatch,
  ): Promise<AxiosResponse[]> {
    const { queryIds, query_config, data_source, auth_data } = queryBatch;

    try {
      const password = queryBatch.system_user.password;

      const tokenData = await this.authService.getTokenData({
        username: queryBatch.system_user.username,
        password: EncryptionUtil.decryptPassword(password as object),
      });

      let url = `${this.apiBaseUrl}/${queryBatch.query_config.fiwareService}/${queryBatch.query_config.fiwareType}/data`;

      const headers = {
        Authorization: `Bearer ${tokenData.access_token}`,
      };

      if (!tokenData.access_token) {
        console.error(
          `Could not get access token for data source with id: ${data_source.id}`,
        );
        return [];
      }

      // Prepare params for API call
      let params: {
        limit?: number;
        offset?: number;
        count?: number;
        start?: string;
        end?: string;
      } = {
        limit: 1000, // Fixed limit for each request
      };

      // Add time-based parameters based on timeframe
      const now = new Date();
      switch (query_config.timeframe) {
        case 'day':
          params.start = new Date(
            now.getTime() - 24 * 60 * 60 * 1000,
          ).toISOString();
          params.end = now.toISOString();
          break;
        case 'week':
          params.start = new Date(
            now.getTime() - 7 * 24 * 60 * 60 * 1000,
          ).toISOString();
          params.end = now.toISOString();
          break;
        case 'month':
          params.start = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            now.getDate(),
          ).toISOString();
          params.end = now.toISOString();
          break;
        default:
          params = {
            count: 1,
          };
      }

      // Construct the URL with entityIds if they exist
      if (query_config.entityIds && query_config.entityIds.length > 0) {
        url += `?filtervalues=${query_config.entityIds.join('&filtervalues=')}`;
      }

      let allData = [];
      let offset = 0;
      let fetchedData;

      do {
        params.offset = offset; // Set offset for pagination

        const response = await axios.get(url, { headers, params });
        fetchedData = response.data;
        allData = allData.concat(fetchedData);
        offset += fetchedData.length;
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

  async getUrl(apiId: string): Promise<string> {
    const apiUrl = await this.db
      .select()
      .from(dataSources)
      .leftJoin(authData, eq(dataSources.authDataId, authData.id))
      .where(eq(dataSources.id, apiId));
    if (apiUrl.length > 0) {
      return apiUrl[0].auth_data.apiUrl + '/collections';
    } else {
      this.logger.error(`No Datasource with this id: ${apiId}`);
      throw new Error('No Datasource with this id');
    }
  }
}
