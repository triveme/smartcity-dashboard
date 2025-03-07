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
  // widgets,
} from '@app/postgres-db/schemas/dashboard.widget.schema';
import { WidgetToPanelService } from '../widget-to-panel/widget-to-panel.service';
import {
  checkAuthorizationToRead,
  checkAuthorizationToWrite,
  checkRequiredRights,
} from '@app/auth-helper/right-management/right-management.service';
import { queries, Query } from '@app/postgres-db/schemas/query.schema';
import { TabService } from '../tab/tab.service';
import {
  CreatedQueryConfig,
  QueryConfigService,
} from '../query-config/query-config.service';
import { QueryService } from '../query/query.service';
import { v4 as uuid } from 'uuid';
import { Tab } from '@app/postgres-db/schemas/dashboard.tab.schema';
import { TenantService } from '../tenant/tenant.service';
import { WidgetToTenantService } from '../widget-to-tenant/widget-to-tenant.service';
import { QueryRepo } from '../query/query.repo';
import { QueryConfigRepo } from '../query-config/query-config.repo';
import { TabRepo } from '../tab/tab.repo';
import { TenantRepo } from '../tenant/tenant.repo';
import { WidgetRepo } from './widget.repo';
import { WidgetToPanelRepo } from '../widget-to-panel/widget-to-panel.repo';
import {
  DataSource,
  dataSources,
} from '@app/postgres-db/schemas/data-source.schema';
import { DataSourceService } from '../data-source/data-source.service';
import { QueryBatch } from '../../../ngsi-service/src/ngsi.service';
import { authData } from '@app/postgres-db/schemas/auth-data.schema';
import { WidgetDataService } from './widget.data.service';
import { QueryConfig } from '@app/postgres-db/schemas/query-config.schema';
import { WidgetToTenantRepo } from '../widget-to-tenant/widget-to-tenant.repo';
import {
  PaginatedResult,
  PaginationMeta,
  WidgetWithComponentTypes,
} from './widget.model';
import { widgetsToTenants } from '@app/postgres-db/schemas/widget-to-tenant.schema';

export type WidgetWithChildren = {
  widget: Widget;
  tab: Tab;
  query?: Query;
  queryConfig: QueryConfig;
  datasource: DataSource;
};

