/* eslint-disable @typescript-eslint/no-explicit-any */
import { Inject, Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import { eq } from 'drizzle-orm';

import { AuthService } from '../auth/auth.service';
import { QueryBatch } from '../api.service';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { dataSources } from '@app/postgres-db/schemas/data-source.schema';
import { authData } from '@app/postgres-db/schemas/auth-data.schema';
import {
  SystemUser,
  systemUsers,
} from '@app/postgres-db/schemas/tenant.system-user.schema';
import { EncryptionUtil } from '../../../dashboard-service/src/util/encryption.util';

@Injectable()
export class DataService {
  private readonly logger = new Logger(DataService.name);

  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly authService: AuthService,
  ) {}

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
      this.logger.debug('getSources: ', `${apiUrl}/collections/${collection}`);
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
    limit?: number,
  ): Promise<string[]> {
    try {
      const apiUrl = await this.getUrl(apiId);
      const effectiveLimit = limit ?? 2147483647;
      const url = `${apiUrl}/${collection}/${source}/entities?limit=${effectiveLimit}`;

      this.logger.debug('getEntities: ', url);

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
      this.logger.debug(
        'getAttributes: ',
        `${apiUrl}/collections/${collection}/${source}/dictionary`,
      );
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

  async getSystemUserForTenant(tenant: string): Promise<SystemUser | null> {
    const users = await this.db
      .select()
      .from(systemUsers)
      .where(eq(systemUsers.tenantAbbreviation, tenant));

    return users.length > 0 ? users[0] : null;
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

      let url = `${auth_data.apiUrl}/collections/${queryBatch.query_config.fiwareService}/${queryBatch.query_config.fiwareType}/data`;

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
        ordertimebased?: boolean;
      } = {
        limit: 1000, // Fixed limit for each request
        ordertimebased: true,
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
        case 'quarter':
          params.start = new Date(
            now.getFullYear(),
            now.getMonth() - 3,
            now.getDate(),
          ).toISOString();
          params.end = now.toISOString();
          break;
        case 'year':
          params.start = new Date(
            now.getFullYear() - 1,
            now.getMonth(),
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
      if (
        query_config.entityIds &&
        query_config.entityIds.length > 0 &&
        query_config.timeframe !== 'live'
      ) {
        url += `?filtervalues=${query_config.entityIds.join('&filtervalues=')}`;
        // If only one entityId is provided and the timeframe is "live",
        // we need to set the filtervalues for the provided entityId,
        // the limit to 1 and ordertimebased to true
        // This is needed, to be compatible with the API and getting the correct live data,
        // regardless of the collection we use
      } else if (
        query_config.entityIds &&
        query_config.entityIds.length === 1 &&
        query_config.timeframe === 'live'
      ) {
        url += `?filtervalues=${query_config.entityIds[0]}`;
        url += `&limit=1`;
        url += `&ordertimebased=true`;
        delete params.count;
      }

      let allData = [];
      let fetchedData;

      if (query_config.timeframe !== 'live') {
        let offset = 0;

        // Loop to fetch all data in chunks of 1000
        do {
          params.offset = offset;
          const response = await axios.get(url, { headers, params });
          fetchedData = response.data;
          allData = allData.concat(fetchedData);
          offset += fetchedData.length;
        } while (fetchedData.length === 1000);
      } else {
        const response = await axios.get(url, { headers, params });
        fetchedData = response.data;
        allData = allData.concat(fetchedData);
      }

      // When multiple entityIds are provided and the timeframe is "live",
      // we need to filter the data based on the entityIds
      // to ensure we only return the relevant data
      // This is needed for example for the pie chart widget,
      // showing multiple entities with the same attribute
      if (
        query_config.entityIds &&
        query_config.entityIds.length > 1 &&
        query_config.timeframe === 'live'
      ) {
        this.logger.debug(
          `Filtering data for entityIds: ${query_config.entityIds.join(', ')}`,
        );
        allData = this.filterDataByEntityIds(allData, query_config.entityIds);
      }

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

  private filterDataByEntityIds(data: any[], entityIds: string[]): any[] {
    return data.filter((item) => entityIds.includes(item.id));
  }

  async getUrl(datasourceId: string): Promise<string> {
    const apiUrl = await this.db
      .select()
      .from(dataSources)
      .leftJoin(authData, eq(dataSources.authDataId, authData.id))
      .where(eq(dataSources.id, datasourceId));
    if (apiUrl.length > 0) {
      return apiUrl[0].auth_data.apiUrl + '/collections';
    } else {
      this.logger.error(`No Datasource with this id: ${datasourceId}`);
      throw new Error('No Datasource with this id');
    }
  }
}
