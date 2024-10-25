import { Inject, Injectable } from '@nestjs/common';
import { and, eq, isNull } from 'drizzle-orm';

import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  GroupingElement,
  groupingElements,
  NewGroupingElement,
} from '@app/postgres-db/schemas/dashboard.grouping-element.schema';

export type GroupingElementWithChildren = GroupingElement & {
  children: GroupingElementWithChildren[];
};

@Injectable()
export class GroupingElementRepo {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getAll(): Promise<GroupingElement[]> {
    return this.db
      .select()
      .from(groupingElements)
      .orderBy(groupingElements.position);
  }

  async getByTenantAbbreviation(
    abbreviation: string,
  ): Promise<GroupingElement[]> {
    return this.db
      .select()
      .from(groupingElements)
      .where(eq(groupingElements.tenantAbbreviation, abbreviation))
      .orderBy(groupingElements.position);
  }

  async getById(id: string): Promise<GroupingElement> {
    const result = await this.db
      .select()
      .from(groupingElements)
      .where(eq(groupingElements.id, id));

    return result.length > 0 ? result[0] : null;
  }

  async getByUrl(url: string): Promise<GroupingElement> {
    const result = await this.db
      .select()
      .from(groupingElements)
      .where(eq(groupingElements.url, url));

    return result.length > 0 ? result[0] : null;
  }

  async getByUrlAndTenant(
    url: string,
    tenant: string,
  ): Promise<GroupingElement> {
    const result = await this.db
      .select()
      .from(groupingElements)
      .where(
        and(
          eq(groupingElements.url, url),
          eq(groupingElements.tenantAbbreviation, tenant),
        ),
      );

    return result.length > 0 ? result[0] : null;
  }

  async create(row: NewGroupingElement): Promise<GroupingElement> {
    const result = await this.db
      .insert(groupingElements)
      .values(row)
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async update(
    id: string,
    values: Partial<GroupingElement>,
    transaction?: DbType,
  ): Promise<GroupingElement> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const result = await dbActor
      .update(groupingElements)
      .set(values)
      .where(eq(groupingElements.id, id))
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async delete(id: string): Promise<GroupingElement> {
    const result = await this.db
      .delete(groupingElements)
      .where(eq(groupingElements.id, id))
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async deleteByUrl(
    url: string,
    transaction?: DbType,
  ): Promise<GroupingElement> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const result = await dbActor
      .delete(groupingElements)
      .where(eq(groupingElements.url, url))
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async getChildrenForGroupingElementById(
    parentId?: string,
  ): Promise<GroupingElement[]> {
    return this.db
      .select()
      .from(groupingElements)
      .where(
        parentId
          ? eq(groupingElements.parentGroupingElementId, parentId)
          : isNull(groupingElements.parentGroupingElementId),
      );
  }
}
