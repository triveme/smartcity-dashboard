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
import { Public } from '@app/auth-helper/PublicDecorator';
import {
  CustomMapImage,
  NewCustomMapImage,
} from '@app/postgres-db/schemas/dashboard.tab.custom_map_image.schema';
import { CustomMapImageService } from './custom-map-image.service';

@Controller('custom-map-image')
export class CustomMapImageController {
  constructor(private readonly service: CustomMapImageService) {}

  @Public()
  @Get('/')
  async getAll(
    @Query('tenant') tenantAbbreviation?: string,
  ): Promise<CustomMapImage[]> {
    if (!tenantAbbreviation) {
      throw new HttpException(
        'tenantAbbreviation must be provided',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return this.service.getAll(tenantAbbreviation);
    } catch (error) {
      console.error('Error in CustomMapImageController.get:', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Public()
  @Get('/:id')
  async getById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<CustomMapImage> {
    return this.service.getById(id);
  }

  @Public()
  @Post('/list')
  async getMultipleIds(
    @Body() row: { ids: string[] },
  ): Promise<CustomMapImage[]> {
    return this.service.getMultiple(row.ids);
  }

  @Public()
  @Post('/')
  async create(@Body() row: NewCustomMapImage): Promise<CustomMapImage> {
    if (!row?.tenantId) {
      throw new HttpException(
        'tenantAbbreviation must be provided',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.service.create(row);
    } catch (error) {
      console.error('Error in CustomMapImageController.create:', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Public()
  @Delete('/:id')
  async delete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<CustomMapImage> {
    return this.service.delete(id);
  }
}
