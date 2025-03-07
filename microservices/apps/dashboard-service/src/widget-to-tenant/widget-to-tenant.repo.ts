import { Inject, Injectable } from '@nestjs/common';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  widgetsToTenants,
  WidgetToTenant,
} from '@app/postgres-db/schemas/widget-to-tenant.schema';
import { and, eq } from 'drizzle-orm';

@Injectable()
export class WidgetToTenantRepo {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getWidgetToTenantRelationshipByWidgetId(
    widgetId: string,
  ): Promise<WidgetToTenant> {
    const widgetToTenantsArray = await this.db
      .select()
      .from(widgetsToTenants)
      .where(eq(widgetsToTenants.widgetId, widgetId));

    return widgetToTenantsArray.length > 0 ? widgetToTenantsArray[0] : null;
  }

  async getWidgetToTenantRelationshipByTenantId(
    tenantId: string,
  ): Promise<WidgetToTenant[]> {
    return this.db
      .select()
      .from(widgetsToTenants)
      .where(eq(widgetsToTenants.tenantId, tenantId));
  }

  async updateWidgetToTenantRelationship(
    widgetId: string,
    oldTenantId: string,
    values: WidgetToTenant,
  ): Promise<WidgetToTenant> {
    const result = await this.db
      .update(widgetsToTenants)
      .set(values)
      .where(
        and(
          eq(widgetsToTenants.widgetId, widgetId),
          eq(widgetsToTenants.tenantId, oldTenantId),
        ),
      )
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async deleteWidgetToTenantEntity(
    row: WidgetToTenant,
    transaction?: DbType,
  ): Promise<WidgetToTenant> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const result = await dbActor
      .delete(widgetsToTenants)
      .where(
        and(
          eq(widgetsToTenants.widgetId, row.widgetId),
          eq(widgetsToTenants.tenantId, row.tenantId),
        ),
      )
      .returning();

    return result.length > 0 ? result[0] : null;
  }

  async createWidgetToTenantEntity(
    row: WidgetToTenant,
    transaction: DbType,
  ): Promise<WidgetToTenant> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const result = await dbActor
      .insert(widgetsToTenants)
      .values(row)
      .returning();

    return result.length > 0 ? result[0] : null;
  }
}
