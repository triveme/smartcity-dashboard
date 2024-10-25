import { Module } from '@nestjs/common';
import { DashboardServiceLogger } from './logger.service';
import { LoggerController } from './logger.controller';

@Module({
  providers: [DashboardServiceLogger],
  exports: [DashboardServiceLogger],
  controllers: [LoggerController],
})
export class LoggerModule {}
