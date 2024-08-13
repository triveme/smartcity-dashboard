import { createQueryConfig } from '../../query-config/test/test-data';
import { queries, Query } from '@app/postgres-db/schemas/query.schema';
import { DbType } from '@app/postgres-db';
import { v4 as uuid } from 'uuid';

export function getNGSIQuery(queryConfigId: string): Query {
  return {
    id: uuid(),
    queryConfigId: queryConfigId,
    queryData: {
      id: '161726_DiDoZ_Ahle',
      type: 'WeatherObserved',
      absolutePressure: { type: 'Number', value: 991.5346992, metadata: {} },
      apparentTemperature: { type: 'Number', value: 18.5, metadata: {} },
      dewPoint: { type: 'Number', value: 11.56, metadata: {} },
      feelsLikeTemperature: { type: 'Number', value: 18, metadata: {} },
      gustSpeed: { type: 'Number', value: 3.218688, metadata: {} },
      lightning: { type: 'Number', value: 0, metadata: {} },
      location: {
        type: 'geo:json',
        value: { type: 'Point', coordinates: [8.75795, 51.626532] },
        metadata: {},
      },
      precipitation: { type: 'Number', value: 0, metadata: {} },
      relativeHumidity: { type: 'Number', value: 66, metadata: {} },
      relativePressure: { type: 'Number', value: 991.5346992, metadata: {} },
      solar: { type: 'Number', value: 150.2, metadata: {} },
      stationType: {
        type: 'String',
        value: 'EasyWeatherPro_V5.1.1',
        metadata: {},
      },
      temperature: { type: 'Number', value: 18, metadata: {} },
      uVIndexMax: { type: 'Number', value: 1, metadata: {} },
      windDirection: { type: 'Number', value: 242, metadata: {} },
      windSpeed: { type: 'Number', value: 0, metadata: {} },
    },
    reportData: {},
    updateMessage: ['message1', 'message2'],
    createdAt: undefined,
    updatedAt: undefined,
  };
}

export function getAPIQuery(queryConfigId: string): Query {
  return {
    id: uuid(),
    queryConfigId: queryConfigId,
    queryData: [
      {
        attribute1: 89.9,
        timestamp: '2024-04-22T10:13:00.000Z',
      },
    ],
    reportData: {},
    updateMessage: ['message1', 'message2'],
    createdAt: undefined,
    updatedAt: undefined,
  };
}

export async function createQuery(
  db: DbType,
  type?: 'ngsi-v2' | 'ngsi-ld' | 'api',
  queryConfigId?: string,
): Promise<Query> {
  type = type ? type : 'ngsi-v2';

  if (queryConfigId === undefined) {
    const queryConfig = await createQueryConfig(db, type);
    queryConfigId = queryConfig.id;
  }

  const createdQueries = await db
    .insert(queries)
    .values(
      type === 'ngsi-v2' || type === 'ngsi-ld'
        ? getNGSIQuery(queryConfigId)
        : getAPIQuery(queryConfigId),
    )
    .returning();

  return createdQueries.length > 0 ? createdQueries[0] : null;
}
