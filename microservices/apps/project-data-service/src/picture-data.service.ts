/* eslint @typescript-eslint/no-explicit-any: 0 */
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { AuthHelperUtility } from '@app/auth-helper';
import { NewPicture, Picture } from '@app/postgres-db/schemas/picture.schema';
import { InternalPictureDataService } from './data/picture.service';

@Injectable()
export class PictureDataService {
  constructor(
    private readonly dataService: InternalPictureDataService,
    private readonly authHelper: AuthHelperUtility,
  ) {}

  async create(
    id: string,
    data: string,
    roles: Array<string>,
  ): Promise<Picture> {
    const checks = [this.authHelper.isProjectAdmin(roles)];

    const newPicture: NewPicture = {
      id: crypto.randomUUID(),
      data: data,
      projectId: id,
      created_at: new Date(),
    };

    if (checks.some(Boolean)) {
      try {
        const newRow = await this.dataService.create(newPicture);
        return newRow;
      } catch (error) {
        throw new BadRequestException(error.detail || error.message);
      }
    } else {
      throw new HttpException(
        'Unauthorized to add source',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  async getAll(id: string): Promise<Picture[]> {
    return this.dataService.getAll(id);
  }

  async getById(id: string, pId: string): Promise<Picture> {
    return this.dataService.getById(id, pId);
  }

  async delete(
    id: string,
    pId: string,
    roles: Array<string>,
  ): Promise<Picture> {
    const checks = [this.authHelper.isProjectAdmin(roles)];
    if (checks.some(Boolean)) {
      const r = await this.dataService.delete(id, pId);
      if (!r) {
        throw new HttpException(`Entry ${id} not found`, HttpStatus.NOT_FOUND);
      } else {
        return r;
      }
    } else {
      throw new HttpException(
        'Unauthorized to add source',
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
