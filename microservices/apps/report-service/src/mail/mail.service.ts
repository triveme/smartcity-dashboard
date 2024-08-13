import { Injectable } from '@nestjs/common';
import { SensorReport } from '@app/postgres-db/schemas/sensor-report.schema';
import axios from 'axios';
import { SendMailDto } from '../dto/mail.dto';

@Injectable()
export class MailService {
  notify(reportConfig: SensorReport, reportQueryData: object): void {
    const mailServiceUrl = process.env.NEXT_PUBLIC_MAIL_SERVICE_URL;
    const value = reportQueryData[reportConfig.propertyName];
    const id = reportQueryData['id'];

    const payload: SendMailDto = {
      to: reportConfig.recipients.join(','),
      subject: 'Sensor Threshold',
      body: reportConfig.mailText
        .replace('{{sensor}}', id)
        .replace('{{threshold}}', reportConfig.threshold)
        .replace('{{value}}', value),
    };

    try {
      axios.post(`${mailServiceUrl}/mail/send`, payload);
    } catch (error) {
      console.error(error);
    }
  }
}
