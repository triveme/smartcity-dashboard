import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { and, desc, eq, gt, gte, lt, lte, SQL } from 'drizzle-orm';
import { Report, reports } from '@app/postgres-db/schemas/report.schema';
import { AuthenticatedRequest } from '@app/auth-helper';
import {
  checkAuthorizationToRead,
  checkAuthorizationToWrite,
  checkRequiredRights,
} from '@app/auth-helper/right-management/right-management.service';
import { RoleUtil } from '../utility/RoleUtil';

@Injectable()
export class ReportService {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getAll(request: AuthenticatedRequest): Promise<Report[]> {
    const roles = request.roles ?? [];
    const querySearchParams = this.createQueryParams(request);

    const dbReports = await this.db
      .select()
      .from(reports)
      .where(querySearchParams)
      .orderBy(desc(reports.createdAt));

    return dbReports.filter((report) => {
      return checkRequiredRights(report, report.readRoles, roles);
    });
  }

  async getById(id: string, request: AuthenticatedRequest): Promise<Report> {
    const roles = request.roles ?? [];
    const querySearchParams = this.createQueryParams(request);

    const dbReports = await this.db
      .select()
      .from(reports)
      .where(and(eq(reports.id, id), querySearchParams));

    if (dbReports.length === 0)
      throw new HttpException(
        `No climate projects found with id ${id}`,
        HttpStatus.NOT_FOUND,
      );

    const dbReport = dbReports[0];
    checkAuthorizationToRead(dbReport, roles);

    return dbReport;
  }

  async create(row: Report, roles: Array<string>): Promise<Report> {
    /**
     * Weirdly required, because startAt and endAt change their types from
     * Date to string while being sent to the backend?
     * Otherwise, drizzle throws a "valueToIsoString is not at function" error
     */
    row.startAt = new Date(row.startAt);
    row.endAt = new Date(row.endAt);

    RoleUtil.populateRoles(row, roles);

    const createdReports = await this.db
      .insert(reports)
      .values(row)
      .returning();

    return createdReports.length > 0 ? createdReports[0] : null;
  }

  async update(
    id: string,
    values: Partial<Report>,
    roles: Array<string>,
  ): Promise<Report> {
    const existingReports = await this.db
      .select()
      .from(reports)
      .where(eq(reports.id, id));

    if (existingReports.length === 0)
      throw new HttpException(
        'Project for update not found',
        HttpStatus.NOT_FOUND,
      );

    checkAuthorizationToWrite(existingReports[0], roles);

    values.updatedAt = new Date(new Date(Date.now()));

    const updatedReports = await this.db
      .update(reports)
      .set(values)
      .where(eq(reports.id, id))
      .returning();

    return updatedReports.length > 0 ? updatedReports[0] : null;
  }

  async delete(id: string, roles: Array<string>): Promise<Report> {
    const adminRole = process.env.ADMIN_ROLE;

    if (!roles.includes(adminRole))
      throw new HttpException(
        'Unauthorized to delete climate project',
        HttpStatus.FORBIDDEN,
      );

    const dbReports = await this.db
      .select()
      .from(reports)
      .where(eq(reports.id, id));

    if (dbReports.length === 0)
      throw new HttpException(
        'Project for update not found',
        HttpStatus.NOT_FOUND,
      );

    checkAuthorizationToWrite(dbReports[0], roles);

    const deletedReports = await this.db
      .delete(reports)
      .where(eq(reports.id, id))
      .returning();

    return deletedReports.length > 0 ? deletedReports[0] : null;
  }

  private createQueryParams(request: AuthenticatedRequest): undefined | SQL {
    if (Object.keys(request.query).length === 0) return undefined;

    let dateQuery;

    if (request.query['status'] && request.query['status'] !== 'all') {
      if (request.query['status'] === 'archived') {
        dateQuery = and(
          lt(reports.startAt, new Date(Date.now())),
          lt(reports.endAt, new Date(Date.now())),
        );
      } else if (request.query['status'] === 'active') {
        dateQuery = and(
          lte(reports.startAt, new Date(Date.now())),
          gte(reports.endAt, new Date(Date.now())),
        );
      } else if (request.query['status'] === 'planned') {
        dateQuery = and(
          gt(reports.startAt, new Date(Date.now())),
          gt(reports.endAt, new Date(Date.now())),
        );
      } else if (Array.isArray(request.query['status'])) {
        request.query['status']
          .toString()
          .split(',')
          .forEach((status) => {
            if (status === 'archiv') {
              dateQuery = and(
                lt(reports.startAt, new Date(Date.now())),
                lt(reports.endAt, new Date(Date.now())),
              );
            } else if (status === 'active') {
              dateQuery = and(
                lte(reports.startAt, new Date(Date.now())),
                gte(reports.endAt, new Date(Date.now())),
              );
            } else if (status === 'geplant') {
              dateQuery = and(
                gt(reports.startAt, new Date(Date.now())),
                gt(reports.endAt, new Date(Date.now())),
              );
            }
          });
      }
    }

    let category;

    if (request.query['category'] && request.query['category'] !== 'all') {
      category = eq(reports.category, request.query['category'].toString());
    }

    return and(dateQuery, category);
  }
}
