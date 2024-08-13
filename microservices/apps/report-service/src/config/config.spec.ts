import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ReportModule } from '../report.module';
import { Client } from 'pg';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  runLocalDatabasePreparation,
  truncateTables,
} from '../../../test/database-operations/prepare-database';
import { createSensorReportByObject, getSensorReport } from '../test/test-data';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';
import { sensorReports } from '@app/postgres-db/schemas/sensor-report.schema';

describe('DashboardServiceControllers (e2e)', () => {
  let app: INestApplication;
  let client: Client;
  let db: DbType;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ReportModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    client = await runLocalDatabasePreparation();
    db = module.get<DbType>(POSTGRES_DB);
  });

  beforeEach(async () => {
    await truncateTables(client);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Report Configs', () => {
    it('/configs (POST)', async () => {
      const sensorReport = getSensorReport();
      sensorReport.id = uuid();

      delete sensorReport.createdAt;
      delete sensorReport.updatedAt;

      const response = await request(app.getHttpServer())
        .post('/configs')
        .send(sensorReport)
        .expect(201);

      expect(response.body).toMatchObject(sensorReport);
    });

    it('/configs (GET)', async () => {
      await createSensorReportByObject(db, getSensorReport());
      await createSensorReportByObject(db, getSensorReport());

      const response = await request(app.getHttpServer())
        .get('/configs')
        .expect(200);

      const attributeNames = Object.keys(sensorReports);

      for (const sensorReport of response.body) {
        for (const attributeName of attributeNames) {
          expect(sensorReport).toHaveProperty(attributeName);

          const columnDefinition = sensorReports[attributeName];
          if (columnDefinition.notNull) {
            expect(sensorReports[attributeName]).not.toBeNull();
          }
        }
      }
    });

    it('/configs/:id (DELETE)', async () => {
      await createSensorReportByObject(db, getSensorReport());
      const sensorReport = await createSensorReportByObject(
        db,
        getSensorReport(),
      );

      const response = await request(app.getHttpServer())
        .delete(`/configs/${sensorReport.id}`)
        .expect(200);

      const attributeNames = Object.keys(sensorReports);

      for (const attributeName of attributeNames) {
        expect(response.body).toHaveProperty(attributeName);

        const columnDefinition = sensorReports[attributeName];
        if (columnDefinition.notNull) {
          expect(sensorReports[attributeName]).not.toBeNull();
        }
      }
    });
  });
});
