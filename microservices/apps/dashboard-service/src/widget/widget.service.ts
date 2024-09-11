import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';

import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  NewWidget,
  Widget,
} from '@app/postgres-db/schemas/dashboard.widget.schema';
import { WidgetToPanelService } from '../widget-to-panel/widget-to-panel.service';
import {
  checkAuthorizationToRead,
  checkAuthorizationToWrite,
  checkRequiredRights,
} from '@app/auth-helper/right-management/right-management.service';
import { queries, Query } from '@app/postgres-db/schemas/query.schema';
import { QueryConfig } from '@app/postgres-db/schemas/query-config.schema';
import { TabService } from '../tab/tab.service';
import {
  CreatedQueryConfig,
  QueryConfigService,
} from '../query-config/query-config.service';
import { QueryService } from '../query/query.service';
import { v4 as uuid } from 'uuid';
import { Tab } from '@app/postgres-db/schemas/dashboard.tab.schema';
import { widgetsToTenants } from '@app/postgres-db/schemas/widget-to-tenant.schema';
import { TenantService } from '../tenant/tenant.service';
import { WidgetToTenantService } from '../widget-to-tenant/widget-to-tenant.service';
import { QueryRepo } from '../query/query.repo';
import { QueryConfigRepo } from '../query-config/query-config.repo';
import { TabRepo } from '../tab/tab.repo';
import { TenantRepo } from '../tenant/tenant.repo';
import { WidgetRepo } from './widget.repo';
import { WidgetToPanelRepo } from '../widget-to-panel/widget-to-panel.repo';

export type WidgetWithChildren = {
  widget: Widget;
  tab: Tab;
  queryConfig: QueryConfig;
};

