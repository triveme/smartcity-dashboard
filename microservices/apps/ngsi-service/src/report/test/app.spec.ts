import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { NgsiModule } from '../../ngsi.module';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  runLocalDatabasePreparation,
  truncateTables,
} from '../../../../test/database-operations/prepare-database';
import { ReportModule } from '../report.module';
import { Client } from 'pg';
import {
  createQuery,
  getNGSILiveQuery,
  getQueryById,
} from '../../../../dashboard-service/src/query/test/test-data';
import { createQueryConfig } from '../../../../dashboard-service/src/query-config/test/test-data';
import { ReportService } from '../report.service';
import { createSensorReport, getSensorReport } from './test-data';
import axios from 'axios';

// Currently skipping, since it's not really understandable how this should be running
describe('ReportService (e2e)', () => {
  let app: INestApplication;
  let reportService: ReportService;
  let db: DbType;
  let client: Client;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [NgsiModule, ReportModule],
      providers: [
        {
          provide: POSTGRES_DB,
          useValue: POSTGRES_DB,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    reportService = module.get<ReportService>(ReportService);

    client = await runLocalDatabasePreparation();
    db = module.get<DbType>(POSTGRES_DB);

    await truncateTables(client);
  });

  it('reportService should be defined', () => {
    expect(reportService).toBeDefined();
  });

  it('db should be defined', () => {
    expect(db).toBeDefined();
  });

  describe('Report Service Test', () => {
    it('should update report configurations', async () => {
      const queryConfig = await createQueryConfig(db);
      const query = await createQuery(db, getNGSILiveQuery(), queryConfig.id);
      const sensorReportValue = await getSensorReport(db, query.id);
      await createSensorReport(db, sensorReportValue);

      const queryData = getNGSILiveQuery().queryData;
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);
      jest.spyOn(axios, 'post').mockReturnValue(
        Promise.resolve({
          data: {
            access_token: 'validAccessToken',
            expires_in: 3600,
            refresh_token: 'validRefreshToken',
          },
        }),
      );
      jest.spyOn(axios, 'get').mockReturnValue(
        Promise.resolve({
          data: queryData,
        }),
      );

      await reportService.updateReportData();

      const dbQuery = await getQueryById(db, query.id);
      expect(dbQuery).not.toBeNull();
      expect(dbQuery).toBeDefined();
      expect(dbQuery.updatedAt).toStrictEqual(new Date(now));
    });
  });
});
