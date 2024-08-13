import { Dashboard, Widget } from '@app/postgres-db/schemas';
import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { DashboardWithContent } from '../../../../apps/dashboard-service/src/dashboard/dashboard.service';
import { ClimateProject } from '@app/postgres-db/schemas/climate-project.schema';
import { Report } from '@app/postgres-db/schemas/report.schema';
import { AuthData } from '@app/postgres-db/schemas/auth-data.schema';

const logger = new Logger('Right Management Service');

function isRoleCheckRequired(
  dbItem:
    | Widget
    | Dashboard
    | DashboardWithContent
    | Partial<Dashboard>
    | ClimateProject
    | Report
    | AuthData,
  itemRoles: Array<string>,
): boolean {
  return (
    (dbItem.visibility && dbItem.visibility != 'public') ||
    (itemRoles && itemRoles.length > 0)
  );
}

export function checkForRoleMatches(
  itemRoles: string[],
  rolesFromRequest: string[],
): boolean {
  return itemRoles.some((value) => rolesFromRequest.includes(value));
}

export function checkRequiredRights(
  dbItem:
    | Widget
    | Dashboard
    | DashboardWithContent
    | Partial<Dashboard>
    | ClimateProject
    | Report
    | AuthData,
  itemRoles: string[],
  rolesFromRequest: string[],
): boolean {
  if (isRoleCheckRequired(dbItem, itemRoles)) {
    if (itemRoles === undefined) return false;
    return checkForRoleMatches(itemRoles, rolesFromRequest);
  }
  return true;
}

export function checkAuthorizationToWrite(
  dbItem:
    | Widget
    | Dashboard
    | DashboardWithContent
    | Partial<Dashboard>
    | ClimateProject
    | Report
    | AuthData,
  rolesFromRequest: string[],
): void {
  const thereAreRoleMatches = checkRequiredRights(
    dbItem,
    dbItem.writeRoles,
    rolesFromRequest,
  );

  if (!thereAreRoleMatches) {
    logger.error(`Unauthorized try to write ${dbItem.id}`);
    throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
  }
}

export function checkAuthorizationToRead(
  dbItem:
    | Widget
    | Dashboard
    | DashboardWithContent
    | Partial<Dashboard>
    | ClimateProject
    | Report
    | AuthData,
  rolesFromRequest: string[],
): void {
  const thereAreRoleMatches = checkRequiredRights(
    dbItem,
    dbItem.readRoles,
    rolesFromRequest,
  );

  if (!thereAreRoleMatches) {
    logger.error(`Unauthorized try to read ${dbItem.id}`);

    throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
  }
}
