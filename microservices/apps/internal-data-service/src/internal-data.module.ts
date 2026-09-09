import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleModule } from '@nestjs/schedule';
import { InternalDataService } from './internal-data.service';
import { DataModule } from './data/data.module';
import { PostgresDbModule } from '@app/postgres-db';
import { InternalDataController } from './internal-data.controller';
import { QueryModule } from './query/query.module';
import { InternalDataWizardController } from './internal-data-wizard.controller';
import { AuthHelperMiddleware, AuthHelperUtility } from '@app/auth-helper';
import { ConfigModule } from '@nestjs/config';
import { TransformationService } from './transformation/transformation.service';
import { DataPlatformQueueModule } from '@app/data-platform-queue';
import { InternalQueryPopulationController } from './internal-query-population.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    DataPlatformQueueModule.register({
      name: 'internal-data',
      platform: 'internal-data',
      concurrency: Number(process.env.DATA_PLATFORM_QUEUE_CONCURRENCY ?? 2),
      timeoutMs: Number(process.env.DATA_PLATFORM_QUEUE_TIMEOUT_MS ?? 60_000),
    }),
    PostgresDbModule,
    DataModule,
    ScheduleModule.forRoot(),
    QueryModule,
  ],
  controllers: [
    InternalDataController,
    InternalDataWizardController,
    InternalQueryPopulationController,
  ],
  providers: [
    InternalDataService,
    ScheduleService,
    AuthHelperUtility,
    TransformationService,
  ],
})
export class InternalDataModule {
  configure(consumer: MiddlewareConsumer): void {
    // Apply the AuthHelperMiddleware to protect specific routes
    consumer.apply(AuthHelperMiddleware).forRoutes(
      { path: 'data*', method: RequestMethod.POST }, // Protect all methods in the "general-settings" route
      { path: 'data*', method: RequestMethod.PATCH }, // Protect all methods in the "general-settings" route
      { path: 'data*', method: RequestMethod.DELETE }, // Protect all methods in the "general-settings" route
      { path: 'internal/query-populations', method: RequestMethod.POST },
      { path: 'internal/query-data', method: RequestMethod.POST },
    );
  }
}
