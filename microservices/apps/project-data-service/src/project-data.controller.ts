import {
  BadRequestException,
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
import sharp = require('sharp');

const MAX_PICTURE_DIMENSION = 2048;
const PICTURE_JPEG_QUALITY = 80;
const ALLOWED_PICTURE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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
    if (!file || !ALLOWED_PICTURE_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Nicht unterstütztes Bildformat. Erlaubt sind: ${ALLOWED_PICTURE_MIME_TYPES.join(', ')}`,
      );
    }
    const roles = request.roles ?? [];
    let jpegBuffer: Buffer;
    try {
      jpegBuffer = await sharp(file.buffer)
        .rotate()
        .resize({
          width: MAX_PICTURE_DIMENSION,
          height: MAX_PICTURE_DIMENSION,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .flatten({ background: '#ffffff' })
        .jpeg({ quality: PICTURE_JPEG_QUALITY })
        .toBuffer();
    } catch {
      throw new BadRequestException('Bilddatei konnte nicht gelesen werden.');
    }
    const base64 = jpegBuffer.toString('base64');
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
    return this.pictureService.getById(id, pId);
  }

  @Public()
  @Delete('/:id/picture/:pId')
  async deletePicture(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('pId', new ParseUUIDPipe({ version: '4' })) pId: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<Picture> {
    const roles = request.roles ?? [];
    return this.pictureService.delete(id, pId, roles);
  }
}
