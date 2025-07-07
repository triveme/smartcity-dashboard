/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import axios from 'axios';
import { QueryBatch, TabQueryWithAllInfos } from '../ngsi.service';
import * as sharp from 'sharp';
import { QueryConfig } from '@app/postgres-db/schemas/query-config.schema';

// interface NgsiLdProperty {
//   type: string;
//   avg?: Array<[number, string, string]>;
//   value?: any;
//   [key: string]: any;
// }

// interface NgsiLdEntity {
//   id: string;
//   type: string;
//   [key: string]: any;
// }

interface NgsiV2Attribute {
  attrName: string;
  values: any[];
}

interface NgsiV2Entity {
  entityId: string;
  index: string[];
  attributes: NgsiV2Attribute[];
}
@Injectable()
export class DataService {
  constructor(private readonly authService: AuthService) {}

  async getDataFromDataSource(
    queryBatch: QueryBatch,
  ): Promise<object | Array<object>> {
    const { data_source, auth_data, query_config } = queryBatch;

    try {
      const access_token =
        await this.authService.getAccessTokenByQuery(queryBatch);

      if (!access_token) {
        console.error(
          `Could not get access token for data source with id: ${data_source.id}`,
        );
        return;
      }

      if (auth_data.type === 'ngsi-v2') {
        return this.getDataFromDataSourceNgsiV2(queryBatch, access_token);
      } else if (auth_data.type === 'ngsi-ld') {
        const ngsiLdData = await this.getDataFromDataSourceNgsiLd(
          queryBatch,
          access_token,
        );
        return this.getProcessedDataFromNgsiLd(ngsiLdData, query_config);
      } else {
        console.warn('Unknown auth-data type');
        return;
      }
    } catch (error) {
      console.error(
        `Error getting data for data source with id: ${data_source.id}`,
        error,
      );
      return;
    }
  }

