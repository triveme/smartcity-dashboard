import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { NgsiService } from './ngsi.service';
import { HttpModule } from '@nestjs/axios';
import { PostgresDbModule } from '@app/postgres-db';
import { ScheduleService } from './scheduler.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ReportModule } from './report/report.module';
import { DataModule } from './data/data.module';
import { QueryModule } from './query/query.module';
import { FiwareWizardModule } from './fiware-wizard/fiware-wizard.module';
import { FiwareWizardController } from './fiware-wizard/fiware-wizard.controller';
import { FiwareWizardService } from './fiware-wizard/fiware-wizard.service';
import { NgsiController } from './ngsi.controller';
import { ConfigModule } from '@nestjs/config';
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
      name: 'ngsi',
      platform: 'ngsi',
      concurrency: Number(process.env.DATA_PLATFORM_QUEUE_CONCURRENCY ?? 2),
      timeoutMs: Number(process.env.DATA_PLATFORM_QUEUE_TIMEOUT_MS ?? 60_000),
    }),
    PostgresDbModule,
    HttpModule,
    ScheduleModule.forRoot(),
    ReportModule,
    DataModule,
    QueryModule,
    FiwareWizardModule,
  ],
  providers: [NgsiService, AuthService, ScheduleService, FiwareWizardService],
  controllers: [
    FiwareWizardController,
    NgsiController,
    InternalQueryPopulationController,
  ],
})
export class NgsiModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AuthHelperMiddleware)
      .forRoutes(
        { path: 'internal/query-populations', method: RequestMethod.POST },
        { path: 'internal/query-data', method: RequestMethod.POST },
      );
  }
}
