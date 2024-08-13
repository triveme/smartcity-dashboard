import {
  WidgetToPanel,
  NewWidgetToPanel,
} from '@app/postgres-db/schemas/dashboard.widget-to-panel.schema';
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
import { WidgetToPanelService } from './widget-to-panel.service';
import { Public } from '@app/auth-helper/PublicDecorator';

@Controller('widgets-to-panels')
export class WidgetToPanelController {
  constructor(private readonly service: WidgetToPanelService) {}

  @Public()
  @Get('/')
  async getAll(): Promise<WidgetToPanel[]> {
    return this.service.getAll();
  }

  @Public()
  @Get('/:panelId')
  async getByPanelId(
    @Param('panelId', new ParseUUIDPipe({ version: '4' })) panelId: string,
  ): Promise<WidgetToPanel[]> {
    return this.service.getByPanelId(panelId);
  }

  @Public()
  @Post('/')
  async create(@Body() row: NewWidgetToPanel): Promise<WidgetToPanel> {
    return this.service.create(row);
  }

  @Public()
  @Patch('/:widgetId/:panelId')
  async update(
    @Param('widgetId', new ParseUUIDPipe({ version: '4' })) widgetId: string,
    @Param('panelId', new ParseUUIDPipe({ version: '4' })) panelId: string,
    @Body() values: Partial<WidgetToPanel>,
  ): Promise<WidgetToPanel> {
    return this.service.update(widgetId, panelId, values);
  }

  @Public()
  @Patch('/bulk-update')
  async bulkUpdate(@Body() updates: WidgetToPanel[]): Promise<WidgetToPanel[]> {
    return this.service.bulkUpdate(updates);
  }

  @Public()
  @Delete('/:widgetId/:panelId')
  async delete(
    @Param('widgetId', new ParseUUIDPipe({ version: '4' })) widgetId: string,
    @Param('panelId', new ParseUUIDPipe({ version: '4' })) panelId: string,
  ): Promise<WidgetToPanel> {
    return this.service.delete(widgetId, panelId);
  }
}
