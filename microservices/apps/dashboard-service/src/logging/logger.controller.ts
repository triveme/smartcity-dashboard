import { Controller, Get } from '@nestjs/common';
import { Public } from '@app/auth-helper/PublicDecorator';
import { DashboardServiceLogger } from './logger.service';

@Controller('logs')
export class LoggerController {
  constructor(private readonly service: DashboardServiceLogger) {}

  @Public()
  @Get('/')
  async getAll(): Promise<string> {
    console.log('getting logs');
    return this.service.getAll();
  }
}
