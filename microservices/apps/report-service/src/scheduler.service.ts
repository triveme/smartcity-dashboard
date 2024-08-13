import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ReportService } from './report.service';

@Injectable()
export class ScheduleService {
  constructor(private readonly reportService: ReportService) {}

  @Cron('0 * * * * *') // every minute
  async runSchedule(): Promise<void> {
    await this.reportService.runSchedule();
  }
}
