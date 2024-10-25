import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MailController } from '../mail.controller';
import { MailService } from '../mail.service';
import { SendMailDto, DefectReportDto } from '../dto/mail.dto';

describe('MailController (e2e)', () => {
  let app: INestApplication;
  let mailService: MailService;

  // Creating mock methods to avoid sending real emails during tests
  const mockMailService = {
    sendAutomatedMail: jest.fn().mockResolvedValue(undefined),
    sendDefectReport: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MailController],
      providers: [
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    mailService = moduleFixture.get<MailService>(MailService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/mail/send (POST)', () => {
    it('should send an email successfully', async () => {
      const sendMailDto: SendMailDto = {
        to: 'test@example.com',
        subject: 'Test Subject',
        body: 'Test Body',
      };

      const response = await request(app.getHttpServer())
        .post('/mail/send')
        .send(sendMailDto)
        .expect(201);

      expect(response.text).toEqual('Mail sent successfully');
      expect(mailService.sendAutomatedMail).toHaveBeenCalledWith(sendMailDto);
    });

    it('should return 500 if sending email fails', async () => {
      const sendMailDto: SendMailDto = {
        to: 'test@example.com',
        subject: 'Test Subject',
        body: 'Test Body',
      };

      jest
        .spyOn(mailService, 'sendAutomatedMail')
        .mockRejectedValueOnce(new Error('Sending email failed'));

      const response = await request(app.getHttpServer())
        .post('/mail/send')
        .send(sendMailDto)
        .expect(500);

      expect(response.body.message).toEqual('Failed to send mail');
    });
  });

  describe('/mail/defect-report (POST)', () => {
    it('should submit a defect report successfully', async () => {
      const defectReportDto: DefectReportDto = {
        reporterEmail: 'reporter@example.com',
        defectDetails: 'Defect description...',
      };

      const response = await request(app.getHttpServer())
        .post('/mail/defect-report')
        .send(defectReportDto)
        .expect(201);

      expect(response.text).toEqual('Defect report submitted successfully');
      expect(mailService.sendDefectReport).toHaveBeenCalledWith(
        defectReportDto,
      );
    });

    it('should return 500 if submitting defect report fails', async () => {
      const defectReportDto: DefectReportDto = {
        reporterEmail: 'reporter@example.com',
        defectDetails: 'Defect description...',
      };

      jest
        .spyOn(mailService, 'sendDefectReport')
        .mockRejectedValueOnce(new Error('Submitting defect report failed'));

      const response = await request(app.getHttpServer())
        .post('/mail/defect-report')
        .send(defectReportDto)
        .expect(500);

      expect(response.body.message).toEqual('Failed to submit defect report');
    });
  });
});
