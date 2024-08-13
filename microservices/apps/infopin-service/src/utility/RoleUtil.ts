import { Defect } from '@app/postgres-db/schemas/defect.schema';
import { Report } from '@app/postgres-db/schemas/report.schema';
import { ClimateProject } from '@app/postgres-db/schemas/climate-project.schema';
import { NewDashboard } from '@app/postgres-db/schemas';
import { AuthData } from '@app/postgres-db/schemas/auth-data.schema';

export class RoleUtil {
  public static populateRoles(
    item: Defect | Report | ClimateProject | NewDashboard | AuthData,
    rolesFromRequest: string[],
  ): void {
    if (item.visibility === 'protected') {
      if (this.isRoleEmpty(item.writeRoles)) {
        item.writeRoles = rolesFromRequest;
      }
      if (this.isRoleEmpty(item.readRoles)) {
        item.readRoles = rolesFromRequest;
      }
    } else if (item.visibility === 'invisible') {
      item.writeRoles = rolesFromRequest;
      item.readRoles = rolesFromRequest;
    } else if (item.visibility === 'public') {
      item.writeRoles = [];
      item.readRoles = [];
    }
  }

  private static isRoleEmpty(roles: string[]): boolean {
    return roles === undefined || roles.length === 0;
  }
}
