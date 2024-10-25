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
import { PanelService } from './panel.service';
import {
  NewPanel,
  Panel,
} from '@app/postgres-db/schemas/dashboard.panel.schema';
import { Public } from '@app/auth-helper/PublicDecorator';

@Controller('panels')
export class PanelController {
  constructor(private readonly service: PanelService) {}

  @Public()
  @Get('/')
  async getAll(): Promise<Panel[]> {
    return this.service.getAll();
  }

  @Public()
  @Get('/:id')
  async getById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Panel> {
    return this.service.getById(id);
  }

  @Public()
  @Get('dashboard/:id')
  async getPanelsByDashboardId(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Panel[]> {
    return this.service.getPanelsByDashboardId(id);
  }

  @Public()
  @Post('/')
  async create(@Body() row: NewPanel): Promise<Panel> {
    return this.service.create(row);
  }

  @Public()
  @Patch('/:id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() values: Partial<Panel>,
  ): Promise<Panel> {
    return this.service.update(id, values);
  }

  @Public()
  @Delete('/:id')
  async delete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Panel> {
    return this.service.delete(id);
  }
}
