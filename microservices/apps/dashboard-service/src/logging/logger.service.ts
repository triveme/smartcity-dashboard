import { Injectable, LoggerService } from '@nestjs/common';
import { readLogs, rotateLogs, writeLogfile } from './loggingUtilities';
import { Cron } from '@nestjs/schedule';
import { SendMailDto } from '../../../report-service/src/dto/mail.dto';
import axios from 'axios';

@Injectable()
export class DashboardServiceLogger implements LoggerService {
  constructor() {}

  log(message: string, context?: string): void {
    const report = `[${this.getFormattedDate()}][${context}][LOG]: ${message}`;
    writeLogfile(report);
    console.log(report);
  }

  error(message: string, stack?: string, context?: string): void {
    const report = `[${this.getFormattedDate()}][${context}][ERROR]: ${message} - ${stack}`;
    writeLogfile(report);
    console.error(report, stack);
  }

  warn(message: string, context?: string): void {
    const report = `[${this.getFormattedDate()}][${context}][WARN]: ${message}`;
    writeLogfile(report);
    console.warn(report);
  }

  debug(message: string, context?: string): void {
    const report = `[${this.getFormattedDate()}][${context}][DEBUG]: ${message}`;
    writeLogfile(report);
    console.log(report);
  }

  verbose(message: string, context?: string): void {
    const report = `[${this.getFormattedDate()}][${context}][VV]: ${message}`;
    writeLogfile(report);
    console.log(report);
  }

  fatal(message: string, stack?: string, context?: string): void {
    const report = `[${this.getFormattedDate()}][${context}][FATAL]: ${message} - ${stack}`;
    writeLogfile(report);
    this.sendLogMail(report);
    console.error(report, stack);
  }

  @Cron(process.env.LOG_ROTATION_CRON || '3 2 * * * *') // 2:03
  async runSchedule(): Promise<void> {
    rotateLogs();
  }

  getAll(): string {
    return readLogs();
  }

  private getFormattedDate(): string {
    const date = new Date(Date.now());

    return date.toLocaleString('de-DE', {
      timeZone: 'Europe/Berlin',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  private sendLogMail(report: string): void {
    const mailServiceUrl = process.env.NEXT_PUBLIC_MAIL_SERVICE_URL;
    const defectReportMail = process.env.DEFECT_REPORT_EMAIL;

    const payload: SendMailDto = {
      to: defectReportMail,
      subject: 'Dashboardservice FATAL!',
      body: report,
    };

    try {
      axios.post(`${mailServiceUrl}/mail/send`, payload);
    } catch (error) {
      console.error(error);
    }
  }
}
