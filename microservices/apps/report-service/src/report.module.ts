import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from './config/config.module';
import { PostgresDbModule } from '@app/postgres-db';
import { QueryModule } from './query/query.module';
import { MailModule } from './mail/mail.module';
import { ConfigService } from './config/config.service';
import { QueryService } from './query/query.service';
import { MailService } from './mail/mail.service';

@Module({
  imports: [
    PostgresDbModule,
    ScheduleModule.forRoot(),
    ConfigModule,
    QueryModule,
    MailModule,
  ],
  providers: [ReportService, ConfigService, QueryService, MailService],
})
export class ReportModule {}
