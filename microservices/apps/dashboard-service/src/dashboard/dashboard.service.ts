/* eslint-disable  @typescript-eslint/no-explicit-any */
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  Dashboard,
  NewDashboard,
} from '@app/postgres-db/schemas/dashboard.schema';
import { Widget } from '@app/postgres-db/schemas/dashboard.widget.schema';
import { Tab } from '@app/postgres-db/schemas/dashboard.tab.schema';
import { Panel } from '@app/postgres-db/schemas/dashboard.panel.schema';
import { Query } from '@app/postgres-db/schemas/query.schema';
import { DataModel } from '@app/postgres-db/schemas/data-model.schema';
import { checkAuthorizationToWrite } from '@app/auth-helper/right-management/right-management.service';
import { Tenant } from '@app/postgres-db/schemas/tenant.schema';
import { DashboardToTenant } from '@app/postgres-db/schemas/dashboard-to-tenant.schema';
import { GroupingElementService } from '../grouping-element/grouping-element.service';
import { GroupingElement } from '@app/postgres-db/schemas/dashboard.grouping-element.schema';
import { TenantService } from '../tenant/tenant.service';
import { AuthHelperUtility } from '@app/auth-helper';
import { DashboardToTenantService } from '../dashboard-to-tenant/dashboard-to-tenant.service';
import { PopulateService } from './populate/populate.service';
import { RoleUtil } from '../../../infopin-service/src/utility/RoleUtil';
import { DashboardRepo, FlatDashboardData } from './dashboard.repo';
import { PanelRepo } from '../panel/panel.repo';
import { WidgetToPanelRepo } from '../widget-to-panel/widget-to-panel.repo';
import { NewWidgetToPanel } from '@app/postgres-db/schemas/dashboard.widget-to-panel.schema';
import { WidgetService } from '../widget/widget.service';
import { PaginatedResult } from '../widget/widget.model';

export type ChartData = {
  name: string;
  values: [string, number][];
  color?: string;
};

export type WeatherWarningData = {
  category: string;
  subCategory: string;
  severity: number;
  instructions: string;
  alertDescription: string;
  validFrom: string;
  validTo: string;
};

type Coordinate = [number, number];

export type Position = {
  type: string;
  coordinates: Coordinate;
};

export type MapObject = {
  position: Position;
};
export type TabWithContent = Tab & { query?: Query } & {
  dataModel: DataModel;
} & { chartData: ChartData[] } & { combinedWidgets: WidgetWithContent[] } & {
  weatherWarnings: WeatherWarningData[];
} & {
  mapObject: MapObject[];
};
export type WidgetWithContent = Widget & { tabs: TabWithContent[] };
export type PanelWithContent = Panel & { widgets: WidgetWithContent[] };
export type DashboardWithContent = Dashboard & { panels: PanelWithContent[] };

