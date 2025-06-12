import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    PostgresDbModule,
    HttpModule,
    ScheduleModule.forRoot(),
    ReportModule,
    DataModule,
    QueryModule,
    FiwareWizardModule,
  ],
  providers: [NgsiService, AuthService, ScheduleService, FiwareWizardService],
  controllers: [FiwareWizardController, NgsiController],
})
export class NgsiModule {}
