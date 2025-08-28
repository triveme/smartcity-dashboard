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

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
    }),
    PostgresDbModule,
    DataModule,
    ScheduleModule.forRoot(),
    QueryModule,
  ],
  controllers: [InternalDataController, InternalDataWizardController],
  providers: [InternalDataService, ScheduleService, AuthHelperUtility],
})
export class InternalDataModule {
  configure(consumer: MiddlewareConsumer): void {
    // Apply the AuthHelperMiddleware to protect specific routes
    consumer.apply(AuthHelperMiddleware).forRoutes(
      { path: 'data*', method: RequestMethod.POST }, // Protect all methods in the "general-settings" route
      { path: 'data*', method: RequestMethod.PATCH }, // Protect all methods in the "general-settings" route
      { path: 'data*', method: RequestMethod.DELETE }, // Protect all methods in the "general-settings" route
    );
  }
}
