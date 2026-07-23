import { Inject, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { eq } from 'drizzle-orm';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { dataSources } from '@app/postgres-db/schemas/data-source.schema';
import { AuthData, authData } from '@app/postgres-db/schemas/auth-data.schema';
import { EncryptionUtil } from 'apps/dashboard-service/src/util/encryption.util';
import { QueryConfig } from '@app/postgres-db/schemas/query-config.schema';

export type UsiEventType = {
  name: string;
  sensors: string[];
  attributes: string[];
};

interface SensorDataItem {
  timestamp?: string;
  data_timestamp?: string;
  [key: string]: string | number | undefined;
}

interface SensorResponse {
  sensordata: SensorDataItem[];
}

export interface NGSIv2Entity {
  entityId: string;
  index: string[];
  values: (number | string | { type: 'Point'; coordinates: number[] })[];
}

export interface NGSIv2Type {
  entities: NGSIv2Entity[];
}

export type NGSIv2AttributeData = {
  attrName: string;
  types: NGSIv2Type[];
};

@Injectable()
export class QueryConfigService {
  private readonly logger = new Logger(QueryConfigService.name);

  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getEventTypes(apiId?: string): Promise<UsiEventType[]> {
    try {
      const authData = await this.getUsiAuthData(apiId);
      const url = `${authData.apiUrl}/eventtypes`;
      const response = await axios.get(url, {
        auth: {
          username: authData.appUser,
          password: EncryptionUtil.decryptPassword(
            authData.appUserPassword as object,
          ),
        },
      });

      const transformedData = response.data.eventtypes.map((eventType) => ({
        name: eventType.name,
        sensors: eventType.sensors,
        attributes: Object.keys(eventType.description),
      }));

      return transformedData;
    } catch (error) {
      this.logger.error('Failed to fetch event types:', error);
      throw new Error('Failed to fetch event types');
    }
  }

  async getSensors(eventType: string, apiId?: string): Promise<string[]> {
    try {
      const authData = await this.getUsiAuthData(apiId);
      const url = `${authData.apiUrl}/${eventType}/sensors`;
      const response = await axios.get(url, {
        auth: {
          username: authData.appUser,
          password: EncryptionUtil.decryptPassword(
            authData.appUserPassword as object,
          ),
        },
      });
      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch sensors for event type ${eventType}:`,
        error,
      );
      throw new Error(`Failed to fetch sensors for event type ${eventType}`);
    }
  }

  async getSensorData(
    queryConfig: QueryConfig,
  ): Promise<{ attrs: NGSIv2AttributeData[] }> {
    try {
      const authData = await this.getUsiAuthData(queryConfig.dataSourceId);
      const decryptedPassword = EncryptionUtil.decryptPassword(
        authData.appUserPassword as object,
      );
      const constructedDateParameter = this.constructDateUrlParam(
        queryConfig.timeframe,
        queryConfig.dataStartDate,
        queryConfig.dataUntilDate,
      );
      const attrMap = new Map<string, NGSIv2Entity[]>();

      queryConfig.attributes.forEach((attr) => attrMap.set(attr, []));
      for (const id of queryConfig.entityIds) {
        const urlWithTimeFrame = `${authData.liveUrl}?sid=${id}&${constructedDateParameter}`;
        let response = await axios.get(urlWithTimeFrame, {
          auth: { username: authData.appUser, password: decryptedPassword },
        });

        if (
          !response.data?.sensordata ||
          response.data.sensordata.length === 0
        ) {
          this.logger.log(
            `No data found in timeframe for sensor ${id}. Fetching last known value fallback.`,
          );

          const urlForLatestValue = `${authData.liveUrl}?sid=${id}`;
          response = await axios.get(urlForLatestValue, {
            auth: { username: authData.appUser, password: decryptedPassword },
          });
        }

        for (const attr of queryConfig.attributes) {
          const entity = this.transformToOneSensorEntity(
            response.data,
            queryConfig.aggrMode,
            queryConfig.aggrPeriod,
            attr,
            id,
          );
          attrMap.get(attr)?.push(entity);
        }
      }

      if (attrMap.has('lat') && attrMap.has('lon')) {
        const latEntities = attrMap.get('lat') || [];
        const lonEntities = attrMap.get('lon') || [];
        const locationEntities: NGSIv2Entity[] = [];

        for (const latEntity of latEntities) {
          const lonEntity = lonEntities.find(
            (e) => e.entityId === latEntity.entityId,
          );
          if (lonEntity) {
            const combinedValues = latEntity.values.map(
              (
                latVal,
                idx,
              ):
                | (string | number | { type: 'Point'; coordinates: number[] })
                | null => {
                const lonVal = lonEntity.values[idx];
                if (
                  latVal !== null &&
                  lonVal !== null &&
                  latVal !== undefined &&
                  lonVal !== undefined
                ) {
                  return {
                    type: 'Point',
                    coordinates: [Number(latVal), Number(lonVal)],
                  };
                }
                return null;
              },
            );

            locationEntities.push({
              entityId: latEntity.entityId,
              index: [...latEntity.index],
              values: combinedValues,
            });
          }
        }

        if (locationEntities.length > 0) {
          attrMap.set('location', locationEntities);
          // Clean up individual raw lat/lon values to preserve payload weight
          attrMap.delete('lat');
          attrMap.delete('lon');
        }
      }

      const result = {
        attrs: Array.from(attrMap.entries()).map(([name, entities]) => ({
          attrName: name,
          types: [{ entities }],
        })),
      };
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to fetch historic data for sensor ${queryConfig.dataSourceId}:`,
        error,
      );
      throw new Error(
        `Failed to fetch historic data for sensor ${queryConfig.dataSourceId}`,
      );
    }
  }

  private constructDateUrlParam(
    timeFrame: string,
    dataStartDate?: Date,
    dataUntilDate?: Date,
  ): string {
    const isUserDefined = timeFrame === 'user_defined';

    const since = isUserDefined
      ? dataStartDate
      : this.getPreviousDate(timeFrame);
    const until = isUserDefined && dataUntilDate ? dataUntilDate : new Date();

    const formattedStart = encodeURIComponent(
      this.formatToStructureDate(since),
    );
    const formattedUntil = encodeURIComponent(
      this.formatToStructureDate(until),
    );

    return `&since=${formattedStart}&until=${formattedUntil}`;
  }

  private getPreviousDate(interval): Date {
    const date = new Date();

    switch (interval) {
      case 'live':
        date.setHours(date.getHours() - 1);
        break;
      case 'hour':
        date.setHours(date.getHours() - 1);
        break;
      case 'day':
        date.setDate(date.getDate() - 1);
        break;
      case 'week':
        date.setDate(date.getDate() - 7);
        break;
      case 'month':
        date.setMonth(date.getMonth() - 1);
        break;
      case 'quarter':
        date.setMonth(date.getMonth() - 3);
        break;
      case 'year':
        date.setFullYear(date.getFullYear() - 1);
        break;
      case 'year2':
        date.setFullYear(date.getFullYear() - 2);
        break;
      case 'year3':
        date.setFullYear(date.getFullYear() - 3);
        break;
      default:
        return date; // Returns "now" if no match
    }

    return date;
  }

  private formatToStructureDate(date: Date): string {
    const pad = (num: number): string => num.toString().padStart(2, '0');
    const ms = date.getMilliseconds().toString().padStart(3, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    // Calculate Timezone Offset (+0100)
    const offset = -date.getTimezoneOffset();
    const diff = offset >= 0 ? '+' : '-';
    const offsetHours = pad(Math.floor(Math.abs(offset) / 60));
    const offsetMinutes = pad(Math.abs(offset) % 60);

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}${diff}${offsetHours}${offsetMinutes}`;
  }

  private getUsiAuthData(apiId: string): Promise<AuthData> {
    return this.db
      .select()
      .from(dataSources)
      .leftJoin(authData, eq(dataSources.authDataId, authData.id))
      .where(eq(dataSources.id, apiId))
      .then((result): AuthData => {
        if (result.length === 0) {
          this.logger.error(`No datasource found with id: ${apiId}`);
          throw new Error('No datasource found with this id');
        }

        return result[0].auth_data;
      });
  }

  private transformToOneSensorEntity(
    response: SensorResponse,
    aggregationMode: string,
    aggregationPeriod: string,
    attrName: string,
    sensorId: string,
  ): NGSIv2Entity {
    if (aggregationMode === 'none') {
      const index: string[] = [];
      const values: (number | string)[] = [];

      response.sensordata.forEach((item) => {
        const timestamp = item?.data_timestamp ?? item?.timestamp;
        if (timestamp) {
          index.push(new Date(timestamp).toISOString().replace('Z', '+00:00'));
          values.push(item[attrName] ?? null);
        }
      });

      return {
        entityId: sensorId,
        index,
        values,
      };
    }

    const buckets = new Map<string, (number | string)[]>();
    response.sensordata.forEach((item) => {
      const rawDate = new Date(item.data_timestamp ?? item.timestamp);
      const bucketKey = this.getBucketKey(rawDate, aggregationPeriod);
      const val = item[attrName];
      if (val !== null && val !== undefined) {
        if (!buckets.has(bucketKey)) {
          buckets.set(bucketKey, []);
        }
        buckets.get(bucketKey)!.push(val);
      }
    });

    const sortedKeys = Array.from(buckets.keys()).sort();

    return {
      entityId: sensorId,
      index: sortedKeys.map((key) =>
        new Date(key).toISOString().replace('Z', '+00:00'),
      ),
      values: sortedKeys.map((key) => {
        const values = buckets.get(key)!;
        return this.applyAggregation(values, aggregationMode);
      }) as (number | string)[],
    };
  }

  private applyAggregation(
    values: (number | string | { type: 'Point'; coordinates: number[] })[],
    mode: string,
  ): number | string | { type: 'Point'; coordinates: number[] } {
    if (values.length === 0) return 0;

    if (typeof values[0] === 'number') {
      const nums = values as number[];
      switch (mode) {
        case 'avg':
          return nums.reduce((a, b) => a + b, 0) / nums.length;
        case 'min':
          return Math.min(...nums);
        case 'max':
          return Math.max(...nums);
        case 'sum':
          return nums.reduce((a, b) => a + b, 0);
        default:
          // Safely return the latest number if mode doesn't match standard math types
          return nums[nums.length - 1];
      }
    }

    return values[values.length - 1];
  }

  private getBucketKey(date: Date, period: string): string {
    const d = new Date(date);
    if (period === 'year') {
      d.setMonth(0, 1);
      d.setHours(0, 0, 0, 0);
    } else if (period === 'month') {
      d.setDate(1);
      d.setHours(0, 0, 0, 0);
    } else if (period === 'day') {
      d.setHours(0, 0, 0, 0);
    } else if (period === 'hour') {
      d.setMinutes(0, 0, 0);
    } else if (period === 'minute') {
      d.setSeconds(0, 0);
    }

    return d.toISOString();
  }
}
