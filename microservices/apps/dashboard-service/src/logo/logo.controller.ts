import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Public } from '@app/auth-helper/PublicDecorator';
import { LogoService } from './logo.service';
import { Logo, NewLogo } from '@app/postgres-db/schemas/logo.schema';

@Controller('logos')
export class LogoController {
  constructor(private readonly service: LogoService) {}

  @Public()
  @Get('/')
  async getAll(@Query('tenant') tenantAbbreviation?: string): Promise<Logo[]> {
    if (!tenantAbbreviation) {
      throw new HttpException(
        'tenantAbbreviation must be provided',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return this.service.getAll(tenantAbbreviation);
    } catch (error) {
      console.error('Error in LogoController.get:', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Public()
  @Get('/:id')
  async getById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Logo> {
    return this.service.getById(id);
  }

  @Public()
  @Post('/')
  async create(@Body() row: NewLogo): Promise<Logo> {
    if (!row?.tenantId) {
      throw new HttpException(
        'tenantAbbreviation must be provided',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      return await this.service.create(row);
    } catch (error) {
      console.error('Error in LogoController.create:', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Public()
  @Patch('/:id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() values: Partial<Logo>,
  ): Promise<Logo> {
    return this.service.update(id, values);
  }

  @Public()
  @Delete('/:id')
  async delete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Logo> {
    return this.service.delete(id);
  }
}