  async getDataFromDataSourceNgsiV2(
    queryBatch: QueryBatch,
    accessToken: string,
  ): Promise<object | Array<object>> {
    const { queryIds, query_config, data_source, auth_data } = queryBatch;
    let url: string;
    let headers;
    let params;
    const batchSize = 50;
    const batches = [];

    try {
      // LIVE DATA
      if (query_config.timeframe === 'live') {
        url = `${auth_data.liveUrl}`;
        headers = {
          'Fiware-Service': query_config.fiwareService,
          'Fiware-ServicePath': query_config.fiwareServicePath,
          Authorization: `Bearer ${accessToken}`,
        };

        // Split entityIds into batches
        for (let i = 0; i < query_config.entityIds.length; i += batchSize) {
          batches.push(query_config.entityIds.slice(i, i + batchSize));
        }

        const requests = batches.map(async (entityBatch) => {
          params = {
            id: entityBatch.join(','),
            attrs: query_config.attributes.join(','),
            type: query_config.fiwareType,
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

        headers = {
          'Fiware-Service': query_config.fiwareService,
          'Fiware-ServicePath': query_config.fiwareServicePath,
          Authorization: `Bearer ${accessToken}`,
        };

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
        'Could not get V2 data for queries with ids:',
        queryIds,
        '\nfrom query_config:',
        query_config.id,
        '\nfrom data_source:',
        data_source.id,
        '\nfrom auth_data:',
        auth_data.id,
        '\ndue to error:',
        error && error.response && error.response.data
          ? error.response.data
          : error,
      );
    }
  }

  async getDataFromDataSourceNgsiLd(
    queryBatch: QueryBatch,
    accessToken: string,
  ): Promise<object | Array<object>> {
    const { queryIds, query_config, data_source, auth_data } = queryBatch;

    try {
      let url: string;
      let headers;
      let params;
      const batchSize = 50;
      const batches = [];

      // LIVE DATA
      if (query_config.timeframe === 'live') {
        url = `${auth_data.liveUrl}`;
        headers = {
          'NGSILD-Tenant': auth_data.ngsildTenant,
          Authorization: `Bearer ${accessToken}`,
          Link: `<${auth_data.ngsildContextUrl}>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"`,
        };

        // Split entityIds into batches
        for (let i = 0; i < query_config.entityIds.length; i += batchSize) {
          batches.push(query_config.entityIds.slice(i, i + batchSize));
        }

        const requests = batches.map(async (entityBatch) => {
          params = {
            id: entityBatch.join(','),
            attrs: query_config.attributes.join(','),
            limit: '100',
          };

          const response = await axios.get(url, { headers, params });
          return response.data;
        });

        const results = await Promise.all(requests);
        return results.flat();
      }

      // HISTORIC DATA
      else {
        // Initialize base URL once by properly replacing entities with temporal/entities
        const baseUrl = auth_data.timeSeriesUrl.replace(
          /\/entities\/?$/,
          '/temporal/entities',
        );

        headers = {
          'NGSILD-Tenant': auth_data.ngsildTenant,
          Authorization: `Bearer ${accessToken}`,
          Link: `<${auth_data.ngsildContextUrl}>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"`,
        };

        params = {
          type: query_config.fiwareType,
          timerel: 'between',
          timeAt: this.getFromDate(query_config.timeframe),
          endTimeAt: new Date(Date.now()),
        };

        if (query_config.aggrMode !== 'none') {
          params.aggrPeriodDuration = this.getAggregationPeriodMappingForNgsiLd(
            query_config.aggrPeriod,
          );
          params.aggrMethods = query_config.aggrMode;
          params.options = 'aggregatedValues';
        }

        if (query_config.attributes && query_config.attributes.length > 0) {
          params.attrs = query_config.attributes.join(',');
        }

        // For multiple entities, create separate requests or use id parameter
        if (query_config.entityIds.length > 1) {
          // Use the baseUrl with entity id parameter
          url = baseUrl;
          params.id = query_config.entityIds.join(',');
        } else {
          // For a single entity, use the entityId in the URL
          url = `${baseUrl}/${query_config.entityIds[0]}`;
        }

        // Workaround for aggregation attributes with a name attribute included
        if (
          query_config.aggrMode !== 'none' &&
          params.attrs &&
          params.attrs.includes('name')
        ) {
          params.attrs = params.attrs.replace('name,', '');
          params.attrs = params.attrs.replace(',name', '');
          const aggrParams = { ...params };
          const nameParams = {
            ...params,
            aggrMethods: undefined,
            aggrPeriodDuration: undefined,
            options: undefined,
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
      }
    } catch (error) {
      console.error(
        'Could not get LD data for queries with ids:',
        queryIds,
        '\nfrom query_config:',
        query_config.id,
        '\nfrom data_source:',
        data_source.id,
        '\nfrom auth_data:',
        auth_data.id,
        '\ndue to error:',
        error && error.response && error.response.data
          ? error.response.data
          : error,
      );
    }
  }

  getAggregationPeriodMappingForNgsiLd(aggrPeriod: string): string {
    switch (aggrPeriod) {
      case 'hour':
        return 'PT1H';
      case 'day':
        return 'P1D';
      case 'week':
        return 'P7D';
      case 'month':
        return 'P1M';
      case 'quarter':
        return 'P3M';
      case 'year':
        return 'P1Y';
      default:
        return 'PT1H';
    }
  }

  // Main mapping functions
  getProcessedDataFromNgsiLd(
    data: object | Array<object>,
    queryConfig: QueryConfig,
  ): object | Array<object> {
    if (queryConfig.timeframe === 'live') {
      return data; // Handle live data
    }

    if (
      !data ||
      (Array.isArray(data) && data.length === 0) ||
      Object.keys(data).length === 0
    ) {
      console.warn(
        `No data found for query with id: ${queryConfig.id} and entityIds: ${queryConfig.entityIds}`,
      );
      return;
    }

    // Choose the appropriate mapping function based on entity and attribute counts
    if (
      queryConfig.entityIds.length === 1 &&
      queryConfig.attributes.length === 1
    ) {
      return this.mapLdToV2ForSingleEntitySingleAttribute(data);
    } else if (
      queryConfig.entityIds.length === 1 &&
      queryConfig.attributes.length > 1
    ) {
      return this.mapNgsiLdToMultiAttributeTimeSeries(data);
    } else if (queryConfig.entityIds.length > 1) {
      return this.mapNgsiLdForMultipleEntities(data, queryConfig);
    }
  }

  mapLdToV2ForSingleEntitySingleAttribute(
    ldEntity: object | Array<object>,
  ): NgsiV2Entity {
    // Handle the case when ldEntity is an array
    const entity = Array.isArray(ldEntity) ? ldEntity[0] : ldEntity;

    // If no entity found, return empty result
    if (!entity) {
      return {
        entityId: undefined,
        index: [],
        attributes: [],
      };
    }

    const entityId = entity.id;
    const allTimestamps = this.extractTimestamps(entity);

    const v2Entity: NgsiV2Entity = {
      entityId: entityId,
      index: allTimestamps,
      attributes: [],
    };

    // If no timestamps found, return early
    if (allTimestamps.length === 0) {
      console.log('No timestamps found in any attribute');
      return v2Entity;
    }

    // Process each attribute
    const potentialTimeSeriesAttrs = Object.keys(entity).filter(
      (key) => key !== 'id' && key !== 'type',
    );

    for (const attrName of potentialTimeSeriesAttrs) {
      const attr = entity[attrName];
      const attrValues = this.extractAttributeValues(attr, allTimestamps);

      if (attrValues.length > 0) {
        v2Entity.attributes.push({
          attrName: attrName,
          values: attrValues,
        });
      }
    }

    return v2Entity;
  }

  mapNgsiLdToMultiAttributeTimeSeries(ngsiData): {
    attributes: any[];
    entityId: any;
    index: any[];
  } {
    const entity = Array.isArray(ngsiData) ? ngsiData[0] : ngsiData;

    // If no entity found, return empty result
    if (!entity) {
      return {
        attributes: [],
        entityId: undefined,
        index: [],
      };
    }

    const entityId = entity.id;
    const allTimestamps = this.extractTimestamps(entity);

    const result = {
      attributes: [],
      entityId: entityId,
      index: allTimestamps,
    };

    // If no timestamps found, return early
    if (allTimestamps.length === 0) {
      console.log('No timestamps found in any attribute');
      return result;
    }

    // Process each attribute
    const potentialTimeSeriesAttrs = Object.keys(entity).filter(
      (key) => key !== 'id' && key !== 'type',
    );

    for (const attrName of potentialTimeSeriesAttrs) {
      const attr = entity[attrName];
      const attrValues = this.extractAttributeValues(attr, allTimestamps);

      if (attrValues.length > 0) {
        result.attributes.push({
          attrName: attrName,
          values: attrValues,
        });
      }
    }

    return result;
  }

  mapNgsiLdForMultipleEntities(
    ngsiData: object | Array<object>,
    queryConfig: QueryConfig,
  ): object {
    // Ensure we have an array of entities
    const entities = Array.isArray(ngsiData) ? ngsiData : [ngsiData];

    if (!entities.length) {
      return {
        attrs: [],
      };
    }

    // Result structure with attributes array
    const result = { attrs: [] };

    // Get all attribute names across all entities
    const allAttributeNames = new Set<string>();
    entities.forEach((entity) => {
      Object.keys(entity).forEach((key) => {
        if (key !== 'id' && key !== 'type') {
          allAttributeNames.add(key);
        }
      });
    });

    // Process each attribute
    for (const attrName of allAttributeNames) {
      const attribute = {
        attrName: attrName,
        types: [
          {
            entities: [],
            entityType: entities[0]?.type || queryConfig.fiwareType,
          },
        ],
      };

      // Process each entity for this attribute
      for (const entity of entities) {
        if (!entity[attrName]) continue; // Skip if entity doesn't have this attribute

        const attr = entity[attrName];
        const { timestamps: entityTimestamps, values: entityValues } =
          this.extractEntitySpecificData(attr);

        // Only add entity if we have values
        if (entityValues.length > 0) {
          attribute.types[0].entities.push({
            entityId: entity.id,
            index: entityTimestamps,
            values: entityValues,
          });
        }
      }

      // Only add attribute if it has entities
      if (attribute.types[0].entities.length > 0) {
        result.attrs.push(attribute);
      }
    }

    return result;
  }

  async downloadDataFromDataSource(
    queryBatch: QueryBatch,
  ): Promise<object | Array<object>> {
    const { queryIds, query_config, data_source, auth_data } = queryBatch;

    try {
      let headers;
      const access_token =
        await this.authService.getAccessTokenByQuery(queryBatch);

      if (!access_token) {
        console.error(
          `Could not get access token for data source with id: ${data_source.id}`,
        );
        return;
      }

      const url =
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
          Link: `<https://context.kopenhagen.beispiel-stadt.de/main-context>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"`,
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
  ): Date {
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

    return fromDate;
  }

  // Helper functions for data processing
  private extractTimestamps(entity: any): string[] {
    const allTimestamps = new Set<string>();
    const potentialTimeSeriesAttrs = Object.keys(entity).filter(
      (key) => key !== 'id' && key !== 'type',
    );

    // Collect timestamps from all attributes
    for (const attrName of potentialTimeSeriesAttrs) {
      const attr = entity[attrName];

      // Case 1: Array of Property objects with observedAt
      if (
        Array.isArray(attr) &&
        attr.length > 0 &&
        attr[0]?.type === 'Property' &&
        attr[0]?.observedAt
      ) {
        attr.forEach((item) => {
          if (item.observedAt) {
            allTimestamps.add(item.observedAt);
          }
        });
      }
      // Case 2: Property with avg array (aggregated data)
      else if (
        attr?.type === 'Property' &&
        attr.avg &&
        Array.isArray(attr.avg)
      ) {
        attr.avg.forEach((item) => {
          if (Array.isArray(item) && item.length >= 2) {
            allTimestamps.add(item[1]);
          }
        });
      }
    }

    // Return sorted timestamps array
    return Array.from(allTimestamps).sort();
  }

  private extractAttributeValues(attr: any, timestamps: string[]): any[] {
    const values = [];

    // Case 1: Standard time series format
    if (
      Array.isArray(attr) &&
      attr.length > 0 &&
      attr[0]?.type === 'Property' &&
      attr[0]?.observedAt
    ) {
      // Create a map for quick lookup
      const valueMap = new Map();
      attr.forEach((item) => {
        if (item.observedAt && item.value !== undefined) {
          valueMap.set(item.observedAt, item.value);
        }
      });

      // Get values for each timestamp
      timestamps.forEach((timestamp) => {
        values.push(valueMap.has(timestamp) ? valueMap.get(timestamp) : null);
      });
    }
    // Case 2: Aggregated data with avg array
    else if (attr?.type === 'Property' && attr.avg && Array.isArray(attr.avg)) {
      const valueMap = new Map();
      attr.avg.forEach((item) => {
        if (Array.isArray(item) && item.length >= 2) {
          valueMap.set(item[1], item[0]);
        }
      });

      timestamps.forEach((timestamp) => {
        values.push(valueMap.has(timestamp) ? valueMap.get(timestamp) : null);
      });
    }
    // Case 3: Single value property
    else if (attr?.type === 'Property' && attr.value !== undefined) {
      timestamps.forEach(() => {
        values.push(attr.value);
      });
    }

    return values;
  }

  private extractEntitySpecificData(attr: any): {
    timestamps: string[];
    values: any[];
  } {
    const timestamps = [];
    const values = [];

    // Case 1: Standard time series format
    if (
      Array.isArray(attr) &&
      attr.length > 0 &&
      attr[0]?.type === 'Property' &&
      attr[0]?.observedAt
    ) {
      const sortedAttr = [...attr].sort((a, b) =>
        a.observedAt.localeCompare(b.observedAt),
      );

      sortedAttr.forEach((item) => {
        if (item.observedAt && item.value !== undefined) {
          timestamps.push(item.observedAt);
          values.push(item.value);
        }
      });
    }
    // Case 2: Aggregated data with avg array
    else if (attr?.type === 'Property' && attr.avg && Array.isArray(attr.avg)) {
      const sortedAvg = [...attr.avg].sort((a, b) => a[1].localeCompare(b[1]));

      sortedAvg.forEach((item) => {
        if (Array.isArray(item) && item.length >= 2) {
          timestamps.push(item[1]);
          values.push(item[0]);
        }
      });
    }
    // Case 3: Single value property
    else if (attr?.type === 'Property' && attr.value !== undefined) {
      timestamps.push(new Date().toISOString());
      values.push(attr.value);
    }

    return { timestamps, values };
  }
}
