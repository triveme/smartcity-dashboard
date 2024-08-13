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
import { TabService } from './tab.service';
import { NewTab, Tab } from '@app/postgres-db/schemas/dashboard.tab.schema';
import { Public } from '@app/auth-helper/PublicDecorator';

@Controller('tabs')
export class TabController {
  constructor(private readonly service: TabService) {}

  @Public()
  @Get('/')
  async getAll(): Promise<Tab[]> {
    return this.service.getAll();
  }

  @Public()
  @Get('/:id')
  async getById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Tab> {
    return this.service.getById(id);
  }

  @Public()
  @Get('widget/:id')
  async getTabsByWidgetId(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Tab[]> {
    return this.service.getTabsByWidgetId(id);
  }

  @Public()
  @Post('/')
  async create(@Body() row: NewTab): Promise<Tab> {
    return this.service.create(row);
  }

  @Public()
  @Patch('/:id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() values: Partial<Tab>,
  ): Promise<Tab> {
    return this.service.update(id, values);
  }

  @Public()
  @Delete('/:id')
  async delete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Tab> {
    return this.service.delete(id);
  }
}
