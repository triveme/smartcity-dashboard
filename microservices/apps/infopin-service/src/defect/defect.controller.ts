import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Defect } from '@app/postgres-db/schemas/defect.schema';
import { DefectCount, DefectService } from './defect.service';
import { Public } from '@app/auth-helper/PublicDecorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../multer-config';
import { AuthenticatedRequest } from '@app/auth-helper';

@Controller('defects')
export class DefectController {
  constructor(private readonly service: DefectService) {}

  @Public()
  @Get('/')
  async getAll(@Req() request: AuthenticatedRequest): Promise<Defect[]> {
    const roles = request.roles ?? [];

    return this.service.getAll(roles);
  }

  @Public()
  @Get('/:id')
  async getById(@Req() request: AuthenticatedRequest): Promise<DefectCount> {
    const roles = request.roles ?? [];

    return this.service.getCount(roles);
  }

  @Public()
  @Post('/')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async create(
    @Body() row: Defect,
    @UploadedFile() file: Express.Multer.File,
    @Req() request: AuthenticatedRequest,
  ): Promise<Defect> {
    const roles = request.roles ?? [];

    row.imgPath = file ? file.path : row.imgPath;

    return this.service.create(row, roles);
  }
}
