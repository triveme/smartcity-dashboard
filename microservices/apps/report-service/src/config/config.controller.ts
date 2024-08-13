import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ConfigService } from './config.service';
import { SensorReport } from '@app/postgres-db/schemas/sensor-report.schema';

@Controller('configs')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('/')
  async getConfigs(): Promise<SensorReport[]> {
    return this.configService.getConfigs();
  }

  @Get('/:id')
  async getConfigByQueryId(@Param('id') id: string): Promise<SensorReport> {
    return this.configService.getConfigByQueryId(id);
  }

  @Post('/')
  async create(@Body() config: SensorReport): Promise<SensorReport> {
    return this.configService.create(config);
  }

  @Patch('/:id')
  async updateConfigById(
    @Body() config: Partial<SensorReport>,
    @Param('id') id: string,
  ): Promise<SensorReport> {
    return this.configService.updateConfigById(id, config);
  }

  @Delete('/:id')
  async deleteConfig(@Param('id') id: string): Promise<SensorReport> {
    return this.configService.delete(id);
  }
}
