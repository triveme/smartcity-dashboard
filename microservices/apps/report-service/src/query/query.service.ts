import { Inject, Injectable } from '@nestjs/common';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { queries, Query } from '@app/postgres-db/schemas/query.schema';
import { inArray } from 'drizzle-orm';
import { SensorReport } from '@app/postgres-db/schemas/sensor-report.schema';

@Injectable()
export class QueryService {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getQueriesForReportConfigs(reports: SensorReport[]): Promise<Query[]> {
    const queryIds = reports.map((r) => r.queryId);

    return this.getQueriesByIds(queryIds);
  }

  async getQueriesByIds(queryIds: string[]): Promise<Query[]> {
    return this.db.select().from(queries).where(inArray(queries.id, queryIds));
  }
}