@Injectable()
export class WidgetService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly widgetRepo: WidgetRepo,
    private readonly widgetToPanelService: WidgetToPanelService,
    private readonly widgetToPanelRepo: WidgetToPanelRepo,
    private readonly widgetToTenantRepo: WidgetToTenantRepo,
    private readonly tabService: TabService,
    private readonly tabRepo: TabRepo,
    private readonly queryConfigService: QueryConfigService,
    private readonly queryConfigRepo: QueryConfigRepo,
    private readonly queryService: QueryService,
    private readonly queryRepo: QueryRepo,
    private readonly tenantService: TenantService,
    private readonly tenantRepo: TenantRepo,
    private readonly widgetToTenantService: WidgetToTenantService,
    private readonly dataSourceService: DataSourceService,
    private readonly widgetDataService: WidgetDataService,
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

    // Adjust positions to ensure uniqueness
    const positionMap = new Map<number, string>();
    const adjustedWidgets = widgetToPanels.map((w) => {
      let position = w.position ?? Number.MAX_SAFE_INTEGER; // Default position if none exists
      while (positionMap.has(position)) {
        position++; // Increment to avoid overlap
      }
      positionMap.set(position, w.widgetId);
      return { ...w, position };
    });

    // Sort adjusted widgets by position
    adjustedWidgets.sort((a, b) => a.position - b.position);

    // Reorder the panel widgets based on the new sorted positions
    panelWidgets.sort((a, b) => {
      const positionA = adjustedWidgets.find(
        (w) => w.widgetId === a.id,
      )?.position;
      const positionB = adjustedWidgets.find(
        (w) => w.widgetId === b.id,
      )?.position;

      return (
        (positionA ?? Number.MAX_SAFE_INTEGER) -
        (positionB ?? Number.MAX_SAFE_INTEGER)
      );
    });

    return panelWidgets;
  }

  async getByTenantAndTabComponentType(
    componentType: string,
    tenantAbbreviation: string,
  ): Promise<WidgetWithChildren[]> {
    const tenantWidgets =
      await this.getWidgetsByTenantAbbreviation(tenantAbbreviation);
    const tenantWidgetIds = tenantWidgets.map((widget) => widget.id);

    const tabs = await this.tabRepo.getTabsByWidgetIdsAndComponentType(
      tenantWidgetIds,
      componentType,
    );

    const widgetsWithChildren: WidgetWithChildren[] = [];
    for (const tab of tabs) {
      const widget = tenantWidgets.find((widget) => widget.id === tab.widgetId);
      if (widget) {
        widgetsWithChildren.push({
          widget,
          tab,
          query: null,
          queryConfig: null,
          datasource: null,
        });
      }
    }

    return widgetsWithChildren;
  }

  async getWidgetsByTenantAbbreviation(
    abbreviation: string,
  ): Promise<Widget[]> {
    const tenant = await this.tenantRepo.getTenantByAbbreviation(abbreviation);

    if (!tenant) {
      throw new HttpException('Tenant not found', HttpStatus.NOT_FOUND);
    }

    const widgetToTenantIds = await this.db
      .select()
      .from(widgetsToTenants)
      .where(eq(widgetsToTenants.tenantId, tenant.id));

    if (!widgetToTenantIds || widgetToTenantIds.length === 0) {
      throw new HttpException(
        'Widgets Not Found for Tenant',
        HttpStatus.NOT_FOUND,
      );
    }

    const widgetIds = widgetToTenantIds.map(
      (widgetToTenant) => widgetToTenant.widgetId,
    );
    const retrievedWidgets = await this.widgetRepo.getByIds(widgetIds);

    if (retrievedWidgets.length === 0) {
      this.logger.warn(
        `Widgets Not Found for Tenant with abbreviation ${abbreviation}`,
      );
      throw new HttpException(
        'Widgets Not Found for Tenant',
        HttpStatus.NOT_FOUND,
      );
    }

    return retrievedWidgets;
  }

  async getPaginatedWidgetsByTenantAbbreviation(
    abbreviation: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<Widget>> {
    const tenant = await this.tenantRepo.getTenantByAbbreviation(abbreviation);

    if (!tenant) {
      throw new HttpException('Tenant not found', HttpStatus.NOT_FOUND);
    }

    const widgetToTenantIds =
      await this.widgetToTenantRepo.getWidgetToTenantRelationshipByTenantId(
        tenant.id,
      );

    // Retrieve the paginated list of widget IDs associated with the tenant
    const totalItems = widgetToTenantIds.length;
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (page - 1) * limit;
    const paginatedWidgetToTenantIds = widgetToTenantIds.slice(
      offset,
      offset + limit,
    );

    // Retrieve each Widget by its ID (using Promise.all for efficiency)
    const widgetPromises = paginatedWidgetToTenantIds.map((widgetToTenantId) =>
      this.widgetRepo.getById(widgetToTenantId.widgetId),
    );
    const widgets = await Promise.all(widgetPromises);

    const meta: PaginationMeta = {
      totalItems,
      totalPages,
      currentPage: page,
      pageSize: limit,
    };

    return { data: widgets, meta };
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

  async duplicate(
    rolesFromRequest: string[],
    id: string,
    tenant?: string,
    transaction?: DbType,
  ): Promise<WidgetWithChildren> {
    const dbActor = transaction ?? this.db;

    const widgetContentToDuplicate = await this.getWithChildrenById(
      id,
      rolesFromRequest,
    );

    const duplicatedStructure: WidgetWithChildren = {
      widget: null,
      tab: null,
      query: null,
      queryConfig: null,
      datasource: null,
    };

    await dbActor.transaction(async (trx) => {
      const tenantExists = tenant
        ? await this.tenantService.existsByAbbreviation(tenant)
        : true;

      if (tenant && !tenantExists) {
        this.logger.error(`Tenant with abbreviation ${tenant} does not exist`);
        throw new HttpException(
          'Tenant does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Generate a unique name for the widget
      const uniqueWidgetName = await this.widgetRepo.generateUniqueName(
        widgetContentToDuplicate.widget.name,
      );
      // Duplicate widget
      const duplicatedWidget: Widget = {
        ...widgetContentToDuplicate.widget,
        id: uuid(),
        name: uniqueWidgetName,
      };
      duplicatedStructure.widget = await this.widgetRepo.create(
        duplicatedWidget,
        trx,
      );

      if (tenantExists && tenant) {
        await this.widgetToTenantService.manageCreate(
          duplicatedWidget.id,
          tenant,
          trx,
        );
      }

      // Duplicate the queryConfig if it exists
      let duplicatedQueryConfig: QueryConfig | null = null;
      if (widgetContentToDuplicate.queryConfig) {
        duplicatedQueryConfig = {
          ...widgetContentToDuplicate.queryConfig,
          id: uuid(),
        };
        duplicatedStructure.queryConfig = await this.queryConfigRepo.create(
          duplicatedQueryConfig,
          trx,
        );
      }

      // If a query associated with the queryConfig exists, duplicate it
      let duplicatedQuery: Query | null = null;
      if (duplicatedQueryConfig) {
        const queryToDuplicate = await this.db
          .select()
          .from(queries)
          .where(
            eq(queries.queryConfigId, widgetContentToDuplicate.queryConfig.id),
          )
          .execute();

        if (queryToDuplicate.length > 0) {
          duplicatedQuery = {
            ...queryToDuplicate[0],
            id: uuid(),
            queryConfigId: duplicatedQueryConfig.id,
          };
          duplicatedStructure.query = await this.queryRepo.create(
            duplicatedQuery,
            trx,
          );
        }
      }

      // Duplicate the tab if it exists
      if (widgetContentToDuplicate.tab) {
        const duplicatedTab: Tab = {
          ...widgetContentToDuplicate.tab,
          id: uuid(),
          widgetId: duplicatedWidget.id,
          // Add queryId if duplicatedQuery exists
          ...(duplicatedQuery ? { queryId: duplicatedQuery.id } : {}),
        };
        duplicatedStructure.tab = await this.tabRepo.create(duplicatedTab, trx);
      }
    });

    return duplicatedStructure;
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

  async getWithChildren(
    rolesFromRequest: string[],
    tenantAbbreviation: string,
  ): Promise<WidgetWithChildren[]> {
    const tenant =
      await this.tenantRepo.getTenantByAbbreviation(tenantAbbreviation);

    if (!tenant)
      throw new HttpException('Tenant not found', HttpStatus.NOT_FOUND);

    const widgetToTenantIds =
      await this.widgetToTenantRepo.getWidgetToTenantRelationshipByTenantId(
        tenant.id,
      );

    const widgetPromises = widgetToTenantIds.map(async (widgetToTenantId) => {
      return await this.widgetRepo.getById(widgetToTenantId.widgetId);
    });
    const widgets = await Promise.all(widgetPromises);

    if (widgets.length === 0) {
      const errorMessage = `Widgets not found for tenant with abbreviation ${tenantAbbreviation}`;
      this.logger.warn(errorMessage);
      throw new HttpException(errorMessage, HttpStatus.NOT_FOUND);
    }

    const widgetsWithChildren: WidgetWithChildren[] = [];
    for (const widget of widgets) {
      const roleHasReadRights = checkRequiredRights(
        widget,
        widget.readRoles,
        rolesFromRequest,
      );
      const roleHasWriteRights = checkRequiredRights(
        widget,
        widget.writeRoles,
        rolesFromRequest,
      );
      if (!roleHasReadRights && !roleHasWriteRights) {
        continue;
      }

      if (rolesFromRequest.length === 0) {
        delete widget.readRoles;
        delete widget.writeRoles;
      }

      // Fetch the tabs associated with the widget
      const tabs = await this.tabService.getTabsByWidgetId(widget.id);

      // If there are any matching tabs, proceed
      for (const tab of tabs) {
        const widgetResponse = await this.populateWidgetWithTab(widget, tab);
        widgetsWithChildren.push(widgetResponse);
      }
    }

    return widgetsWithChildren;
  }

  async getWithChildrenById(
    id: string,
    rolesFromRequest: string[],
  ): Promise<WidgetWithChildren> {
    const response: WidgetWithChildren = {
      widget: null,
      tab: null,
      queryConfig: null,
      datasource: null,
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

  async getBySearchParam(
    searchParam: string,
    roles: string[],
    tenantAbbreviation: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<WidgetWithComponentTypes>> {
    const tenant =
      await this.tenantRepo.getTenantByAbbreviation(tenantAbbreviation);

    return await this.widgetRepo.searchWidgets(
      roles,
      searchParam,
      page,
      limit,
      tenant.id,
    );
  }

  async createWithChildren(
    payload: WidgetWithChildren,
    rolesFromRequest: string[],
    tenant: string,
  ): Promise<WidgetWithChildren> {
    await this.db.transaction(async (tx) => {
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

      if (payload.queryConfig) {
        const payloadDataSource = await this.db
          .select()
          .from(dataSources)
          .where(eq(dataSources.id, payload.queryConfig.dataSourceId));
        payload.datasource = payloadDataSource[0];

        const payloadAuthData = await this.db
          .select()
          .from(authData)
          .where(eq(authData.id, payload.datasource.authDataId));

        // Prepare the QueryBatch but defer its execution
        const queryBatch: QueryBatch = {
          queryIds: [payloadTab.queryId],
          query_config: payload.queryConfig,
          data_source: payload.datasource,
          auth_data: payloadAuthData[0],
        };

        // Run initial query data retrieval asynchronously
        this.widgetDataService.runQueryDataPopulation(queryBatch);
      }
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
        datasource: null,
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

      // Run an initial query_data population once a widget is updated
      if (payload.queryConfig) {
        const payloadDataSource = await this.db
          .select()
          .from(dataSources)
          .where(eq(dataSources.id, payload.queryConfig.dataSourceId));
        payload.datasource = payloadDataSource[0];

        const payloadAuthData = await this.db
          .select()
          .from(authData)
          .where(eq(authData.id, payload.datasource.authDataId));

        // Prepare the QueryBatch but defer its execution
        const queryBatch: QueryBatch = {
          queryIds: [payloadTab.queryId],
          query_config: payload.queryConfig,
          data_source: payload.datasource,
          auth_data: payloadAuthData[0],
        };

        // Run initial query data retrieval asynchronously
        this.widgetDataService.runQueryDataPopulation(queryBatch);
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
      payloadTab.componentType !== 'Kombinierte Komponente' &&
      !(
        payloadTab.componentType === 'Karte' &&
        payloadTab.componentSubType === 'Kombinierte Karte'
      )
    );
  }

  private isImage(payloadTab: Tab): boolean {
    return payloadTab.componentType === 'Bild';
  }

  private async populateWidgetWithTab(
    widget: Widget,
    tab: Tab,
  ): Promise<WidgetWithChildren> {
    const widgetWithChildren: WidgetWithChildren = {
      widget: widget,
      tab: tab,
      queryConfig: null,
      datasource: null,
    };

    if (this.shouldUseQueryConfig(tab)) {
      widgetWithChildren.queryConfig =
        await this.queryConfigService.getQueryConfigByTabId(tab.id);
      widgetWithChildren.datasource = await this.dataSourceService.getById(
        widgetWithChildren.queryConfig.dataSourceId,
      );
    }

    return widgetWithChildren;
  }
}
