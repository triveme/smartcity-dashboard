import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { DataModelService } from './data-model.service';
import {
  DataModel,
  NewDataModel,
} from '@app/postgres-db/schemas/data-model.schema';
import { Public } from '@app/auth-helper/PublicDecorator';

@Controller('data-models')
export class DataModelController {
  constructor(private readonly service: DataModelService) {}

  @Public()
  @Get('/')
  async getAll(): Promise<DataModel[]> {
    return this.service.getAll();
  }

  @Public()
  @Get('/:id')
  async getById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<DataModel> {
    return this.service.getById(id);
  }

  @Public()
  @Post('/')
  async create(@Body() row: NewDataModel): Promise<DataModel> {
    return this.service.create(row);
  }

  @Public()
  @Patch('/:id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() values: Partial<DataModel>,
  ): Promise<DataModel> {
    return this.service.update(id, values);
  }

  @Public()
  @Delete('/:id')
  async delete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<DataModel> {
    return this.service.delete(id);
  }
}
