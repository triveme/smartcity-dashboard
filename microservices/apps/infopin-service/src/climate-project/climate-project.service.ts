import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { and, desc, eq, SQL } from 'drizzle-orm';
import {
  ClimateProject,
  climateProjects,
} from '@app/postgres-db/schemas/climate-project.schema';
import { AuthenticatedRequest } from '@app/auth-helper';
import {
  checkAuthorizationToRead,
  checkAuthorizationToWrite,
  checkRequiredRights,
} from '@app/auth-helper/right-management/right-management.service';
import { RoleUtil } from '../utility/RoleUtil';

@Injectable()
export class ClimateProjectService {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getAll(request: AuthenticatedRequest): Promise<ClimateProject[]> {
    const roles = request.roles ?? [];
    const querySearchParams = this.createQueryParams(request);

    const dbClimateProjects = await this.db
      .select()
      .from(climateProjects)
      .where(querySearchParams)
      .orderBy(desc(climateProjects.createdAt));

    return dbClimateProjects.filter((project) => {
      return checkRequiredRights(project, project.readRoles, roles);
    });
  }

  async getById(
    id: string,
    request: AuthenticatedRequest,
  ): Promise<ClimateProject> {
    const roles = request.roles ?? [];
    const querySearchParams = this.createQueryParams(request);

    const dbClimateProjects = await this.db
      .select()
      .from(climateProjects)
      .where(and(eq(climateProjects.id, id), querySearchParams));

    if (dbClimateProjects.length === 0)
      throw new HttpException(
        `No climate projects found with id ${id}`,
        HttpStatus.NOT_FOUND,
      );

    const dbClimateProject = dbClimateProjects[0];
    checkAuthorizationToRead(dbClimateProject, roles);

    return dbClimateProject;
  }

  async create(
    row: ClimateProject,
    roles: Array<string>,
  ): Promise<ClimateProject> {
    /**
     * Weirdly required, because startAt and endAt change their types from
     * Date to string while being sent to the backend?
     * Otherwise, drizzle throws a "valueToIsoString is not at function" error
     */
    row.startAt = new Date(row.startAt);
    row.endAt = new Date(row.endAt);

    RoleUtil.populateRoles(row, roles);

    const createdClimateProjects = await this.db
      .insert(climateProjects)
      .values(row)
      .returning();

    return createdClimateProjects.length > 0 ? createdClimateProjects[0] : null;
  }

  async update(
    id: string,
    values: Partial<ClimateProject>,
    roles: Array<string>,
  ): Promise<ClimateProject> {
    const projects = await this.db
      .select()
      .from(climateProjects)
      .where(eq(climateProjects.id, id));

    if (projects.length === 0)
      throw new HttpException(
        'Project for update not found',
        HttpStatus.NOT_FOUND,
      );

    checkAuthorizationToWrite(projects[0], roles);

    values.updatedAt = new Date(new Date(Date.now()));

    const updatedClimateProjects = await this.db
      .update(climateProjects)
      .set(values)
      .where(eq(climateProjects.id, id))
      .returning();

    return updatedClimateProjects.length > 0 ? updatedClimateProjects[0] : null;
  }

  async delete(id: string, roles: Array<string>): Promise<ClimateProject> {
    const projects = await this.db
      .select()
      .from(climateProjects)
      .where(eq(climateProjects.id, id));

    if (projects.length === 0)
      throw new HttpException(
        'Project for update not found',
        HttpStatus.NOT_FOUND,
      );

    checkAuthorizationToWrite(projects[0], roles);

    const deletedClimateProjects = await this.db
      .delete(climateProjects)
      .where(eq(climateProjects.id, id))
      .returning();

    return deletedClimateProjects.length > 0 ? deletedClimateProjects[0] : null;
  }

  private createQueryParams(request: AuthenticatedRequest): undefined | SQL {
    if (Object.keys(request.query).length === 0) return undefined;

    let timeHorizon;

    if (
      request.query['timeHorizon'] &&
      request.query['timeHorizon'] !== 'all'
    ) {
      const timeHorizonSearchString = this.getTimeHorizonString(
        request.query['timeHorizon'].toString(),
      );
      timeHorizon = eq(climateProjects.timeHorizon, timeHorizonSearchString);
    }

    let category;

    if (request.query['category'] && request.query['category'] !== 'all') {
      const categorySearchString: string = request.query['category'].toString();
      category = eq(climateProjects.category, categorySearchString);
    }

    return and(timeHorizon, category);
  }

  private getTimeHorizonString(
    timeHorizonQuery: string,
  ): 'shortterm' | 'midterm' | 'longterm' | 'archive' | undefined {
    if (
      timeHorizonQuery === 'shortterm' ||
      timeHorizonQuery === 'midterm' ||
      timeHorizonQuery === 'longterm' ||
      timeHorizonQuery === 'archive'
    ) {
      return timeHorizonQuery;
    }

    return undefined;
  }
}
