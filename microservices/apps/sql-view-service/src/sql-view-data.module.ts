import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PostgresDbModule } from '@app/postgres-db';
import { ScheduleModule } from '@nestjs/schedule';
import { DataModule } from '../../ngsi-service/src/data/data.module';
import { QueryModule } from '../../ngsi-service/src/query/query.module';
import { ConfigModule } from '@nestjs/config';
import { AuthHelperUtility } from '@app/auth-helper';
import { SqlViewService } from './data/data.service';
import { SqlViewWizardController } from './sql-view-wizard.controller';
import { ScheduleService } from './schedule.service';
import { QueryService } from './query/query.service';
import { SqlViewDataService } from './sql-view-data.service';
import { TransformationService } from './transformation/transformation.service';
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
      name: 'sql-view',
      platform: 'sql-view',
      concurrency: Number(process.env.DATA_PLATFORM_QUEUE_CONCURRENCY ?? 2),
      timeoutMs: Number(process.env.DATA_PLATFORM_QUEUE_TIMEOUT_MS ?? 60_000),
    }),
    PostgresDbModule,
    DataModule,
    ScheduleModule.forRoot(),
    QueryModule,
  ],
  controllers: [SqlViewWizardController, InternalQueryPopulationController],
  providers: [
    AuthHelperUtility,
    SqlViewService,
    ScheduleService,
    QueryService,
    SqlViewDataService,
    TransformationService,
  ],
})
export class SqlViewDataModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AuthHelperMiddleware)
      .forRoutes(
        { path: 'internal/query-populations', method: RequestMethod.POST },
        { path: 'internal/query-data', method: RequestMethod.POST },
      );
  }
}
