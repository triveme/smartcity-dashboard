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
import { NgsiController } from './ngsi.controller';
import { FiwareWizardModule } from './fiware-wizard/fiware-wizard.module';
import { FiwareWizardController } from './fiware-wizard/fiware-wizard.controller';
import { FiwareWizardService } from './fiware-wizard/fiware-wizard.service';

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
  controllers: [NgsiController, FiwareWizardController],
})
export class NgsiModule {}