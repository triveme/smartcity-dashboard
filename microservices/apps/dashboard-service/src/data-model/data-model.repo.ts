import { Inject, Injectable } from '@nestjs/common';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { eq } from 'drizzle-orm';
import {
  DataModel,
  dataModels,
  NewDataModel,
} from '@app/postgres-db/schemas/data-model.schema';

@Injectable()
export class DataModelRepo {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getAll(): Promise<DataModel[]> {
    return this.db.select().from(dataModels);
  }

  async getById(id: string): Promise<DataModel> {
    const result = await this.db
      .select()
      .from(dataModels)
      .where(eq(dataModels.id, id));

    return result.length > 0 ? result[0] : null;
  }

  async create(row: NewDataModel): Promise<DataModel> {
    const result = await this.db.insert(dataModels).values(row).returning();

    return result.length > 0 ? result[0] : null;
  }

  async update(id: string, values: Partial<DataModel>): Promise<DataModel> {
    const result = await this.db
      .update(dataModels)
      .set(values)
      .where(eq(dataModels.id, id))
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async delete(id: string): Promise<DataModel> {
    const result = await this.db
      .delete(dataModels)
      .where(eq(dataModels.id, id))
      .returning();

    return result.length > 0 ? result[0] : null;
  }
}
