import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ApiService } from './api.service';
import { ReportService } from './report/report.service';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly apiService: ApiService,
    private readonly reportService: ReportService,
  ) {}

  @Cron('0 * * * * *') // every minute
  async runSchedule(): Promise<void> {
    await this.apiService.updateQueries();
    await this.reportService.updateReportData();
  }
}
