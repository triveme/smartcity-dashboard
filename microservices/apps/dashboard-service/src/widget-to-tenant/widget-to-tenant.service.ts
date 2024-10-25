import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DbType } from '@app/postgres-db';
import { WidgetToTenant } from '@app/postgres-db/schemas/widget-to-tenant.schema';
import { TenantService } from '../tenant/tenant.service';
import { WidgetToTenantRepo } from './widget-to-tenant.repo';

@Injectable()
export class WidgetToTenantService {
  constructor(
    private readonly widgetToTenantRepo: WidgetToTenantRepo,
    private readonly tenantService: TenantService,
  ) {}

  async getWidgetToTenantRelationshipByWidgetId(
    widgetId: string,
  ): Promise<WidgetToTenant> {
    return this.widgetToTenantRepo.getWidgetToTenantRelationshipByWidgetId(
      widgetId,
    );
  }

  async updateWidgetToTenantRelationship(
    widgetId: string,
    oldTenantId: string,
    newTenantId: string,
  ): Promise<WidgetToTenant> {
    const widgetToTenant: WidgetToTenant = {
      widgetId: widgetId,
      tenantId: newTenantId,
    };

    return this.widgetToTenantRepo.updateWidgetToTenantRelationship(
      widgetId,
      oldTenantId,
      widgetToTenant,
    );
  }

  async deleteWidgetToTenantEntity(
    row: WidgetToTenant,
    transaction?: DbType,
  ): Promise<WidgetToTenant> {
    return this.widgetToTenantRepo.deleteWidgetToTenantEntity(row, transaction);
  }

  async createWidgetToTenantEntity(
    row: WidgetToTenant,
    transaction: DbType,
  ): Promise<WidgetToTenant> {
    return this.widgetToTenantRepo.createWidgetToTenantEntity(row, transaction);
  }

  async manageCreate(
    widgetId: string,
    tenantAbbreviation: string,
    dbActor: DbType,
  ): Promise<void> {
    const tenant =
      await this.tenantService.getTenantByAbbreviation(tenantAbbreviation);

    if (tenant) {
      const widgetToTenant: WidgetToTenant = {
        widgetId: widgetId,
        tenantId: tenant.id,
      };

      await this.createWidgetToTenantEntity(widgetToTenant, dbActor);
    }
  }

  async manageUpdate(
    widgetId: string,
    tenantAbbreviation?: string,
  ): Promise<void> {
    const widgetToTenant =
      await this.getWidgetToTenantRelationshipByWidgetId(widgetId);

    if (tenantAbbreviation) {
      const tenant =
        await this.tenantService.getTenantByAbbreviation(tenantAbbreviation);
      if (!tenant) {
        throw new HttpException(
          'manageUpdate: Tenant not existing',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (widgetToTenant && widgetToTenant.tenantId !== tenant.id) {
        await this.updateWidgetToTenantRelationship(
          widgetId,
          widgetToTenant.tenantId,
          tenant.id,
        );
      } else if (!widgetToTenant) {
        await this.createWidgetToTenantEntity(
          {
            widgetId: widgetId,
            tenantId: tenant.id,
          },
          undefined,
        );
      }
    } else if (widgetToTenant) {
      await this.deleteWidgetToTenantEntity(widgetToTenant);
    }
  }

  async manageDelete(widgetId: string, transaction?: DbType): Promise<void> {
    const widgetToTenant =
      await this.getWidgetToTenantRelationshipByWidgetId(widgetId);

    if (widgetToTenant)
      await this.deleteWidgetToTenantEntity(widgetToTenant, transaction);
  }
}
