import {
  SensorReport,
  sensorReports,
} from '@app/postgres-db/schemas/sensor-report.schema';
import { v4 as uuid } from 'uuid';
import {
  createQuery,
  getNGSILiveQuery,
} from '../../../../dashboard-service/src/query/test/test-data';
import { DbType } from '@app/postgres-db';

export async function getSensorReport(
  db: DbType,
  queryId?: string,
): Promise<SensorReport> {
  if (!queryId) {
    const query = await createQuery(db, getNGSILiveQuery());
    queryId = query.id;
  }

  return {
    id: uuid(),
    queryId: queryId,
    propertyName: 'temperature',
    threshold: '20',
    trigger: 'falls below',
    recipients: ['test@smart-city.de'],
    mailText: 'This is a test e-mail.',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function createSensorReport(
  db: DbType,
  sensorReport: SensorReport,
): Promise<SensorReport> {
  const results = await db
    .insert(sensorReports)
    .values(sensorReport)
    .returning();
  return results.length > 0 ? results[0] : null;
}
