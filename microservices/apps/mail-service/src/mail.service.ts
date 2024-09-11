import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SendMailDto, DefectReportDto } from './dto/mail.dto';
import axios from 'axios';

type mailAttachment = {
  filename: string;
  content: string | Buffer;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendAutomatedMail(sendMailDto: SendMailDto): Promise<void> {
    try {
      const attachments: mailAttachment[] = [];
      const dashboardLog = await axios.get(
        process.env.DASHBOARD_SERVICE_URL + '/logs',
      );
      if (dashboardLog.status === 200) {
        attachments.push({
          filename: 'dashboard-service.log',
          content: dashboardLog.data,
        });
      }
      await this.transporter.sendMail({
        from: process.env.MAIL_USER,
        to: sendMailDto.to,
        subject: sendMailDto.subject,
        text: sendMailDto.body,
        attachments: attachments,
      });
      this.logger.log(`Automated email sent to ${sendMailDto.to}`);
    } catch (error) {
      this.logger.error(`Failed to send automated email: ${error.message}`);
      throw error;
    }
  }

  async sendDefectReport(defectReportDto: DefectReportDto): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: defectReportDto.reporterEmail,
        to: process.env.DEFECT_REPORT_EMAIL,
        subject: 'Defect Report',
        text: `Defect Details: ${defectReportDto.defectDetails}`,
      });
      this.logger.log(
        `Defect report submitted by ${defectReportDto.reporterEmail}`,
      );
    } catch (error) {
      this.logger.error(`Failed to submit defect report: ${error.message}`);
      throw error;
    }
  }
}
