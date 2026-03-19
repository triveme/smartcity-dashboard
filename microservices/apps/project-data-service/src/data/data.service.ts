// eslint-disable-next-line prettier/prettier
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import {
  ProjectWithCategory,
  Project,
  project,
  projectCategory,
} from '@app/postgres-db/schemas';
import { eq, and, sql } from 'drizzle-orm';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { DataSource } from '@app/postgres-db/schemas/data-source.schema';
import { QueryConfig } from '@app/postgres-db/schemas/query-config.schema';
import { QueryResult } from 'pg';

export type QueryBatch = {
  queryIds: string[];
  query_config: QueryConfig;
  data_source: DataSource;
};

const ProjectStatus = {
  Active: 'ACTIVE',
  Completed: 'PLANNED',
  Cancelled: 'ARCHIVED',
} as const;
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];

@Injectable()
export class DataService {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async create(
    values: ProjectWithCategory,
    transaction?: DbType,
  ): Promise<Project> {
    const dbActor = transaction ?? this.db;
    const projectId = crypto.randomUUID();

    const categoryId = await this.getCategoryId(values.category);

    await dbActor.insert(project).values({
      id: projectId,
      title: values.title,
      description: values.description,
      status: values.status,
      cost: values.cost,
      district: values.district,
      street_name: values.street_name,
      location: values.location,
      line_locations: values.line_locations,
      contact_person: values.contact_person,
      is_public: values.is_public,
      start_date: values.start_date ? new Date(values.start_date) : null,
      end_date: values.end_date ? new Date(values.end_date) : null,
      category_id: categoryId,
      tenantAbbreviation: values.tenantAbbreviation,
    });

    return this.findOne(projectId, dbActor);
  }

  async update(
    id: string,
    values: Partial<ProjectWithCategory>,
    transaction?: DbType,
  ): Promise<Project> {
    const dbActor = transaction ?? this.db;

    const { category, ...dataToUpdate } = values;

    const updatePayload = {
      ...dataToUpdate,
      start_date: values.start_date ? new Date(values.start_date) : null,
      end_date: values.end_date ? new Date(values.end_date) : null,
    };

    delete (updatePayload as Project).id;
    if (category) {
      (updatePayload as Project).category_id =
        await this.getCategoryId(category);
    }

    await dbActor.update(project).set(updatePayload).where(eq(project.id, id));

    return this.findOne(id, dbActor);
  }

  async delete(id: string): Promise<Project> {
    const deletedProjects = await this.db
      .delete(project)
      .where(eq(project.id, id))
      .returning();
    return deletedProjects.length > 0 ? deletedProjects[0] : null;
  }

  async getAll(
    tenant: string,
    category: string,
    status: string,
    isAdmin: boolean,
  ): Promise<Project[]> {
    if (!this.isProjectStatus(status)) {
      throw new HttpException('Status not accepted', HttpStatus.BAD_REQUEST);
    }

    const conditions = [eq(project.tenantAbbreviation, tenant)];

    if (category) {
      conditions.push(
        eq(project.category_id, await this.getCategoryId(category)),
      );
    }
    if (status) {
      conditions.push(eq(project.status, status));
    }
    if (!isAdmin) {
      conditions.push(eq(project.is_public, true));
    }

    const result = await this.db
      .select({
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
        cost: project.cost,
        district: project.district,
        street_name: project.street_name,
        location: project.location,
        line_locations: project.line_locations,
        contact_person: project.contact_person,
        is_public: project.is_public,
        start_date: project.start_date,
        end_date: project.end_date,
        category: projectCategory.name,
        category_id: projectCategory.id,
        tenantAbbreviation: project.tenantAbbreviation,
      })
      .from(project)
      .innerJoin(projectCategory, eq(project.category_id, projectCategory.id))
      .where(and(...conditions));
    return result;
  }

  async getCategoryId(category: string): Promise<string> {
    const result = await this.getProjectCategoryByName(category);
    if (result.rows.length === 0) {
      throw new Error(`Category not found: ${category}`);
    }
    return result.rows[0].id as string;
  }
  async getProjectCategoryByName(
    name: string,
  ): Promise<QueryResult<Record<string, unknown>>> {
    return await this.db.execute(sql`
        SELECT id, name
        FROM public.project_category
        WHERE name = ${name}
        ORDER BY name;
      `);
  }

  async getById(id: string): Promise<Project> {
    return this.findOne(id, this.db);
  }

  private isProjectStatus(value: string): value is ProjectStatus {
    if (!value) return true;
    return Object.values(ProjectStatus).includes(value as ProjectStatus);
  }

  private async findOne(
    id: string,
    dbActor: DbType = this.db,
  ): Promise<Project> {
    const result = await dbActor
      .select({
        id: project.id,
        title: project.title,
        description: project.description,
        status: project.status,
        cost: project.cost,
        district: project.district,
        street_name: project.street_name,
        location: project.location,
        line_locations: project.line_locations,
        contact_person: project.contact_person,
        is_public: project.is_public,
        start_date: project.start_date,
        end_date: project.end_date,
        category: projectCategory.name,
        category_id: projectCategory.id,
        tenantAbbreviation: project.tenantAbbreviation,
      })
      .from(project)
      .innerJoin(projectCategory, eq(project.category_id, projectCategory.id))
      .where(eq(project.id, id));

    return result.length > 0 ? result[0] : null;
  }
}
