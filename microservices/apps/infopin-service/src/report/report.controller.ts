import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { Public } from '@app/auth-helper/PublicDecorator';
import { AuthenticatedRequest } from '@app/auth-helper';
import { ReportService } from './report.service';
import { Report } from '@app/postgres-db/schemas/report.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../multer-config';

@Controller('reports')
export class ReportController {
  constructor(private readonly service: ReportService) {}

  @Public()
  @Get('/')
  async getAll(@Req() request: AuthenticatedRequest): Promise<Report[]> {
    return this.service.getAll(request);
  }

  @Public()
  @Get('/:id')
  async getById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<Report> {
    return this.service.getById(id, request);
  }

  @Public()
  @Post('/')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async create(
    @Body() row: Report,
    @Req() request: AuthenticatedRequest,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<Report> {
    const roles = request.roles ?? [];
    row.imgPath = file ? file.path : row.imgPath;

    return this.service.create(row, roles);
  }

  @Public()
  @Patch('/:id')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() values: Partial<Report>,
    @UploadedFile() file: Express.Multer.File,
    @Req() request: AuthenticatedRequest,
  ): Promise<Report> {
    const roles = request.roles ?? [];
    if (file) {
      values.imgPath = file.path;
    }

    return this.service.update(id, values, roles);
  }

  @Public()
  @Delete('/:id')
  async delete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<Report> {
    const roles = request.roles ?? [];
    return this.service.delete(id, roles);
  }
}
