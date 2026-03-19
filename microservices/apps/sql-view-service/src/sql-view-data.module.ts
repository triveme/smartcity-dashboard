import { Module } from '@nestjs/common';
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
  controllers: [SqlViewWizardController],
  providers: [
    AuthHelperUtility,
    SqlViewService,
    ScheduleService,
    QueryService,
    SqlViewDataService,
    TransformationService,
  ],
})
export class SqlViewDataModule {}
