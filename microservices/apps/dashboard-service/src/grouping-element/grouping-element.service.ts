import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { DbType } from '@app/postgres-db';
import {
  GroupingElement,
  NewGroupingElement,
} from '@app/postgres-db/schemas/dashboard.grouping-element.schema';
import {
  GroupingElementRepo,
  GroupingElementWithChildren,
} from './grouping-element.repo';
import { DashboardRepo } from '../dashboard/dashboard.repo';
import { Dashboard } from '@app/postgres-db/schemas';
import { TenantRepo } from '../tenant/tenant.repo';

@Injectable()
export class GroupingElementService {
  constructor(
    private readonly dashboardRepo: DashboardRepo,
    private readonly groupingElementRepo: GroupingElementRepo,
    private readonly tenantRepo: TenantRepo,
  ) {}

  private readonly logger = new Logger(GroupingElementService.name);

  async getAll(
    roles: string[],
    tenantFromRequest: string,
  ): Promise<GroupingElementWithChildren[]> {
    const dbResult: GroupingElement[] = await this.groupingElementRepo.getAll();
    const dashboardsFromDb = await this.getDashboardsForGroupingElements(
      dbResult,
      tenantFromRequest,
      roles,
    );

    return await this.buildResponse(dbResult, dashboardsFromDb, roles);
  }

  async getByTenantAbbreviation(
    abbreviation: string,
    roles: string[],
    tenantFromRequest: string,
  ): Promise<GroupingElementWithChildren[]> {
    const dbResult: GroupingElement[] =
      await this.groupingElementRepo.getByTenantAbbreviation(abbreviation);
    const dashboardsFromDb = await this.getDashboardsForGroupingElements(
      dbResult,
      tenantFromRequest,
      roles,
    );

    if (dbResult.length === 0) {
      this.logger.error(
        `GroupingElementWithChildren not found for the given tenant ${abbreviation}`,
      );
    }

    return await this.buildResponse(dbResult, dashboardsFromDb, roles);
  }

  private async buildHierarchy(
    element: GroupingElement,
    dbResult: GroupingElement[],
    roles: string[],
    dashboardsFromDb: Dashboard[],
  ): Promise<GroupingElementWithChildren[]> {
    const children: GroupingElementWithChildren[] = [];

    for (const dbElement of dbResult) {
      const userIsAuthorizedToViewElement = this.checkDashboardRoles(
        dbElement,
        dashboardsFromDb,
      );

      if (
        dbElement.parentGroupingElementId == element.id &&
        userIsAuthorizedToViewElement
      ) {
        const dbElementWithChildren: GroupingElementWithChildren = {
          ...dbElement,
          children: [],
        };

        dbElementWithChildren.children = await this.buildHierarchy(
          dbElement,
          dbResult,
          roles,
          dashboardsFromDb,
        );

        children.push(dbElementWithChildren);
      }
    }

    return children;
  }

  async getById(
    id: string,
    roles: Array<string>,
    tenantFromRequest: string,
  ): Promise<GroupingElement> {
    const groupingElementById = await this.groupingElementRepo.getById(id);
    const dashboardsFromDb = await this.getDashboardsForGroupingElements(
      [groupingElementById],
      tenantFromRequest,
      roles,
    );
    const userIsAuthorizedToViewElement = this.checkDashboardRoles(
      groupingElementById,
      dashboardsFromDb,
    );

    if (userIsAuthorizedToViewElement) {
      return groupingElementById;
    } else {
      throw new HttpException('Not authorized', HttpStatus.UNAUTHORIZED);
    }
  }

  async getByUrl(url: string): Promise<GroupingElement> {
    return this.groupingElementRepo.getByUrl(url);
  }

  async create(row: NewGroupingElement): Promise<GroupingElement> {
    await this.validateTenantAbbreviation(row);

    if (row.url) {
      const newUrlLower = row.url.toLowerCase();

      // Fetch Grouping Elements for the tenant to ensure URL uniqueness
      const existingGroupingElements =
        await this.groupingElementRepo.getByTenantAbbreviation(
          row.tenantAbbreviation,
        );

      const groupingElementWithNewUrl = existingGroupingElements.find(
        (element) => element.url.toLowerCase() === newUrlLower,
      );

      if (groupingElementWithNewUrl) {
        this.logger.warn(
          `Grouping Element with the URL "${groupingElementWithNewUrl.url}" already exists for Tenant: ${row.tenantAbbreviation}`,
        );
        throw new HttpException(
          `Grouping Element with the URL "${groupingElementWithNewUrl.url}" already exists for Tenant: ${row.tenantAbbreviation}`,
          HttpStatus.CONFLICT,
        );
      }
    }

    return this.groupingElementRepo.create(row);
  }

