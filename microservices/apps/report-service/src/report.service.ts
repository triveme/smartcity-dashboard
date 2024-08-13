import { Injectable } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import { QueryService } from './query/query.service';
import { Query } from '@app/postgres-db/schemas/query.schema';
import { SensorReport } from '@app/postgres-db/schemas/sensor-report.schema';
import { MailService } from './mail/mail.service';

@Injectable()
export class ReportService {
  constructor(
    private readonly configService: ConfigService,
    private readonly queryService: QueryService,
    private readonly mailService: MailService,
  ) {}

  async runSchedule(): Promise<void> {
    const reportConfigs = await this.configService.getConfigs();
    const queries =
      await this.queryService.getQueriesForReportConfigs(reportConfigs);

    for (const reportConfig of reportConfigs) {
      this.checkReportThreshold(queries, reportConfig);
    }
  }

  private checkReportThreshold(
    queries: Array<Query>,
    reportConfig: SensorReport,
  ): void {
    const reportQueries = queries.filter((query) => {
      return query.id === reportConfig.queryId;
    });

    if (reportQueries.length === 0) return;

    const reportQueryData = reportQueries[0].reportData as object;

    const shouldNotify = this.checkThreshold(reportConfig, reportQueryData);

    if (shouldNotify) this.mailService.notify(reportConfig, reportQueryData);
  }

  private checkThreshold(
    reportConfig: SensorReport,
    reportQueryData: object,
  ): boolean {
    const valueObject = reportQueryData[reportConfig.propertyName];

    switch (reportConfig.trigger) {
      case 'exceeding':
        return this.checkExceedingThreshold(
          valueObject.value,
          reportConfig.threshold,
        );
      case 'falls below':
        return this.checkFallsBelowThreshold(
          valueObject.value,
          reportConfig.threshold,
        );
      case 'equals':
        return this.checkEqualsThreshold(
          valueObject.value,
          reportConfig.threshold,
        );
      default:
        return false;
    }
  }

  private checkExceedingThreshold(
    value: string | number,
    threshold: string,
  ): boolean {
    return isNaN(+value) || isNaN(+threshold)
      ? false
      : Number(value) > Number(threshold);
  }

  private checkFallsBelowThreshold(
    value: string | number,
    threshold: string,
  ): boolean {
    return isNaN(+value) || isNaN(+threshold)
      ? false
      : Number(value) < Number(threshold);
  }

  private checkEqualsThreshold(
    value: string | number,
    threshold: string,
  ): boolean {
    return value == threshold;
  }
}
