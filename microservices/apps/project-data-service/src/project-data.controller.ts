import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProjectDataService } from './project-data.service';
import { AuthenticatedRequest } from '@app/auth-helper';
import { Public } from '@app/auth-helper/PublicDecorator';
import { Project, ProjectWithCategory } from '@app/postgres-db/schemas';
import { Picture } from '@app/postgres-db/schemas/picture.schema';
import { PictureDataService } from './picture-data.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('project')
export class ProjectDataController {
  constructor(
    private readonly service: ProjectDataService,
    private readonly pictureService: PictureDataService,
  ) {}

  @Public()
  @Post('/')
  async create(
    @Body() row: ProjectWithCategory,
    @Req() request: AuthenticatedRequest,
  ): Promise<Project> {
    const roles = request.roles ?? [];
    return this.service.create(row, roles);
  }

  @Public()
  @Patch('/:id')
  async edit(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() row: Partial<Project>,
    @Req() request: AuthenticatedRequest,
  ): Promise<Project> {
    const roles = request.roles ?? [];
    return this.service.update(id, row, roles);
  }

  @Get('/')
  async getAll(
    @Query('tenant') tenant: string,
    @Query('category') category: string,
    @Query('status') status: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<Project[]> {
    const roles = request.roles ?? [];
    return this.service.getAll(tenant, category, status, roles);
  }

  @Get('/:id')
  async getById(@Param('id') id: string): Promise<Project> {
    return this.service.getById(id);
  }

  @Public()
  @Delete('/:id')
  async delete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<Project> {
    const roles = request.roles ?? [];
    return this.service.delete(id, roles);
  }

  @Public()
  @Post('/:id/picture')
  @UseInterceptors(FileInterceptor('data'))
  async createPicture(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() request: AuthenticatedRequest,
  ): Promise<Picture> {
    const roles = request.roles ?? [];
    const base64 = file.buffer.toString('base64');
    return this.pictureService.create(id, base64, roles);
  }

  @Get('/:id/picture')
  async getAllPictures(@Param('id') id: string): Promise<Picture[]> {
    return this.pictureService.getAll(id);
  }

  @Get('/:id/picture/:pId')
  async getPictureById(
    @Param('id') id: string,
    @Param('pId') pId: string,
  ): Promise<Picture> {
    return this.pictureService.getById(pId, id);
  }

  @Public()
  @Delete('/:id/picture/:pId')
  async deletePicture(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('pId', new ParseUUIDPipe({ version: '4' })) pId: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<Picture> {
    const roles = request.roles ?? [];
    return this.pictureService.delete(pId, id, roles);
  }
}