  async update(
    id: string,
    values: Partial<GroupingElement>,
    roles: string[],
    transaction?: DbType,
  ): Promise<GroupingElement> {
    const existingGroupingElement = await this.groupingElementRepo.getById(id);

    if (!existingGroupingElement) {
      throw new NotFoundException("Grouping Element wasn't found");
    }

    if (values.url) {
      const newUrlLower = values.url.toLowerCase();

      const existingGroupingElements =
        await this.groupingElementRepo.getByTenantAbbreviation(
          values.tenantAbbreviation,
        );

      const groupingElementWithNewUrl = existingGroupingElements.find(
        (element) =>
          element.id !== id && element.url.toLowerCase() === newUrlLower,
      );

      if (groupingElementWithNewUrl) {
        this.logger.warn(
          `Grouping Element with the updated URL "${groupingElementWithNewUrl.url}" already exists for Tenant: ${values.tenantAbbreviation}`,
        );
        throw new HttpException(
          `Grouping Element with the updated URL "${groupingElementWithNewUrl.url}" already exists for Tenant: ${values.tenantAbbreviation}`,
          HttpStatus.CONFLICT,
        );
      }
    }
    await this.manageUpdateDependencies(id, values, roles);

    return await this.groupingElementRepo.update(id, values, transaction);
  }

  async delete(id: string): Promise<GroupingElement> {
    const children =
      await this.groupingElementRepo.getChildrenForGroupingElementById(id);

    for (const child of children) {
      await this.delete(child.id);
    }

    return this.groupingElementRepo.delete(id);
  }

  async deleteByUrl(
    url: string,
    transaction?: DbType,
  ): Promise<GroupingElement> {
    return this.groupingElementRepo.deleteByUrl(url, transaction);
  }

  private async validateTenantAbbreviation(
    groupingElement: NewGroupingElement | Partial<GroupingElement>,
  ): Promise<void> {
    if (groupingElement.tenantAbbreviation) {
      const tenantExists = await this.tenantRepo.existsByAbbreviation(
        groupingElement.tenantAbbreviation,
      );

      if (!tenantExists) {
        throw new HttpException(
          'Tenant with abbreviation does not exist',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
  }

  private async attachChildrenToParent(
    oldGroupingElement: GroupingElement,
    roles: string[],
  ): Promise<void> {
    const children: GroupingElement[] =
      await this.groupingElementRepo.getChildrenForGroupingElementById(
        oldGroupingElement.id,
      );
    const childrenOfParent: GroupingElement[] =
      await this.groupingElementRepo.getChildrenForGroupingElementById(
        oldGroupingElement.parentGroupingElementId,
      );

    let parentChildrenLength = childrenOfParent.length - 1;

    if (children.length > 0) {
      children.forEach((child) => {
        parentChildrenLength++;

        child.parentGroupingElementId =
          oldGroupingElement.parentGroupingElementId;
        child.position = parentChildrenLength;

        this.update(child.id, child, roles);
      });
    }
  }

  private async buildResponse(
    groupingElementsFromDb: GroupingElement[],
    dashboardsFromDb: Dashboard[],
    roles: Array<string>,
  ): Promise<GroupingElementWithChildren[]> {
    const result: GroupingElementWithChildren[] = [];

    for (const element of groupingElementsFromDb) {
      const userIsAuthorizedToViewGroupingElement = this.checkDashboardRoles(
        element,
        dashboardsFromDb,
      );

      if (
        element.parentGroupingElementId == null &&
        userIsAuthorizedToViewGroupingElement
      ) {
        const groupingElement: GroupingElementWithChildren = {
          ...element,
          children: [],
        };

        groupingElement.children = await this.buildHierarchy(
          element,
          groupingElementsFromDb,
          roles,
          dashboardsFromDb,
        );

        result.push(groupingElement);
      }
    }

    return result;
  }

  private isGroupingElementConvertingToDashboardPage(
    oldGroupingElement: GroupingElement,
    values: Partial<GroupingElement>,
  ): boolean {
    return !oldGroupingElement.isDashboard && values.isDashboard;
  }

  private async manageUpdateDependencies(
    id: string,
    values: Partial<GroupingElement>,
    roles: string[],
  ): Promise<void> {
    const oldGroupingElement = await this.groupingElementRepo.getById(id);

    if (
      this.isGroupingElementConvertingToDashboardPage(
        oldGroupingElement,
        values,
      )
    ) {
      await this.attachChildrenToParent(oldGroupingElement, roles);
    }
  }

  async getChildrenForGroupingElementById(
    parentId?: string,
  ): Promise<GroupingElement[]> {
    return this.groupingElementRepo.getChildrenForGroupingElementById(parentId);
  }

  private checkDashboardRoles(
    element: GroupingElement,
    dashboards: Dashboard[],
  ): boolean {
    if (element.isDashboard) {
      return dashboards.some((dashboard) => dashboard.url === element.url);
    }

    return true;
  }

  private async getDashboardsForGroupingElements(
    groupingElementsFromDb: GroupingElement[],
    tenantFromRequest: string,
    roles: Array<string>,
  ): Promise<Dashboard[]> {
    const groupingElementUrls = groupingElementsFromDb.map(
      (groupingElement) => groupingElement.url,
    );
    let tenantId: string;

    if (tenantFromRequest) {
      const tenantByAbbreviation =
        await this.tenantRepo.getTenantByAbbreviation(tenantFromRequest);

      if (tenantByAbbreviation) {
        tenantId = tenantByAbbreviation.id;
      }
    }

    return this.dashboardRepo.getByUrls(groupingElementUrls, roles, tenantId);
  }
}
