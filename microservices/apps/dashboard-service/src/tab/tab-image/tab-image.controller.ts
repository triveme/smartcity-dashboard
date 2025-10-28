import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { TabImageService } from './tab-image.service';
import { Public } from '@app/auth-helper/PublicDecorator';
import {
  TabImage,
  NewTabImage,
} from '@app/postgres-db/schemas/dashboard.tab.values-to-images.schema';

@Controller('tab-image')
export class TabImageController {
  constructor(private readonly service: TabImageService) {}

  @Public()
  @Get('/')
  async getAll(
    @Query('tenant') tenantAbbreviation?: string,
  ): Promise<TabImage[]> {
    if (!tenantAbbreviation) {
      throw new HttpException(
        'tenantAbbreviation must be provided',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return this.service.getAll(tenantAbbreviation);
    } catch (error) {
      console.error('Error in TabImageController.get:', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Public()
  @Get('/:id')
  async getById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<TabImage> {
    return this.service.getById(id);
  }

  @Public()
  @Post('/list')
  async getMultipleIds(@Body() row: { ids: string[] }): Promise<TabImage[]> {
    return this.service.getMultiple(row.ids);
  }

  @Public()
  @Post('/')
  async create(@Body() row: NewTabImage): Promise<TabImage> {
    if (!row?.tenantId) {
      throw new HttpException(
        'tenantAbbreviation must be provided',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.service.create(row);
    } catch (error) {
      console.error('Error in TabImageController.create:', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Public()
  @Delete('/:id')
  async delete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<TabImage> {
    return this.service.delete(id);
  }
}
