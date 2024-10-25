/* eslint-disable  @typescript-eslint/no-explicit-any */
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

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
import {
  checkAuthorizationToRead,
  checkAuthorizationToWrite,
} from '@app/auth-helper/right-management/right-management.service';
import { Tenant } from '@app/postgres-db/schemas/tenant.schema';
import { DashboardToTenant } from '@app/postgres-db/schemas/dashboard-to-tenant.schema';
import { GroupingElementService } from '../grouping-element/grouping-element.service';
import { GroupingElement } from '@app/postgres-db/schemas/dashboard.grouping-element.schema';
import { TenantService } from '../tenant/tenant.service';
import { AuthHelperUtility } from '@app/auth-helper';
import { DashboardToTenantService } from '../dashboard-to-tenant/dashboard-to-tenant.service';
import { PopulateService } from './populate/populate.service';
import { RoleUtil } from '../../../infopin-service/src/utility/RoleUtil';
import { DashboardRepo } from './dashboard.repo';
import { PanelRepo } from '../panel/panel.repo';
import { WidgetToPanelRepo } from '../widget-to-panel/widget-to-panel.repo';

export type ChartData = {
  name: string;
  values: [string, number][];
  color?: string;
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
      rolesFromRequest,
    );
  }

  async getDashboardWithContent(
    id: string,
    rolesFromRequest: string[],
    tenantFromRequest: string,
    includeData: boolean = true,
  ): Promise<DashboardWithContent> {
    const flatDashboardData =
      await this.dashboardRepo.getDashboardWithContent(id);

    // Check if flatDashboardData is not empty
    if (flatDashboardData.length > 0) {
      const dashboardWithContentArr =
        await this.populateService.reduceRowsToDashboardsWithContent(
          flatDashboardData,
          includeData,
        );
      const dashboardWithContent =
        dashboardWithContentArr.length > 0 ? dashboardWithContentArr[0] : null;

      if (dashboardWithContent.visibility !== 'public') {
        const dashboardWithTenant =
          await this.dashboardToTenantService.getDashboardToTenantRelationshipByDashboardId(
            dashboardWithContent.id,
          );
        const tenantFromDashboard = await this.tenantService.getById(
          dashboardWithTenant.tenantId,
        );
        if (tenantFromDashboard.abbreviation !== tenantFromRequest) {
          throw new HttpException('Dashboard Not Found', HttpStatus.NOT_FOUND);
        }
      }

      // Order the widgets
      if (dashboardWithContent) {
        checkAuthorizationToWrite(dashboardWithContent, rolesFromRequest);
        checkAuthorizationToRead(dashboardWithContent, rolesFromRequest);

        await this.populateService.sortWidgets(dashboardWithContent);
      }

      // If user is unauthenticated, exclude role properties from returned dashboard
      if (rolesFromRequest.length === 0 && dashboardWithContent) {
        // Hide dashboard roles
        delete dashboardWithContent.readRoles;
        delete dashboardWithContent.writeRoles;

        // Hide widget roles
        dashboardWithContent.panels.forEach((panel) => {
          panel.widgets.forEach((widget) => {
            delete widget.readRoles;
            delete widget.writeRoles;
          });
        });
      }

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

  async getById(id: string, rolesFromRequest: string[]): Promise<Dashboard> {
    const dashboard: Dashboard = await this.dashboardRepo.getById(id);

    if (!dashboard) {
      throw new HttpException('Dashboard Not Found', HttpStatus.NOT_FOUND);
    } else {
      checkAuthorizationToRead(dashboard, rolesFromRequest);
      checkAuthorizationToWrite(dashboard, rolesFromRequest);

      if (rolesFromRequest.length === 0) {
        delete dashboard.readRoles;
        delete dashboard.writeRoles;
      }

      return dashboard;
    }
  }

  async getByUrlAndTenant(
    url: string,
    rolesFromRequest: string[],
    tenantAbbreviation: string,
  ): Promise<Dashboard> {
    // Fetch dashboards by URL
    const dashboardsByUrl: Dashboard[] = await this.dashboardRepo.getByUrl(url);

    // Check if any dashboards were found
    if (dashboardsByUrl.length === 0) {
      throw new HttpException('Dashboard Not Found', HttpStatus.NOT_FOUND);
    }

    // Retrieve tenant by abbreviation
    const tenant =
      await this.tenantService.getTenantByAbbreviation(tenantAbbreviation);
    if (!tenant) {
      throw new HttpException('Tenant Not Found', HttpStatus.NOT_FOUND);
    }

    // Filter dashboards by tenant
    const dashboardToTenantRelations =
      await this.dashboardToTenantService.getDashboardToTenantRelationshipsByTenantId(
        tenant.id,
      );

    const dashboard = dashboardsByUrl.find((dashboard) =>
      dashboardToTenantRelations.some(
        (relation) => relation.dashboardId === dashboard.id,
      ),
    );

    if (!dashboard) {
      throw new HttpException(
        'Dashboard Not Found for the given Tenant',
        HttpStatus.NOT_FOUND,
      );
    }

    // Authorization checks
    checkAuthorizationToRead(dashboard, rolesFromRequest);
    checkAuthorizationToWrite(dashboard, rolesFromRequest);

    // Exclude role properties for unauthenticated users
    if (rolesFromRequest.length === 0) {
      delete dashboard.readRoles;
      delete dashboard.writeRoles;
    }

    return dashboard;
  }

  async getDashboardsByTenantAbbreviation(
    abbreviation: string,
  ): Promise<Dashboard[]> {
    const tenant =
      await this.tenantService.getTenantByAbbreviation(abbreviation);

    const dashboardToTenantIds = await this.getDashboardToTenantIds(tenant);

    const retrievedDashboards: Dashboard[] = [];

    const dashboardPromises = dashboardToTenantIds.map(
      async (dashboardToTenantId) => {
        return await this.dashboardRepo.getById(
          dashboardToTenantId.dashboardId,
        );
      },
    );

    const resolvedDashboards = await Promise.all(dashboardPromises);

    retrievedDashboards.push(...resolvedDashboards);

    if (retrievedDashboards.length === 0) {
      this.logger.warn('No Dashboards found for given Tenant');
      return [];
    } else {
      return retrievedDashboards;
    }
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
      rolesFromRequest,
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

  async update(
    id: string,
    values: Partial<Dashboard>,
    rolesFromRequest: string[],
    tenant: string,
  ): Promise<Dashboard> {
    // Check if the URL is being updated to an already existing URL
    if (values.url) {
      const dbDashboard = await this.dashboardRepo.getById(id);

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
      await this.groupingElementService.getByUrl(dashboardToUpdate.url);

    return await this.db.transaction(async (tx) => {
      if (groupingElementForDashboard) {
        groupingElementForDashboard.url = values.url;
        groupingElementForDashboard.name = values.name;

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
      false,
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
