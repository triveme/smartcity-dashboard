import { Module } from '@nestjs/common';
import { ClimateProjectModule } from './climate-project/climate-project.module';
import { ReportModule } from './report/report.module';
import { ClimateProjectController } from './climate-project/climate-project.controller';
import { PostgresDbModule } from '@app/postgres-db';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@app/auth-helper/AuthGuard';
import { JwtModule } from '@nestjs/jwt';
import { DefectModule } from './defect/defect.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ClimateProjectModule,
    ReportModule,
    PostgresDbModule,
    JwtModule.register({
      global: true,
    }),
    DefectModule,
    ScheduleModule.forRoot(),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  controllers: [ClimateProjectController],
})
export class InfopinServiceModule {}
