import { Inject, Injectable } from '@nestjs/common';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  authData,
  AuthData,
  NewAuthData,
} from '@app/postgres-db/schemas/auth-data.schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class AuthDataRepo {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getAll(): Promise<AuthData[]> {
    return this.db.select().from(authData).orderBy(authData.name);
  }

  async getByTenant(tenantAbbreviation: string): Promise<AuthData[]> {
    return this.db
      .select()
      .from(authData)
      .where(eq(authData.tenantAbbreviation, tenantAbbreviation));
  }

  async getById(id: string): Promise<AuthData> {
    const result = await this.db
      .select()
      .from(authData)
      .where(eq(authData.id, id));

    return result.length > 0 ? result[0] : null;
  }

  async create(row: NewAuthData, transaction?: DbType): Promise<AuthData> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const createdAuthDatas = await dbActor
      .insert(authData)
      .values(row)
      .returning();

    return createdAuthDatas.length > 0 ? createdAuthDatas[0] : null;
  }

  async update(
    id: string,
    values: Partial<AuthData>,
    transaction?: DbType,
  ): Promise<AuthData> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const updatedAuthData = await dbActor
      .update(authData)
      .set(values)
      .where(eq(authData.id, id))
      .returning();

    return updatedAuthData.length > 0 ? updatedAuthData[0] : null;
  }

  async delete(id: string): Promise<AuthData> {
    const result = await this.db
      .delete(authData)
      .where(eq(authData.id, id))
      .returning();

    return result.length > 0 ? result[0] : null;
  }
}
