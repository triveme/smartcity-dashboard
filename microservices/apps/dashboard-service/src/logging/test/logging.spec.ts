import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DashboardServiceModule } from '../../dashboard-service.module';
import { DashboardServiceLogger } from '../logger.service';
import { deleteLogPath, isLogFileExisting } from './test-util';
import { config } from 'dotenv';
import axios from 'axios';

config({
  path: '.env.testing',
});

describe('Dashboard Logging Service (e2e)', () => {
  let app: INestApplication;
  let loggingService: DashboardServiceLogger;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DashboardServiceModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    loggingService = module.get<DashboardServiceLogger>(DashboardServiceLogger);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Logging Service', () => {
    beforeAll(() => {
      jest.spyOn(Date, 'now').mockReturnValue(1724403458470);
    });

    afterEach(() => {
      deleteLogPath();
    });

    it('should log to file', () => {
      loggingService.log('Test Log', 'Dashboard Service');

      const logFileContent = loggingService.getAll();
      expect(logFileContent).toContain(
        '[23.08.2024, 10:57:38][Dashboard Service][LOG]: Test Log',
      );
    });

    it('should error to file', () => {
      loggingService.error('Test Log', null, 'Dashboard Service');

      const logFileContent = loggingService.getAll();
      expect(logFileContent).toContain(
        '[23.08.2024, 10:57:38][Dashboard Service][ERROR]: Test Log',
      );
    });

    it('should warn to file', () => {
      loggingService.warn('Test Log', 'Dashboard Service');

      const logFileContent = loggingService.getAll();
      expect(logFileContent).toContain(
        '[23.08.2024, 10:57:38][Dashboard Service][WARN]: Test Log',
      );
    });

    it('should debug to file', () => {
      loggingService.debug('Test Log', 'Dashboard Service');

      const logFileContent = loggingService.getAll();
      expect(logFileContent).toContain(
        '[23.08.2024, 10:57:38][Dashboard Service][DEBUG]: Test Log',
      );
    });

    it('should verbose to file', () => {
      loggingService.verbose('Test Log', 'Dashboard Service');

      const logFileContent = loggingService.getAll();
      expect(logFileContent).toContain(
        '[23.08.2024, 10:57:38][Dashboard Service][VV]: Test Log',
      );
    });

    it('should fatal to file', () => {
      const reportString =
        '[23.08.2024, 10:57:38][Dashboard Service][FATAL]: Test Log - Error Stack';
      const mailServiceUrl = process.env.NEXT_PUBLIC_MAIL_SERVICE_URL;
      const defectReportMail = process.env.DEFECT_REPORT_EMAIL;

      const spyInstance = jest
        .spyOn(axios, 'post')
        .mockReturnValue(Promise.resolve());

      loggingService.fatal('Test Log', 'Error Stack', 'Dashboard Service');

      const logFileContent = loggingService.getAll();
      expect(logFileContent).toContain(reportString);
      expect(spyInstance).toHaveBeenCalledWith(`${mailServiceUrl}/mail/send`, {
        to: defectReportMail,
        subject: 'Dashboardservice FATAL!',
        body: reportString,
      });
    });

    it('rotate logs', () => {
      loggingService.log('Test Log', 'Dashboard Service');

      expect(isLogFileExisting()).toBeTruthy();
      expect(loggingService.getAll()).toContain(
        '[23.08.2024, 10:57:38][Dashboard Service][LOG]: Test Log',
      );

      loggingService.runSchedule();

      expect(isLogFileExisting()).toBeTruthy();
      expect(loggingService.getAll()).toBe('');
    });
  });
});