@Injectable()
export class DashboardService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly authHelperUtility: AuthHelperUtility,
    private readonly groupingElementService: GroupingElementService,
    private readonly tenantService: TenantService,
    private readonly dashboardToTenantService: DashboardToTenantService,
    private readonly populateService: PopulateService,
    private readonly dashboardRepo: DashboardRepo,
    private readonly panelRepo: PanelRepo,
    private readonly widgetService: WidgetService,
    private readonly widgetsToPanelRepo: WidgetToPanelRepo,
  ) {}

  private readonly logger = new Logger(DashboardService.name);

  async getDashboardsWithContent(
    rolesFromRequest: string[],
  ): Promise<DashboardWithContent[]> {
    const flatDashboardData =
      await this.dashboardRepo.getDashboardsWithContent(rolesFromRequest);

    return await this.populateService.populateDashboardsWithContent(
      flatDashboardData,
    );
  }

  async getDashboardWithContentById(
    id: string,
    rolesFromRequest: string[],
  ): Promise<DashboardWithContent> {
    const flatDashboardData =
      await this.dashboardRepo.getDashboardWithContentById(
        id,
        rolesFromRequest,
      );

    if (flatDashboardData.length > 0) {
      const dashboardWithContentArr =
        await this.populateService.reduceRowsToDashboardsWithContent(
          flatDashboardData,
        );
      const dashboardWithContent =
        dashboardWithContentArr.length > 0 ? dashboardWithContentArr[0] : null;

      return dashboardWithContent;
    } else {
      throw new HttpException('Dashboard Not Found', HttpStatus.NOT_FOUND);
    }
  }

  async getDashboardWithContent(
    id: string,
    rolesFromRequest: string[],
    tenantFromRequest: string,
  ): Promise<DashboardWithContent> {
    const tenantFromDashboard =
      await this.tenantService.getTenantByAbbreviation(tenantFromRequest);

    const flatDashboardData = await this.dashboardRepo.getDashboardWithContent(
      id,
      tenantFromDashboard.id,
      rolesFromRequest,
    );

    if (flatDashboardData.length > 0) {
      const dashboardWithContentArr =
        await this.populateService.reduceRowsToDashboardsWithContent(
          flatDashboardData,
        );
      const dashboardWithContent =
        dashboardWithContentArr.length > 0 ? dashboardWithContentArr[0] : null;

      return dashboardWithContent;
    } else {
      // Handle the case when flatDashboardData is empty
      throw new HttpException('Dashboard Not Found', HttpStatus.NOT_FOUND);
    }
  }

  async getAll(rolesFromRequest: string[]): Promise<Dashboard[]> {
    const allDashboards = await this.dashboardRepo.getAll(rolesFromRequest);

    if (allDashboards.length === 0) {
      this.logger.warn('No Dashboards Found in Database');
      return [];
    } else {
      // If user is unauthenticated, exclude role properties from returned dashboards
      if (rolesFromRequest.length === 0) {
        allDashboards.forEach((dashboard) => {
          delete dashboard.readRoles;
          delete dashboard.writeRoles;
        });
      }

      return allDashboards;
    }
  }

  async getBySearchParam(
    searchParam: string,
    roles: string[],
    tenantAbbreviation: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<Dashboard>> {
    const tenant =
      await this.tenantService.getTenantByAbbreviation(tenantAbbreviation);

    return await this.dashboardRepo.searchDashboards(
      roles,
      searchParam,
      page,
      limit,
      tenant.id,
    );
  }

  async getById(id: string, rolesFromRequest: string[]): Promise<Dashboard> {
    const dashboard: Dashboard = await this.dashboardRepo.getById(
      id,
      rolesFromRequest,
    );

    if (!dashboard) {
      throw new HttpException('Dashboard Not Found', HttpStatus.NOT_FOUND);
    }
    return dashboard;
  }

  async getByUrlAndTenant(
    url: string,
    rolesFromRequest: string[],
    tenantAbbreviation: string,
  ): Promise<DashboardWithContent> {
    const tenant =
      await this.tenantService.getTenantByAbbreviation(tenantAbbreviation);

    if (!tenant) {
      throw new HttpException('Tenant Not Found', HttpStatus.NOT_FOUND);
    }

    const dashboardsByUrl: FlatDashboardData[] =
      await this.dashboardRepo.getByUrlAndTenant(
        url,
        tenant.id,
        rolesFromRequest,
      );

    if (dashboardsByUrl.length === 0) {
      throw new HttpException('Dashboard Not Found', HttpStatus.NOT_FOUND);
    }

    const dashboardWithContent =
      await this.populateService.reduceRowsToDashboardsWithContent(
        dashboardsByUrl,
      );

    return dashboardWithContent[0];
  }

  async getDashboardsByTenantAbbreviation(
    abbreviation: string,
  ): Promise<Dashboard[]> {
    const tenant =
      await this.tenantService.getTenantByAbbreviation(abbreviation);

    if (!tenant) {
      this.logger.warn(`Tenant not found for abbreviation: ${abbreviation}`);
      return [];
    }

    const dashboardToTenantIds = await this.getDashboardToTenantIds(tenant);
    const dashboardIds = dashboardToTenantIds.map(
      (mapping) => mapping.dashboardId,
    );

    if (dashboardIds.length === 0) {
      this.logger.warn('No Dashboards found for given Tenant');
      return [];
    }

    return await this.dashboardRepo.getByIds(dashboardIds);
  }

  async getDashboardsWithContentByAbbreviation(
    rolesFromRequest: string[],
    abbreviation: string,
  ): Promise<DashboardWithContent[]> {
    const tenant =
      await this.tenantService.getTenantByAbbreviation(abbreviation);
    if (!tenant) return [];

    const flatDashboardData =
      await this.dashboardRepo.getDashboardsWithContentByAbbreviation(
        tenant.id,
        rolesFromRequest,
      );

    if (flatDashboardData.length === 0) {
      this.logger.warn('No Dashboards With Content found for given Tenant');
      return [];
    }
    return await this.populateService.populateDashboardsWithContent(
      flatDashboardData,
    );
  }

  async getDashboardUrlByTenantAbbreviation(
    abbreviation: string,
    roles: string[],
    tenantFromRequest: string,
  ): Promise<string[]> {
    const groupingElements: GroupingElement[] =
      await this.groupingElementService.getByTenantAbbreviation(
        abbreviation,
        roles,
        tenantFromRequest,
      );

    return await this.getFirstDashboardUrlForGroupingElements(groupingElements);
  }

  async getFirstDashboardUrl(
    roles: string[],
    tenantFromRequest: string,
  ): Promise<string[]> {
    const groupingElements: GroupingElement[] =
      await this.groupingElementService.getAll(roles, tenantFromRequest);

    return this.getFirstDashboardUrlForGroupingElements(groupingElements);
  }

  async getDashboardWithWidgets(
    id: string,
    rolesFromRequest: string[],
  ): Promise<DashboardWithContent> {
    const dashboard: Dashboard = await this.dashboardRepo.getById(
      id,
      rolesFromRequest,
    );

    if (!dashboard) {
      throw new HttpException('Dashboard Not Found', HttpStatus.NOT_FOUND);
    }

    const panels: Panel[] = await this.panelRepo.getPanelsByDashboardId(
      dashboard.id,
    );

    const panelsWithWidgets: PanelWithContent[] = await Promise.all(
      panels.map(async (panel) => {
        const widgets: Widget[] = await this.widgetService.getWidgetsByPanelId(
          panel.id,
        );

        // Prepare the panel with widgets, excluding tabs/queries
        const panelWithWidgets: PanelWithContent = {
          ...panel,
          widgets: widgets.map((widget) => ({
            ...widget,
            tabs: [], // Exclude tabs from widgets
          })),
        };

        return panelWithWidgets;
      }),
    );

    const dashboardWithWidgets: DashboardWithContent = {
      ...dashboard,
      panels: panelsWithWidgets, // Panels with associated widgets
    };

    return dashboardWithWidgets;
  }

  async create(
    row: NewDashboard,
    rolesFromRequest: string[],
    tenant: string,
  ): Promise<Dashboard> {
    let tenantExists: boolean = false;

    if (tenant) {
      tenantExists = await this.tenantService.existsByAbbreviation(tenant);
      if (!tenantExists) {
        throw new HttpException(
          'createDashboard: Tenant not existing',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (
      !this.authHelperUtility.isAdmin(rolesFromRequest) &&
      !this.authHelperUtility.isEditor(rolesFromRequest)
    ) {
      throw new HttpException('Cannot create dashboard', HttpStatus.FORBIDDEN);
    }

    const existingDashboards =
      await this.getDashboardsByTenantAbbreviation(tenant);

    const rowUrlLower = row.url.toLowerCase();
    if (
      existingDashboards.some(
        (dashboard) => dashboard.url.toLowerCase() === rowUrlLower,
      )
    ) {
      this.logger.warn(
        `Dashboard with the same URL already exists for the Tenant: ${tenant}`,
      );
      throw new HttpException(
        `Dashboard with the same URL already exists for the Tenant: ${tenant}`,
        HttpStatus.CONFLICT,
      );
    }

    RoleUtil.populateRoles(row, rolesFromRequest);

    const newDashboard = await this.dashboardRepo.create(row);

    if (newDashboard && tenantExists) {
      await this.dashboardToTenantService.manageCreate(newDashboard.id, tenant);
    }

    return newDashboard;
  }

  async duplicate(
    id: string,
    rolesFromRequest: string[],
    tenant: string,
  ): Promise<DashboardWithContent> {
    const dashboardToDuplicate = await this.getDashboardWithContent(
      id,
      rolesFromRequest,
      tenant,
    );
    const duplicatedPanels: Panel[] = [];

    // Generate unique name and URL for duplicated dashboard
    const { uniqueName, uniqueUrl } =
      await this.dashboardRepo.generateUniqueNameAndUrl(
        dashboardToDuplicate.name,
        dashboardToDuplicate.url,
      );

    const duplicatedDashboard: Dashboard = {
      ...dashboardToDuplicate,
      id: uuid(),
      name: uniqueName,
      url: uniqueUrl,
    };

    const createdDashboard =
      await this.dashboardRepo.create(duplicatedDashboard);

    if (createdDashboard) {
      await this.dashboardToTenantService.manageCreate(
        createdDashboard.id,
        tenant,
      );
    }

    if (dashboardToDuplicate.panels.length > 0) {
      // Iterate through panels and duplicate them
      await Promise.all(
        dashboardToDuplicate.panels.map(async (panel) => {
          const duplicatePanel: Panel = {
            ...panel,
            id: uuid(),
            name: `${panel.name} (Copy)`,
            dashboardId: createdDashboard.id,
          };

          const createdPanel = await this.panelRepo.create(duplicatePanel);
          duplicatedPanels.push(createdPanel);

          // Duplicate widgets associated with the panel
          const widgetToPanelsToDuplicate =
            await this.widgetsToPanelRepo.getByPanelId(panel.id);

          if (widgetToPanelsToDuplicate.length > 0) {
            await Promise.all(
              widgetToPanelsToDuplicate.map(async (widgetToPanel) => {
                // Duplicate the widget
                const duplicatedWidget = await this.widgetService.duplicate(
                  rolesFromRequest,
                  widgetToPanel.widgetId,
                  tenant,
                );

                // Create a new widget-to-panel association
                const newWidgetToPanel: NewWidgetToPanel = {
                  position: widgetToPanel.position,
                  panelId: createdPanel.id,
                  widgetId: duplicatedWidget.widget.id,
                };

                await this.widgetsToPanelRepo.create(newWidgetToPanel);
              }),
            );
          }
        }),
      );
    }

    return this.getDashboardWithContent(
      createdDashboard.id,
      rolesFromRequest,
      tenant,
    );
  }

  async update(
    id: string,
    values: Partial<Dashboard>,
    rolesFromRequest: string[],
    tenant: string,
  ): Promise<Dashboard> {
    // Check if the URL is being updated to an already existing URL
    if (values.url) {
      const dbDashboard = await this.dashboardRepo.getById(
        id,
        rolesFromRequest,
      );

      if (!dbDashboard) throw new NotFoundException("Dashboard wasn't found");

      checkAuthorizationToWrite(dbDashboard, rolesFromRequest);

      RoleUtil.populateRoles(values, rolesFromRequest);

      // Fetch dashboards for the tenant to ensure URL uniqueness
      const existingDashboards =
        await this.getDashboardsByTenantAbbreviation(tenant);
      const newUrlLower = values.url.toLowerCase();

      // Check if any dashboard in the same tenant has the same URL, excluding the current one
      const dashboardWithNewUrl = existingDashboards.find(
        (dashboard) =>
          dashboard.id !== id && dashboard.url.toLowerCase() === newUrlLower,
      );

      if (dashboardWithNewUrl) {
        this.logger.warn(
          `Dashboard with the updated URL "${dashboardWithNewUrl.url}" already exists for Tenant: ${tenant}`,
        );
        throw new HttpException(
          `Dashboard with the updated URL "${dashboardWithNewUrl.url}" already exists for Tenant: ${tenant}`,
          HttpStatus.CONFLICT,
        );
      }
    }

    const dashboardToUpdate = await this.getById(id, rolesFromRequest);
    const groupingElementForDashboard =
      await this.groupingElementService.getByUrlAndTenant(
        dashboardToUpdate.url,
        tenant,
      );

    return await this.db.transaction(async (tx) => {
      if (groupingElementForDashboard) {
        groupingElementForDashboard.url = values.url;
        groupingElementForDashboard.name = values.name;
        groupingElementForDashboard.icon = values.icon;

        await this.groupingElementService.update(
          groupingElementForDashboard.id,
          groupingElementForDashboard,
          rolesFromRequest,
          tx,
        );
      }

      checkAuthorizationToWrite(dashboardToUpdate, rolesFromRequest);

      if (values.visibility === 'public') {
        values.readRoles = [];
        values.writeRoles = [];
      }

      await this.dashboardToTenantService.manageUpdate(id, tenant);

      const updatedDashboard = await this.dashboardRepo.update(id, values, tx);

      if (!updatedDashboard) {
        throw new HttpException('Dashboard Not Found', HttpStatus.NOT_FOUND);
      } else {
        return updatedDashboard;
      }
    });
  }

  // Cascade deletion of a Dashboard and all of its foreign key entries from the db
  async delete(
    id: string,
    rolesFromRequest: string[],
    tenantFromRequest: string,
  ): Promise<Dashboard> {
    const rawDashboard = await this.getById(id, rolesFromRequest);
    const dashboardToDelete = await this.getDashboardWithContent(
      id,
      rolesFromRequest,
      tenantFromRequest,
    );

    if (!rawDashboard || !dashboardToDelete) {
      throw new HttpException('Dashboard Not Found', HttpStatus.NOT_FOUND);
    } else {
      checkAuthorizationToWrite(rawDashboard, rolesFromRequest);

      return await this.db.transaction(async (tx) => {
        // Get all panel IDs related to this dashboard
        const panelIds = dashboardToDelete.panels.map((panel) => panel.id);
        try {
          await this.dashboardToTenantService.manageDelete(id, tx);

          if (panelIds.length > 0) {
            // Delete entries in widgets_to_panel table related to the panels of this dashboard
            for (const panelId of panelIds) {
              await this.widgetsToPanelRepo.deleteByPanelId(panelId);

              // Delete panels associated with this dashboard
              await this.panelRepo.delete(panelId, tx);
            }
          }

          await this.groupingElementService.deleteByUrl(rawDashboard.url, tx);

          // Finally, delete the dashboard once all FKs are dealt with
          return await this.dashboardRepo.delete(id, tx);
        } catch (error) {
          this.logger.error(error);
        }
      });
    }
  }

  private async buildUrlForGroupingElement(
    groupingElement: GroupingElement,
    url: string,
  ): Promise<string> {
    const groupingElementsFromDb: GroupingElement[] =
      await this.groupingElementService.getChildrenForGroupingElementById(
        groupingElement.id,
      );

    if (groupingElementsFromDb.length === 0) {
      if (!groupingElement.isDashboard) throw new DashboardNotFoundException();

      return url;
    }

    for (const groupingElement of groupingElementsFromDb) {
      try {
        url = `${url}/${groupingElement.url}`;

        if (groupingElement.isDashboard) {
          return url;
        }

        return this.buildUrlForGroupingElement(groupingElement, url);
      } catch (error) {
        if (error instanceof DashboardNotFoundException) {
          return;
        }
      }
    }
  }

  private async getDashboardToTenantIds(
    tenant: Tenant,
  ): Promise<DashboardToTenant[]> {
    const dashboardToTenantRelationships =
      await this.dashboardToTenantService.getDashboardToTenantRelationshipsByTenantId(
        tenant.id,
      );

    if (dashboardToTenantRelationships.length === 0) {
      this.logger.warn('No Dashboards found for given Tenant');
      return [];
    }

    return dashboardToTenantRelationships;
  }

  private async getFirstDashboardUrlForGroupingElements(
    groupingElements: GroupingElement[],
  ): Promise<string[]> {
    groupingElements = groupingElements.sort((a, b) => a.position - b.position);

    for (const groupingElement of groupingElements) {
      try {
        // If it's a dashboard and has a URL, return it immediately.
        if (groupingElement.isDashboard && groupingElement.url) {
          return [groupingElement.url];
        }

        // If not a dashboard, attempt to build a URL for it.
        if (!groupingElement.isDashboard) {
          if (await this.groupingElementHasChildren(groupingElement)) {
            const url = await this.buildUrlForGroupingElement(
              groupingElement,
              `/${groupingElement.url}`,
            );
            return [url];
          }
        }
      } catch (error) {
        if (error instanceof DashboardNotFoundException) {
          // Continue the loop if no dashboard found for this specific grouping element.
          continue;
        }
        throw error;
      }
    }

    // If the loop completes without returning, throw an exception indicating no valid dashboard was found.
    throw new HttpException(
      'No dashboard found with given tenant abbreviation.',
      HttpStatus.NOT_FOUND,
    );
  }

  private async groupingElementHasChildren(
    groupingElement: GroupingElement,
  ): Promise<boolean> {
    const groupingElementChildren =
      await this.groupingElementService.getChildrenForGroupingElementById(
        groupingElement.id,
      );

    return groupingElementChildren.length > 0;
  }
}

class DashboardNotFoundException extends Error {
  constructor(message: string = 'Dashboard not found') {
    super(message);
    this.name = 'DashboardNotFoundException';
    Object.setPrototypeOf(this, DashboardNotFoundException.prototype);
  }
}
