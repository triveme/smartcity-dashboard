import {
  SensorReport,
  sensorReports,
} from '@app/postgres-db/schemas/sensor-report.schema';
import { DbType } from '@app/postgres-db';
import { queries, Query } from '@app/postgres-db/schemas/query.schema';
import { v4 as uuid } from 'uuid';

export function getSensorReport(): SensorReport {
  return {
    id: '',
    queryId: null,
    propertyName: 'temperature',
    threshold: '33',
    trigger: 'exceeding',
    recipients: ['test@test.de', 'scs@test.de'],
    mailText:
      'Sensor {{sensor}} exceeded threshold {{threshold}} by reaching value {{value}}.',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function createSensorReportByObject(
  db: DbType,
  sensorReport: SensorReport,
): Promise<SensorReport> {
  sensorReport.id = uuid();

  if (!sensorReport.queryId) {
    const query = await createQueryByObject(db, getNGSIQuery());
    sensorReport.queryId = query.id;
  }

  const dbSensorReports = await db
    .insert(sensorReports)
    .values(sensorReport)
    .returning();

  return dbSensorReports.length > 0 ? dbSensorReports[0] : null;
}

export function getNGSIQuery(): Query {
  return {
    id: uuid(),
    queryConfigId: null,
    queryData: {
      id: '173889_DiDoZWegener',
      type: 'WeatherObserved',
      absolutePressure: {
        type: 'Number',
        value: 988.4869491,
        metadata: {},
      },
      apparentTemperature: {
        type: 'Number',
        value: 20.83,
        metadata: {},
      },
      dewPoint: {
        type: 'Number',
        value: 13.72,
        metadata: {},
      },
      feelsLikeTemperature: {
        type: 'Number',
        value: 20.5,
        metadata: {},
      },
      gustSpeed: {
        type: 'Number',
        value: 5.4717696,
        metadata: {},
      },
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [8.761168, 51.625673],
        },
        metadata: {},
      },
      precipitation: {
        type: 'Number',
        value: 0,
        metadata: {},
      },
      relativeHumidity: {
        type: 'Number',
        value: 65,
        metadata: {},
      },
      relativePressure: {
        type: 'Number',
        value: 988.4869491,
        metadata: {},
      },
      solar: {
        type: 'Number',
        value: 116.6,
        metadata: {},
      },
      stationType: {
        type: 'String',
        value: 'EasyWeatherPro_V5.1.1',
        metadata: {},
      },
      temperature: {
        type: 'Number',
        value: 20.5,
        metadata: {},
      },
      uVIndexMax: {
        type: 'Number',
        value: 1,
        metadata: {},
      },
      windDirection: {
        type: 'Number',
        value: 184,
        metadata: {},
      },
      windSpeed: {
        type: 'Number',
        value: 4.3452288,
        metadata: {},
      },
    },
    reportData: {
      id: '173889_DiDoZWegener',
      type: 'WeatherObserved',
      absolutePressure: {
        type: 'Number',
        value: 988.4869491,
        metadata: {},
      },
      apparentTemperature: {
        type: 'Number',
        value: 20.83,
        metadata: {},
      },
      dewPoint: {
        type: 'Number',
        value: 13.72,
        metadata: {},
      },
      feelsLikeTemperature: {
        type: 'Number',
        value: 20.5,
        metadata: {},
      },
      gustSpeed: {
        type: 'Number',
        value: 5.4717696,
        metadata: {},
      },
      location: {
        type: 'geo:json',
        value: {
          type: 'Point',
          coordinates: [8.761168, 51.625673],
        },
        metadata: {},
      },
      precipitation: {
        type: 'Number',
        value: 0,
        metadata: {},
      },
      relativeHumidity: {
        type: 'Number',
        value: 65,
        metadata: {},
      },
      relativePressure: {
        type: 'Number',
        value: 988.4869491,
        metadata: {},
      },
      solar: {
        type: 'Number',
        value: 116.6,
        metadata: {},
      },
      stationType: {
        type: 'String',
        value: 'EasyWeatherPro_V5.1.1',
        metadata: {},
      },
      temperature: {
        type: 'Number',
        value: 20.5,
        metadata: {},
      },
      uVIndexMax: {
        type: 'Number',
        value: 1,
        metadata: {},
      },
      windDirection: {
        type: 'Number',
        value: 184,
        metadata: {},
      },
      windSpeed: {
        type: 'Number',
        value: 4.3452288,
        metadata: {},
      },
    },
    updateMessage: ['message1', 'message2'],
    createdAt: undefined,
    updatedAt: undefined,
  };
}

export async function createQueryByObject(
  db: DbType,
  query: Query,
): Promise<Query> {
  query.id = uuid();

  const createdQueries = await db.insert(queries).values(query).returning();

  return createdQueries.length > 0 ? createdQueries[0] : null;
}
