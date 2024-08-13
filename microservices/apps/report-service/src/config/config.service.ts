import { Inject, Injectable } from '@nestjs/common';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  SensorReport,
  sensorReports,
} from '@app/postgres-db/schemas/sensor-report.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class ConfigService {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getConfigs(): Promise<SensorReport[]> {
    return this.db.select().from(sensorReports);
  }

  async create(config: SensorReport): Promise<SensorReport> {
    const configs = await this.db
      .insert(sensorReports)
      .values(config)
      .returning();

    return configs.length > 0 ? configs[0] : null;
  }

  async getConfigByQueryId(queryId: string): Promise<SensorReport> {
    const configs = await this.db
      .select()
      .from(sensorReports)
      .where(eq(sensorReports.queryId, queryId));

    return configs.length > 0 ? configs[0] : null;
  }

  async updateConfigById(
    id: string,
    config: Partial<SensorReport>,
  ): Promise<SensorReport> {
    config.createdAt = new Date(config.createdAt);
    config.updatedAt = new Date(Date.now());

    const configs = await this.db
      .update(sensorReports)
      .set(config)
      .where(eq(sensorReports.id, id))
      .returning();

    return configs.length > 0 ? configs[0] : null;
  }

  async delete(id: string): Promise<SensorReport> {
    const configs = await this.db
      .delete(sensorReports)
      .where(eq(sensorReports.id, id))
      .returning();

    return configs.length > 0 ? configs[0] : null;
  }
}
