import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import { DbType } from '@app/postgres-db';
import {
  GroupingElement,
  NewGroupingElement,
} from '@app/postgres-db/schemas/dashboard.grouping-element.schema';
import { TenantService } from '../tenant/tenant.service';
import {
  GroupingElementRepo,
  GroupingElementWithChildren,
} from './grouping-element.repo';
import { DashboardRepo } from '../dashboard/dashboard.repo';

@Injectable()
export class GroupingElementService {
  constructor(
    private readonly dashboardRepo: DashboardRepo,
    private readonly groupingElementRepo: GroupingElementRepo,
    private readonly tenantService: TenantService,
  ) {}

  private readonly logger = new Logger(GroupingElementService.name);

  async getAll(roles: string[]): Promise<GroupingElementWithChildren[]> {
    const dbResult: GroupingElement[] = await this.groupingElementRepo.getAll();
    const result: GroupingElementWithChildren[] = [];

    for (const element of dbResult) {
      const userIsAuthorizedToViewGroupingElement =
        await this.checkDashboardRoles(element, roles);

      if (
        element.parentGroupingElementId == null &&
        userIsAuthorizedToViewGroupingElement
      ) {
        const groupingElement: GroupingElementWithChildren = element;

        groupingElement.children = await this.buildHierarchy(
          element,
          dbResult,
          roles,
        );

        result.push(groupingElement);
      }
    }

    return result;
  }

  async getByTenantAbbreviation(
    abbreviation: string,
    roles: string[],
  ): Promise<GroupingElementWithChildren[]> {
    const dbResult: GroupingElement[] =
      await this.groupingElementRepo.getByTenantAbbreviation(abbreviation);

    if (dbResult.length === 0) {
      this.logger.error(
        `GroupingElementWithChildren not found for the given tenant ${abbreviation}`,
      );
    }

    const result: GroupingElementWithChildren[] = [];

    for (const element of dbResult) {
      const userIsAuthorizedToViewGroupingElement =
        await this.checkDashboardRoles(element, roles);

      if (
        element.parentGroupingElementId == null &&
        userIsAuthorizedToViewGroupingElement
      ) {
        const groupingElement: GroupingElementWithChildren = element;

        groupingElement.children = await this.buildHierarchy(
          element,
          dbResult,
          roles,
        );

        result.push(groupingElement);
      }
    }

    return result;
  }

  private async buildHierarchy(
    element: GroupingElement,
    dbResult: GroupingElement[],
    roles: string[],
  ): Promise<GroupingElementWithChildren[]> {
    const children: GroupingElementWithChildren[] = [];

    for (const dbElement of dbResult) {
      const userIsAuthorizedToViewElement = await this.checkDashboardRoles(
        dbElement,
        roles,
      );

      if (
        dbElement.parentGroupingElementId == element.id &&
        userIsAuthorizedToViewElement
      ) {
        const dbElementWithChildren: GroupingElementWithChildren = dbElement;

        dbElementWithChildren.children = await this.buildHierarchy(
          dbElement,
          dbResult,
          roles,
        );

        children.push(dbElement);
      }
    }

    return children;
  }

  async getById(id: string, roles: Array<string>): Promise<GroupingElement> {
    const groupingElementById = await this.groupingElementRepo.getById(id);
    const userIsAuthorizedToViewElement = await this.checkDashboardRoles(
      groupingElementById,
      roles,
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

    return this.groupingElementRepo.create(row);
  }

  async update(
    id: string,
    values: Partial<GroupingElement>,
    roles: string[],
    transaction?: DbType,
  ): Promise<GroupingElement> {
    await this.validateTenantAbbreviation(values);
    await this.manageUpdateDependencies(id, values, roles);

    return this.groupingElementRepo.update(id, values, transaction);
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
      const tenantExists = await this.tenantService.existsByAbbreviation(
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
    const oldGroupingElement = await this.getById(id, roles);

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

  private async checkDashboardRoles(
    element: GroupingElement,
    roles: string[],
  ): Promise<boolean> {
    if (element.isDashboard) {
      const dashboard = await this.dashboardRepo.getByUrl(element.url);

      if (!dashboard) return false;

      if (dashboard.visibility !== 'public') {
        for (const userRole of roles) {
          const foundMatchingRoles = dashboard.readRoles.some(
            (dashboardRole) => dashboardRole === userRole,
          );
          if (foundMatchingRoles) return true;
        }

        return false;
      }

      return true;
    }

    return true;
  }
}
