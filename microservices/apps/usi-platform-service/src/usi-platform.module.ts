import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { PostgresDbModule } from '@app/postgres-db';
import { AuthService } from './auth/auth.service';
import { HttpModule } from '@nestjs/axios';
import { UsiPlaformService } from './usi-platform.service';
import { UsiPlatformController } from './usi-platform.controller';
import { QueryConfigService } from './data/data.service';
import { ConfigModule } from '@nestjs/config';
import { QueryService } from './query/query.service';
import { ScheduleService } from './schedule.service';
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
      name: 'usi',
      platform: 'usi',
      concurrency: Number(process.env.DATA_PLATFORM_QUEUE_CONCURRENCY ?? 2),
      timeoutMs: Number(process.env.DATA_PLATFORM_QUEUE_TIMEOUT_MS ?? 60_000),
    }),
    HttpModule,
    PostgresDbModule,
  ],
  providers: [
    UsiPlaformService,
    QueryService,
    AuthService,
    QueryConfigService,
    ScheduleService,
  ],
  controllers: [UsiPlatformController, InternalQueryPopulationController],
})
export class UsiPlatformModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(AuthHelperMiddleware)
      .forRoutes(
        { path: 'internal/query-populations', method: RequestMethod.POST },
        { path: 'internal/query-data', method: RequestMethod.POST },
      );
  }
}
