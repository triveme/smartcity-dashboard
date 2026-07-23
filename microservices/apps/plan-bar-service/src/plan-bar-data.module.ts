import { Module } from '@nestjs/common';
import { PostgresDbModule } from '@app/postgres-db';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { ScheduleService } from './schedule.service';
import { QueryService } from './query/query.service';
import { PlanBarWizardController } from './plan-bar-wizard.controller';
import { PlanBarService } from './data/data.service';
import { PlanBarDataService } from './plan-bar.service';
import { DataModule } from './data/data.module';
import { QueryModule } from './query/query.module';
import { AuthService } from './auth/auth.service';
import { HttpModule } from '@nestjs/axios';

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
    HttpModule,
  ],
  controllers: [PlanBarWizardController],
  providers: [
    AuthService,
    PlanBarService,
    ScheduleService,
    QueryService,
    PlanBarDataService,
  ],
})
export class PlanBarDataModule {}
