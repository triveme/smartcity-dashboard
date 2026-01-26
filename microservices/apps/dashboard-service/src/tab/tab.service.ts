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
import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import { EncryptionUtil } from '../util/encryption.util';

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
    const tabs = await this.tabRepo.getAll();
    for (const tab of tabs) {
      await this.handleSpecialTabs(tab);
    }
    return tabs;
  }

  async getById(id: string): Promise<Tab> {
    const tab = await this.tabRepo.getById(id);
    await this.handleSpecialTabs(tab);
    return tab;
  }

  async getTabsByWidgetId(widgetId: string): Promise<Tab[]> {
    const widgetTabs = await this.tabRepo.getTabsByWidgetId(widgetId);

    if (widgetTabs.length === 0) {
      this.logger.warn(`No Tabs Found in Database with WidgetId: ${widgetId}`);
      return [];
    }

    for (const tab of widgetTabs) {
      await this.handleSpecialTabs(tab);
    }

    return widgetTabs;
  }

  async getTabsByWidgetIds(widgetIds: string[]): Promise<Tab[]> {
    const widgetTabs = await this.tabRepo.getTabsByWidgetIds(widgetIds);
    for (const tab of widgetTabs) {
      await this.handleSpecialTabs(tab);
    }
    return widgetTabs;
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

    for (const tab of filteredTabs) {
      await this.handleSpecialTabs(tab);
    }

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

    for (const tab of retrievedTabs) {
      await this.handleSpecialTabs(tab);
    }
    return retrievedTabs;
  }

  async update(
    id: string,
    values: Partial<Tab>,
    transaction?: DbType,
  ): Promise<Tab> {
    const result = await this.tabRepo.update(id, values, transaction);
    this.handleSpecialTabs(result);
    return result;
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

  public async handleSpecialTabs(tab: Tab): Promise<void> {
    switch (tab.componentType) {
      case 'Apotheke':
        await this.handlePharmacyDetails(tab);
        break;
      default:
        return;
    }
  }

  private async handlePharmacyDetails(tab: Tab): Promise<void> {
    if (tab.componentType !== 'Apotheke') {
      return;
    }

    // In cases: last fetch was less than 6 hours AND
    //           tab already has details AND
    //           fetched data hs the same zip than the tab
    // do not fetch, return with the fethced values
    if (
      tab.pharmacyLastUpdate &&
      new Date(tab.pharmacyLastUpdate).getTime() >=
        new Date(new Date().getTime() - 6 * 60 * 60 * 1000).getTime() &&
      tab.pharmacyDetails &&
      tab.pharmacyZipCode == JSON.parse(tab.pharmacyDetails)?.parameter?.plzort
    ) {
      tab.pharmacyPassword = undefined;
      return;
    }

    try {
      const pharmacyServiceUrl = process.env.PHARMACY_URL;
      const response = await axios.get(
        `${pharmacyServiceUrl}?plzort=${tab.pharmacyZipCode ?? 36119}`,
        {
          auth: {
            username: tab.pharmacyUsername,
            password: EncryptionUtil.decryptPassword(
              tab.pharmacyPassword as object,
            ),
          },
          headers: {
            Accept: 'application/xml',
            'User-Agent': 'NestJS/axios',
          },
        },
      );

      const json = await parseStringPromise(response.data, {
        explicitArray: false,
      });

      // save into db
      tab.pharmacyDetails = JSON.stringify(json.notdienstkalender);
      tab.pharmacyLastUpdate = new Date().toISOString();
      await this.tabRepo.update(tab.id, {
        pharmacyDetails: tab.pharmacyDetails,
        pharmacyLastUpdate: tab.pharmacyLastUpdate,
      });
      tab.pharmacyPassword = undefined;
    } catch (error) {
      console.error(error);
    }
  }
}
