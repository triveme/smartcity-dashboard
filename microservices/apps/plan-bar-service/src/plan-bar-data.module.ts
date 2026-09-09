import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PostgresDbModule } from '@app/postgres-db';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { ScheduleService } from './schedule.service';
import { QueryService } from './query/query.service';
import { PlanBarWizardController } from './plan-bar-wizard.controller';
import { PlanBarService } from './data/data.service';
import { DataModule } from './data/data.module';
import { QueryModule } from './query/query.module';
import { AuthService } from './auth/auth.service';
import { HttpModule } from '@nestjs/axios';
import { DataPlatformQueueModule } from '@app/data-platform-queue';
import { AuthHelperMiddleware } from '@app/auth-helper';
import { InternalQueryPopulationController } from './internal-query-population.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    DataPlatformQueueModule.register({
      name: 'plan-bar',
      platform: 'plan-bar',
      concurrency: Number(process.env.DATA_PLATFORM_QUEUE_CONCURRENCY ?? 2),
      timeoutMs: Number(process.env.DATA_PLATFORM_QUEUE_TIMEOUT_MS ?? 60_000),
    }),
    PostgresDbModule,
    DataModule,
    ScheduleModule.forRoot(),
    QueryModule,
    HttpModule,
  ],
  controllers: [PlanBarWizardController, InternalQueryPopulationController],
  providers: [AuthService, PlanBarService, ScheduleService, QueryService],
})
export class PlanBarDataModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AuthHelperMiddleware)
      .forRoutes(
        { path: 'internal/query-populations', method: RequestMethod.POST },
        { path: 'internal/query-data', method: RequestMethod.POST },
      );
  }
}