@Injectable()
export class WidgetService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly widgetRepo: WidgetRepo,
    private readonly widgetToPanelService: WidgetToPanelService,
    private readonly widgetToPanelRepo: WidgetToPanelRepo,
    private readonly tabService: TabService,
    private readonly tabRepo: TabRepo,
    private readonly queryConfigService: QueryConfigService,
    private readonly queryConfigRepo: QueryConfigRepo,
    private readonly queryService: QueryService,
    private readonly queryRepo: QueryRepo,
    private readonly tenantService: TenantService,
    private readonly tenantRepo: TenantRepo,
    private readonly widgetToTenantService: WidgetToTenantService,
  ) {}

  private readonly logger = new Logger(WidgetService.name);

  async getAll(rolesFromRequest: string[]): Promise<Widget[]> {
    let allWidgets = await this.widgetRepo.getAll();

    allWidgets = allWidgets.filter((widget) => {
      return (
        checkRequiredRights(widget, widget.readRoles, rolesFromRequest) ||
        checkRequiredRights(widget, widget.writeRoles, rolesFromRequest)
      );
    });

    if (allWidgets.length === 0) {
      this.logger.warn('No Widgets Found in Database');
      return [];
    } else {
      if (rolesFromRequest.length === 0) {
        allWidgets.forEach((widget) => {
          delete widget.readRoles;
          delete widget.writeRoles;
        });
      }
      return allWidgets;
    }
  }

  async getById(id: string, rolesFromRequest: string[]): Promise<Widget> {
    const widget = await this.widgetRepo.getById(id);

    if (!widget) {
      this.logger.error(`Widget with id ${id} not found`);

      throw new HttpException('Widget Not Found', HttpStatus.NOT_FOUND);
    } else {
      checkAuthorizationToWrite(widget, rolesFromRequest);
      checkAuthorizationToRead(widget, rolesFromRequest);

      if (rolesFromRequest.length === 0) {
        delete widget.readRoles;
        delete widget.writeRoles;
      }

      return widget;
    }
  }

  async getWidgetsByPanelId(panelId: string): Promise<Widget[]> {
    // Get widgets and join the widget_to_panel table where its = to panelId
    const widgetsWithWidgetToPanels =
      await this.widgetRepo.getWidgetsByPanelId(panelId);

    if (widgetsWithWidgetToPanels.length === 0) {
      this.logger.warn('No Widgets Found in Database with PanelId: ', panelId);
      return [];
    }

    // Reduce to only get the widgets
    const panelWidgets = widgetsWithWidgetToPanels.map((row) => row.widget);

    // Apply sorting based off WidgetToPanelRelation
    const widgetToPanels =
      await this.widgetToPanelService.getByPanelId(panelId);
    panelWidgets.sort((a, b) => {
      const widgetToPanelA = widgetToPanels.find((w) => w.widgetId === a.id);
      const widgetToPanelB = widgetToPanels.find((w) => w.widgetId === b.id);

      const positionA = widgetToPanelA
        ? widgetToPanelA.position
        : Number.MAX_VALUE;
      const positionB = widgetToPanelB
        ? widgetToPanelB.position
        : Number.MAX_VALUE;

      return positionA - positionB;
    });
    return panelWidgets;
  }

  async getByTabComponentType(
    componentType: string,
    rolesFromRequest: string[],
  ): Promise<WidgetWithChildren[]> {
    const allWidgets = await this.getAll(rolesFromRequest);
    const widgetsWithChildren: WidgetWithChildren[] = [];

    for (const widget of allWidgets) {
      // Fetch the tabs associated with the widget
      const tabs = await this.tabService.getTabsByWidgetId(widget.id);

      // Filter tabs that match the componentType param
      const matchingTabs = tabs.filter(
        (tab) => tab.componentType === componentType,
      );

      // If there are any matching tabs, proceed
      for (const tab of matchingTabs) {
        const response: WidgetWithChildren = {
          widget: widget,
          tab: tab,
          queryConfig: null,
        };

        if (this.shouldUseQueryConfig(tab)) {
          response.queryConfig =
            await this.queryConfigService.getQueryConfigByTabId(tab.id);
        }

        if (rolesFromRequest.length === 0) {
          delete widget.readRoles;
          delete widget.writeRoles;
        }

        widgetsWithChildren.push(response);
      }
    }

    return widgetsWithChildren;
  }

  async getWidgetsByTenantAbbreviation(
    abbreviation: string,
  ): Promise<Widget[]> {
    const tenant = await this.tenantRepo.getTenantByAbbreviation(abbreviation);

    if (!tenant)
      throw new HttpException('Tenant not found', HttpStatus.NOT_FOUND);

    const widgetToTenantIds = await this.db
      .select()
      .from(widgetsToTenants)
      .where(eq(widgetsToTenants.tenantId, tenant.id));

    const retrievedWidgets: Widget[] = [];

    const widgetPromises = widgetToTenantIds.map(async (widgetToTenantId) => {
      return await this.widgetRepo.getById(widgetToTenantId.widgetId);
    });

    const resolvedWidgets = await Promise.all(widgetPromises);

    retrievedWidgets.push(...resolvedWidgets);

    if (retrievedWidgets.length === 0) {
      this.logger.warn(
        `Widgets Not Found for Tenant with abbreviation ${abbreviation}`,
      );
      throw new HttpException(
        'Widgets Not Found for Tenant',
        HttpStatus.NOT_FOUND,
      );
    } else {
      return retrievedWidgets;
    }
  }

  async create(
    row: NewWidget,
    rolesFromRequest: string[],
    transaction?: DbType,
    tenant?: string,
  ): Promise<Widget> {
    const dbActor = transaction === undefined ? this.db : transaction;
    let tenantExists: boolean = false;

    if (tenant) {
      tenantExists = await this.tenantService.existsByAbbreviation(tenant);
      if (!tenantExists) {
        this.logger.error(`Tenant with abbreviation ${tenant} not existing`);
        throw new HttpException(
          'createWidget: Tenant not existing',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    this.populateRoles(row, rolesFromRequest);

    const newWidget = await this.widgetRepo.create(row, dbActor);

    if (newWidget && tenantExists) {
      await this.widgetToTenantService.manageCreate(
        newWidget.id,
        tenant,
        dbActor,
      );
    }

    return newWidget;
  }

  async update(
    id: string,
    values: Partial<Widget>,
    rolesFromRequest: string[],
    tenant?: string,
    transaction?: DbType,
  ): Promise<Widget> {
    const widgetToUpdate = await this.getById(id, rolesFromRequest);

    checkAuthorizationToWrite(widgetToUpdate, rolesFromRequest);
    this.populateRoles(values, rolesFromRequest);

    if (values.visibility === 'public') {
      values.readRoles = [];
      values.writeRoles = [];
    }

    await this.widgetToTenantService.manageUpdate(id, tenant);

    const updatedWidget = this.widgetRepo.update(id, values, transaction);

    if (!updatedWidget) {
      this.logger.error(`Widget with id ${id} not found`);
      throw new HttpException('Widget Not Found', HttpStatus.NOT_FOUND);
    } else {
      return updatedWidget;
    }
  }

  // Cascade deletion of a Widget and its foreign key entries
  async delete(id: string, rolesFromRequest: string[]): Promise<Widget> {
    const widgetToDelete = await this.getById(id, rolesFromRequest);

    if (!widgetToDelete) {
      this.logger.error(`Widget with id ${id} not found`);

      throw new HttpException('Widget Not Found', HttpStatus.NOT_FOUND);
    } else {
      await this.db.transaction(async (tx) => {
        const widgetToDelete = await this.getById(id, rolesFromRequest);

        checkAuthorizationToWrite(widgetToDelete, rolesFromRequest);

        await this.checkIfWidgetCanBeDeleted(id, rolesFromRequest);

        await this.widgetToTenantService.manageDelete(id, tx);

        const widgetTabs: Tab[] = await this.tabRepo.getTabsByWidgetId(id);

        if (widgetTabs.length > 0) {
          for (const widgetTab of widgetTabs) {
            const query = await this.db
              .select()
              .from(queries)
              .where(eq(queries.id, widgetTab.queryId));

            // Delete entries in the "tab" table related to the deleted widget
            await this.tabRepo.delete(widgetTab.id, tx);

            if (query && query.length > 0) {
              await this.queryRepo.delete(query[0].id, tx);
              await this.queryConfigRepo.delete(query[0].queryConfigId, tx);
            }
          }

          await this.widgetToPanelRepo.deleteByWidgetId(id);

          // Delete widget
          await this.widgetRepo.delete(id, tx);
        }
      });

      return widgetToDelete;
    }
  }

  async getWithChildrenById(
    id: string,
    rolesFromRequest: string[],
  ): Promise<WidgetWithChildren> {
    const response: WidgetWithChildren = {
      widget: null,
      tab: null,
      queryConfig: null,
    };

    const widget = await this.getById(id, rolesFromRequest);

    const tabs = await this.tabService.getTabsByWidgetId(widget.id);

    if (tabs.length !== 0) {
      const tab = tabs[0];
      response.tab = tab;

      if (this.shouldUseQueryConfig(tab)) {
        response.queryConfig =
          await this.queryConfigService.getQueryConfigByTabId(tab.id);
      }
    }

    if (rolesFromRequest.length === 0) {
      delete widget.readRoles;
      delete widget.writeRoles;
    }

    response.widget = widget;

    return response;
  }

  async createWithChildren(
    payload: WidgetWithChildren,
    rolesFromRequest: string[],
    tenant: string,
  ): Promise<WidgetWithChildren> {
    payload = await this.db.transaction(async (tx) => {
      const widget = payload.widget;

      const createdWidget = await this.create(
        widget,
        rolesFromRequest,
        tx,
        tenant,
      );

      const payloadTab = payload.tab;
      let createdQueryConfig: CreatedQueryConfig;
      let queryId: string;
      if (this.shouldUseQueryConfig(payloadTab)) {
        payload.queryConfig.tenantId = tenant;
        createdQueryConfig = await this.queryConfigService.create(
          payload.queryConfig,
          tx,
        );
      } else if (payloadTab.componentType === 'Bild') {
        queryId = await this.createQueryForImage(tx, payloadTab.imageSrc);
      }

      if (payloadTab.chartStaticValuesTexts) {
        payloadTab.chartStaticValuesTexts =
          payloadTab.chartStaticValuesTexts.map((text) =>
            text === '' ? '""' : text,
          );
      }

      payloadTab.widgetId = createdWidget.id;
      payloadTab.queryId =
        createdQueryConfig !== undefined ? createdQueryConfig.queryId : queryId;
      const createdTab = await this.tabService.create(payloadTab, tx);

      payload.widget = createdWidget;
      payload.tab = createdTab;
      payload.queryConfig = createdQueryConfig;

      return payload;
    });

    return payload;
  }

  async updateWithChildren(
    id: string,
    payload: Partial<WidgetWithChildren>,
    rolesFromRequest: string[],
    tenant: string,
  ): Promise<WidgetWithChildren> {
    return await this.db.transaction(async (tx) => {
      const payloadTab = payload.tab;
      if (payloadTab && payloadTab.id === undefined)
        throw new HttpException(
          'Tab ID must be provided if it should be updated',
          HttpStatus.BAD_REQUEST,
        );

      // Ensure proper handling of empty strings
      if (payloadTab.chartStaticValuesTexts) {
        payloadTab.chartStaticValuesTexts =
          payloadTab.chartStaticValuesTexts.map((text) =>
            text === '' ? '""' : text,
          );
      }

      const response: WidgetWithChildren = {
        widget: null,
        tab: null,
        queryConfig: null,
      };

      response.widget = await this.update(
        id,
        payload.widget,
        rolesFromRequest,
        tenant,
        tx,
      );

      response.tab = await this.tabService.update(
        payloadTab.id,
        payloadTab,
        tx,
      );

      if (this.shouldUseQueryConfig(payloadTab)) {
        if (!payload.queryConfig.id)
          throw new HttpException(
            'Query Config id must be provided for update',
            HttpStatus.BAD_REQUEST,
          );
        payload.queryConfig.tenantId = tenant;

        response.queryConfig = await this.queryConfigService.update(
          payload.queryConfig.id,
          payload.queryConfig,
          tx,
        );
      } else if (this.isImage(payloadTab)) {
        const query = await this.queryService.getQueryByTabId(payloadTab.id);

        query.queryData = {
          imageData: payloadTab.imageSrc,
        };

        await this.queryService.update(query.id, query, tx);
      }

      return response;
    });
  }

  private async checkIfWidgetCanBeDeleted(
    id: string,
    rolesFromRequest: string[],
  ): Promise<void> {
    const widget: Widget = await this.widgetRepo.getById(id);

    if (
      widget &&
      rolesFromRequest.length > 0 &&
      widget.visibility != 'public'
    ) {
      const thereAreRoleMatches = widget.writeRoles.some((value) =>
        rolesFromRequest.includes(value),
      );

      if (!thereAreRoleMatches) {
        throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
      }
    }
  }

  private async createQueryForImage(
    tx: DbType,
    imageSrc?: string,
  ): Promise<string> {
    const newQuery: Query = {
      id: uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      queryConfigId: null,
      queryData: imageSrc === undefined ? null : { imageData: imageSrc },
      reportData: {},
      updateMessage: null,
    };

    const query = await this.queryService.create(newQuery, tx);

    return query.id;
  }

  private populateRoles(
    widget: Widget | NewWidget,
    rolesFromRequest: string[],
  ): void {
    if (widget.visibility === 'protected') {
      if (this.isRoleEmpty(widget.writeRoles)) {
        widget.writeRoles = rolesFromRequest;
      }
      if (this.isRoleEmpty(widget.readRoles)) {
        widget.readRoles = rolesFromRequest;
      }
    } else if (widget.visibility === 'invisible') {
      widget.writeRoles = rolesFromRequest;
      widget.readRoles = rolesFromRequest;
    }
  }

  private isRoleEmpty(roles: string[]): boolean {
    return roles === undefined || roles.length === 0;
  }

  private shouldUseQueryConfig(payloadTab: Tab): boolean {
    return (
      payloadTab.componentType !== 'Bild' &&
      payloadTab.componentType !== 'Informationen' &&
      payloadTab.componentType !== 'iFrame' &&
      payloadTab.componentType !== 'Kombinierte Komponente'
    );
  }

  private isImage(payloadTab: Tab): boolean {
    return payloadTab.componentType === 'Bild';
  }
}
