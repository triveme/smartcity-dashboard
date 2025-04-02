import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import axios from 'axios';
import { QueryBatch, TabQueryWithAllInfos } from '../ngsi.service';
import * as sharp from 'sharp';

@Injectable()
export class DataService {
  constructor(private readonly authService: AuthService) {}

  async getDataFromDataSource(
    queryBatch: QueryBatch,
  ): Promise<object | Array<object>> {
    const { queryIds, query_config, data_source, auth_data } = queryBatch;

    try {
      let url: string;
      let headers;
      let params;
      const batchSize = 50;
      const batches = [];
      const access_token =
        await this.authService.getAccessTokenByQuery(queryBatch);

      if (!access_token) {
        console.error(
          `Could not get access token for data source with id: ${data_source.id}`,
        );
        return;
      }

      // LIVE DATA
      if (query_config.timeframe === 'live') {
        url = `${auth_data.liveUrl}`;
        headers =
          auth_data.type === 'ngsi-v2'
            ? {
                'Fiware-Service': query_config.fiwareService,
                'Fiware-ServicePath': query_config.fiwareServicePath,
                Authorization: `Bearer ${access_token}`,
              }
            : {
                'NGSILD-Tenant': query_config.fiwareService,
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${access_token}`,
              };

        // Split entityIds into batches
        for (let i = 0; i < query_config.entityIds.length; i += batchSize) {
          batches.push(query_config.entityIds.slice(i, i + batchSize));
        }

        const requests = batches.map(async (entityBatch) => {
          params =
            auth_data.type === 'ngsi-v2'
              ? {
                  id: entityBatch.join(','),
                  attrs: query_config.attributes.join(','),
                  type: query_config.fiwareType,
                  limit: '1000',
                }
              : {
                  id: entityBatch.join(','),
                  attrs: query_config.attributes.join(','),
                  limit: '1000',
                };

          const response = await axios.get(url, { headers, params });
          return response.data;
        });

        const results = await Promise.all(requests);
        return results.flat();
      }

      // HISTORIC DATA
      else {
        url =
          query_config.entityIds.length === 1
            ? `${auth_data.timeSeriesUrl}${query_config.entityIds}`
            : auth_data.timeSeriesUrl;

        if (auth_data.type === 'ngsi-v2') {
          headers = {
            'Fiware-Service': query_config.fiwareService,
            'Fiware-ServicePath': query_config.fiwareServicePath,
            Authorization: `Bearer ${access_token}`,
          };
        } else if (auth_data.type === 'ngsi-ld') {
          headers = {
            'NGSILD-Tenant': query_config.fiwareService,
            Authorization: `Bearer ${access_token}`,
          };
        } else {
          console.warn('Unknown auth-data type');
        }
        params = {
          type: query_config.fiwareType,
          fromDate: this.getFromDate(query_config.timeframe),
          toDate: new Date(Date.now()),
        };

        if (query_config.attributes && query_config.attributes.length > 0) {
          params.attrs = query_config.attributes.join(',');
        }

        if (query_config.aggrMode != 'none') {
          params.aggrMethod = query_config.aggrMode;
          params.aggrPeriod = query_config.aggrPeriod ?? 'hour';
        }

        if (query_config.entityIds.length > 1) {
          // Remove "entities" from url since the request fetches the values
          // via the attributes endpoint
          url = url.replace('entities/', 'attrs');
          params.id = query_config.entityIds.join(',');
        }
      }

      // Workaround for aggregation attributes with a name attribute included
      if (query_config.aggrMode !== 'none' && params.attrs.includes('name')) {
        params.attrs = params.attrs.replace('name,', '');
        params.attrs = params.attrs.replace(',name', '');
        const aggrParams = { ...params };
        const nameParams = {
          ...params,
          aggrMethod: undefined,
          aggrPeriod: undefined,
          attrs: 'name',
        };

        const [aggrResponse, nameResponse] = await Promise.all([
          axios.get(url, { headers, params: aggrParams }),
          axios.get(url, { headers, params: nameParams }),
        ]);

        const combinedAttrs = [
          ...aggrResponse.data.attrs,
          ...nameResponse.data.attrs,
        ];
        return {
          attrs: [...combinedAttrs],
        };
      }
      const response = await axios.get(url, { headers, params });

      return response.data;
    } catch (error) {
      console.error(
        'Could not get data for queries with ids:',
        queryIds,
        '\nfrom query_config:',
        query_config.id,
        '\nfrom data_source:',
        data_source.id,
        '\nfrom auth_data:',
        auth_data.id,
        '\ndue to error:',
        error && error.data ? error.data : error,
      );
    }
  }

  async downloadDataFromDataSource(
    queryBatch: QueryBatch,
  ): Promise<object | Array<object>> {
    const { queryIds, query_config, data_source, auth_data } = queryBatch;

    try {
      let url: string;
      let headers;
      const access_token =
        await this.authService.getAccessTokenByQuery(queryBatch);

      if (!access_token) {
        console.error(
          `Could not get access token for data source with id: ${data_source.id}`,
        );
        return;
      }

      url =
        query_config.entityIds.length === 1
          ? `${auth_data.timeSeriesUrl}${query_config.entityIds}`
          : auth_data.timeSeriesUrl;

      if (auth_data.type === 'ngsi-v2') {
        headers = {
          'Fiware-Service': query_config.fiwareService,
          'Fiware-ServicePath': query_config.fiwareServicePath,
          Authorization: `Bearer ${access_token}`,
        };
      } else if (auth_data.type === 'ngsi-ld') {
        headers = {
          'NGSILD-Tenant': query_config.fiwareService,
          Authorization: `Bearer ${access_token}`,
        };
      } else {
        console.warn('Unknown auth-data type');
      }
      const params = {
        type: query_config.fiwareType,
        fromDate: this.getFromDate('year'),
        toDate: new Date(Date.now()),
        attrs: query_config.attributes.join(','),
        id: query_config.entityIds.join(','),
      };
      url = url.replace('entities/', 'attrs');

      // Workaround for aggregation attributes with a name attribute included
      if (params.attrs.includes('name')) {
        params.attrs = params.attrs.replace('name,', '');
        params.attrs = params.attrs.replace('name,', '');
        params.attrs = params.attrs.replace('name', '');
        const aggrParams = { ...params };

        const [aggrResponse] = await Promise.all([
          axios.get(url, { headers, params: aggrParams }),
        ]);

        const combinedAttrs = [...aggrResponse.data.attrs];
        return {
          attrs: [...combinedAttrs],
        };
      }
      const response = await axios.get(url, { headers, params });

      return response.data;
    } catch (error) {
      console.error(
        'Could not get data for queries with ids:',
        queryIds,
        '\nfrom query_config:',
        query_config.id,
        '\nfrom data_source:',
        data_source.id,
        '\nfrom auth_data:',
        auth_data.id,
        '\ndue to error:',
        error && error.data ? error.data : error,
      );
    }
  }
  async getImageFromSource(
    tabQueryWithAllInfos: TabQueryWithAllInfos,
  ): Promise<string> {
    const url = tabQueryWithAllInfos.tab.imageUrl;
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Smart City Dashboard Service',
        },
        responseType: 'arraybuffer',
        timeout: 5000,
      });
      if (response.status == 200) {
        const buffer = Buffer.from(response.data, 'binary');

        const resizedBuffer = await sharp(buffer)
          .resize({
            height: tabQueryWithAllInfos.widget.height,
            withoutEnlargement: true,
          })
          .toBuffer();
        return resizedBuffer.toString('base64');
      } else {
        return response.status.toString();
      }
    } catch (error) {
      console.error(error);
    }
  }

  private getFromDate(
    timeframe: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year',
  ): string {
    const now = new Date();
    let fromDate: Date;

    if (timeframe === 'hour') {
      fromDate = new Date(now.getTime() - 60 * 60 * 1000);
    } else if (timeframe === 'day') {
      fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (timeframe === 'week') {
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === 'month') {
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeframe === 'quarter') {
      fromDate = new Date(now.getTime() - 3 * 30 * 24 * 60 * 60 * 1000);
    } else if (timeframe === 'year') {
      fromDate = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000);
    }

    return this.formatToIso(fromDate);
  }

  private formatToIso(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }
}
