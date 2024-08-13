import { Inject, Injectable } from '@nestjs/common';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  SensorReport,
  sensorReports,
} from '@app/postgres-db/schemas/sensor-report.schema';
import { QueryService } from '../query/query.service';
import { DataService } from '../data/data.service';

@Injectable()
export class ReportService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly queryService: QueryService,
    private readonly dataService: DataService,
  ) {}

  async updateReportData(): Promise<void> {
    const sensorReports = await this.getReportConfigurations();

    for (const report of sensorReports) {
      const queryBatchMap = await this.queryService.getQueryHashMap(
        report.queryId,
      );
      const [queryBatch] = queryBatchMap.values();

      // Disable aggregation for report values
      queryBatch.query_config.aggrMode = 'none';

      const data = await this.dataService.getDataFromDataSource(queryBatch);

      if (data) {
        await this.queryService.setQueryDataOfBatch(queryBatch, data);
      }
    }
  }

  async getReportConfigurations(): Promise<SensorReport[]> {
    return this.db.select().from(sensorReports);
  }
}
