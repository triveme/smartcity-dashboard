/* eslint-disable @typescript-eslint/no-unused-vars */
import { INestApplication } from '@nestjs/common';
import { Client } from 'pg';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { Test, TestingModule } from '@nestjs/testing';
import { runLocalDatabasePreparation } from '../../../test/database-operations/prepare-database';
import { MailService } from '../mail/mail.service';
import { ReportService } from '../report.service';
import {
  createQueryByObject,
  createSensorReportByObject,
  getNGSIQuery,
  getSensorReport,
} from './test-data';
import { ReportModule } from '../report.module';
import {
  createWidgetByObject,
  getWidget,
} from '../../../dashboard-service/src/widget/test/test-data';
import { getTab } from '../../../dashboard-service/src/tab/test/test-data';
import * as request from 'supertest';

describe('ReportService (e2e)', () => {
  let app: INestApplication;
  let db: DbType;
  let mailService: MailService;
  let reportService: ReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ReportModule],
    })
      .overrideProvider(MailService)
      .useValue({
        notify: () => {},
      })
      .compile();

    app = module.createNestApplication();
    await app.init();

    await runLocalDatabasePreparation();

    db = module.get<DbType>(POSTGRES_DB);
    reportService = module.get<ReportService>(ReportService);
    mailService = await module.resolve<MailService>(MailService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Report Service', () => {
    it('should trigger mail sending when exceeding threshold', async () => {
      const mailServiceSpy = jest.spyOn(mailService, 'notify');

      const ngsiQuery = getNGSIQuery();
      ngsiQuery.reportData['temperature'].value = 34;
      const query = await createQueryByObject(db, ngsiQuery);

      const sensorReportObject = getSensorReport();
      sensorReportObject.queryId = query.id;
      await createSensorReportByObject(db, sensorReportObject);

      await reportService.runSchedule();

      expect(mailServiceSpy).toBeCalledTimes(1);
    });

    it('should trigger mail sending when falling below threshold', async () => {
      const mailServiceSpy = jest.spyOn(mailService, 'notify');

      const ngsiQuery = getNGSIQuery();
      ngsiQuery.reportData['temperature'].value = 20;
      const query = await createQueryByObject(db, ngsiQuery);

      const sensorReportObject = getSensorReport();
      sensorReportObject.queryId = query.id;
      sensorReportObject.trigger = 'falls below';
      await createSensorReportByObject(db, sensorReportObject);

      await reportService.runSchedule();

      expect(mailServiceSpy).toBeCalledTimes(1);
    });

    it('should trigger mail sending when equalling threshold', async () => {
      const mailServiceSpy = jest.spyOn(mailService, 'notify');

      const ngsiQuery = getNGSIQuery();
      ngsiQuery.reportData['temperature'].value = 33;
      const query = await createQueryByObject(db, ngsiQuery);

      const sensorReportObject = getSensorReport();
      sensorReportObject.queryId = query.id;
      sensorReportObject.trigger = 'equals';
      await createSensorReportByObject(db, sensorReportObject);

      await reportService.runSchedule();

      expect(mailServiceSpy).toBeCalledTimes(1);
    });

    it('should not trigger mail sending', async () => {
      const mailServiceSpy = jest.spyOn(mailService, 'notify');

      const ngsiQuery = getNGSIQuery();
      const query = await createQueryByObject(db, ngsiQuery);

      const sensorReportObject = getSensorReport();
      sensorReportObject.queryId = query.id;
      await createSensorReportByObject(db, sensorReportObject);

      await reportService.runSchedule();

      expect(mailServiceSpy).not.toHaveBeenCalled();
    });
  });
});
