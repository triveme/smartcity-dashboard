import { Inject, Injectable } from '@nestjs/common';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { Defect, defects } from '@app/postgres-db/schemas/defect.schema';
import { desc } from 'drizzle-orm';
import { RoleUtil } from '../utility/RoleUtil';
import { checkRequiredRights } from '@app/auth-helper/right-management/right-management.service';

export type DefectCount = {
  count: number;
};

@Injectable()
export class DefectService {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getAll(roles: Array<string>): Promise<Defect[]> {
    let allDefectsResult = await this.db
      .select()
      .from(defects)
      .orderBy(desc(defects.createdAt));

    allDefectsResult = allDefectsResult.filter((defect) => {
      return checkRequiredRights(defect, defect.readRoles, roles);
    });

    return allDefectsResult;
  }

  async getCount(roles: Array<string>): Promise<DefectCount> {
    let countDefectResult = await this.db.select().from(defects);

    countDefectResult = countDefectResult.filter((defect) => {
      return checkRequiredRights(defect, defect.readRoles, roles);
    });

    return {
      count: countDefectResult.length,
    };
  }

  async create(row: Defect, roles: Array<string>): Promise<Defect> {
    RoleUtil.populateRoles(row, roles);

    const createdDefects = await this.db
      .insert(defects)
      .values(row)
      .returning();

    return createdDefects.length > 0 ? createdDefects[0] : null;
  }
}
