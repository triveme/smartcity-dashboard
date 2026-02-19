// eslint-disable-next-line prettier/prettier
import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  NewPicture,
  Picture,
  picture,
} from '@app/postgres-db/schemas/picture.schema';

@Injectable()
export class InternalPictureDataService {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async create(values: NewPicture, transaction?: DbType): Promise<Picture> {
    const dbActor = transaction === undefined ? this.db : transaction;
    const result = await dbActor.insert(picture).values(values).returning();
    return result.length > 0 ? result[0] : null;
  }

  async delete(id: string, pId: string): Promise<Picture> {
    const deletedPictures = await this.db
      .delete(picture)
      .where(and(eq(picture.id, pId), eq(picture.projectId, id)))
      .returning();

    return deletedPictures.length > 0 ? deletedPictures[0] : null;
  }

  async getAll(id: string): Promise<Picture[]> {
    const result = await this.db
      .select()
      .from(picture)
      .where(and(eq(picture.projectId, id)));
    return result;
  }

  async getById(id: string, pId: string): Promise<Picture> {
    const result = await this.db
      .select()
      .from(picture)
      .where(and(eq(picture.id, pId), eq(picture.projectId, id)));
    return result[0];
  }
}
