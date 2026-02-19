/* eslint @typescript-eslint/no-explicit-any: 0 */
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { DataService } from './data/data.service';
import { ProjectWithCategory, Project } from '@app/postgres-db/schemas';
import { AuthHelperUtility } from '@app/auth-helper';

@Injectable()
export class ProjectDataService {
  constructor(
    private readonly dataService: DataService,
    private readonly authHelper: AuthHelperUtility,
  ) {}

  async create(
    row: ProjectWithCategory,
    roles: Array<string>,
  ): Promise<Project> {
    const checks = [this.authHelper.isProjectAdmin(roles)];

    if (checks.some(Boolean)) {
      try {
        const newRow = await this.dataService.create(row);
        return newRow;
      } catch (error) {
        throw new BadRequestException(error.detail || error.message);
      }
    } else {
      throw new HttpException(
        'Unauthorized to add project',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async update(
    id: string,
    row: Partial<Project>,
    roles: Array<string>,
  ): Promise<Project> {
    const checks = [this.authHelper.isProjectAdmin(roles)];
    if (checks.some(Boolean)) {
      const existingProject = await this.getById(id);
      if (!existingProject) {
        throw new HttpException(
          `Project not found for the given ID: ${id}`,
          HttpStatus.NOT_FOUND,
        );
      }
      const updatedValues = { ...row };
      return this.dataService.update(id, updatedValues);
    } else {
      throw new HttpException(
        'Unauthorized to edit project',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async getAll(
    tenant: string,
    category: string,
    status: string,
    roles: Array<string>,
  ): Promise<Project[]> {
    const isAdmin = this.authHelper.isProjectAdmin(roles);
    return this.dataService.getAll(tenant, category, status, isAdmin);
  }

  async getById(id: string): Promise<Project> {
    return this.dataService.getById(id);
  }

  async delete(id: string, roles: Array<string>): Promise<Project> {
    const checks = [this.authHelper.isProjectAdmin(roles)];
    if (checks.some(Boolean)) {
      const r = await this.dataService.delete(id);
      if (!r) {
        throw new HttpException(`Entry ${id} not found`, HttpStatus.NOT_FOUND);
      } else {
        return r;
      }
    } else {
      throw new HttpException(
        'Unauthorized to delete project',
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
