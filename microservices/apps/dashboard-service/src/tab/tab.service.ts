import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';

import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { NewTab, Tab } from '@app/postgres-db/schemas/dashboard.tab.schema';
import { TabRepo } from './tab.repo';
import { eq } from 'drizzle-orm';
import { widgetsToTenants } from '@app/postgres-db/schemas/widget-to-tenant.schema';
import { TenantRepo } from '../tenant/tenant.repo';
import { WidgetRepo } from '../widget/widget.repo';

@Injectable()
export class TabService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly tabRepo: TabRepo,
    private readonly tenantRepo: TenantRepo,
    private readonly widgetRepo: WidgetRepo,
  ) {}

  private readonly logger = new Logger(TabService.name);

  async getAll(): Promise<Tab[]> {
    return this.tabRepo.getAll();
  }

  async getById(id: string): Promise<Tab> {
    return this.tabRepo.getById(id);
  }

  async getTabsByWidgetId(widgetId: string): Promise<Tab[]> {
    const widgetTabs = await this.tabRepo.getTabsByWidgetId(widgetId);

    if (widgetTabs.length === 0) {
      this.logger.warn(`No Tabs Found in Database with WidgetId: ${widgetId}`);
      return [];
    }

    return widgetTabs;
  }

  async getTabsByWidgetIds(widgetIds: string[]): Promise<Tab[]> {
    return this.tabRepo.getTabsByWidgetIds(widgetIds);
  }

  async getTabsByWidgetIdsAndComponentType(
    widgetIds: string[],
    componentType: string,
  ): Promise<Tab[]> {
    return this.tabRepo.getTabsByWidgetIdsAndComponentType(
      widgetIds,
      componentType,
    );
  }

  async create(row: NewTab, transaction?: DbType): Promise<Tab> {
    this.validateTabData(row);

    return this.tabRepo.create(row, transaction);
  }

  async getByComponentType(
    componentType: string,
    tenant: string,
  ): Promise<Tab[]> {
    const tabsByTenant = await this.getTabsByTenantAbbreviation(tenant);
    const filteredTabs = tabsByTenant.filter(
      (tab) => tab.componentType === componentType,
    );

    return filteredTabs;
  }

  async getTabsByTenantAbbreviation(abbreviation: string): Promise<Tab[]> {
    const tenant = await this.tenantRepo.getTenantByAbbreviation(abbreviation);

    if (!tenant) {
      throw new HttpException('Tenant not found', HttpStatus.NOT_FOUND);
    }
    const widgetToTenantIds = await this.db
      .select()
      .from(widgetsToTenants)
      .where(eq(widgetsToTenants.tenantId, tenant.id));

    const retrievedTabs: Tab[] = [];
    const tabPromises = widgetToTenantIds.map(async (widgetToTenantId) => {
      const widget = await this.widgetRepo.getById(widgetToTenantId.widgetId);

      return await this.getTabsByWidgetId(widget.id);
    });
    const resolvedTabs = await Promise.all(tabPromises);

    resolvedTabs.forEach((tabs) => retrievedTabs.push(...tabs));
    if (retrievedTabs.length === 0) {
      this.logger.warn(
        `Tabs Not Found for Tenant with abbreviation ${abbreviation}`,
      );
      throw new HttpException(
        'Tabs Not Found for Tenant',
        HttpStatus.NOT_FOUND,
      );
    }
    return retrievedTabs;
  }

  async update(
    id: string,
    values: Partial<Tab>,
    transaction?: DbType,
  ): Promise<Tab> {
    return this.tabRepo.update(id, values, transaction);
  }

  async delete(id: string): Promise<Tab> {
    return this.tabRepo.delete(id);
  }

  private validateTabData(values: NewTab): void {
    if (values.componentType === 'Karte') {
      if (
        !this.isValidDecimal(values.mapLatitude + '') ||
        !this.isValidDecimal(values.mapLongitude + '')
      ) {
        throw new HttpException(
          'Map Longitude and Latitude must be valid decimals',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  private isValidDecimal(value: string): boolean {
    const decimalValue = Number(value);

    return !isNaN(decimalValue) && isFinite(decimalValue);
  }
}
