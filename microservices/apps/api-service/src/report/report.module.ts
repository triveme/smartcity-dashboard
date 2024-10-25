import { Module } from '@nestjs/common';
import { ReportService } from './report.service';
import { QueryService } from '../query/query.service';
import { DataService } from '../data/data.service';
import { AuthService } from '../auth/auth.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [ReportService, QueryService, DataService, AuthService],
  exports: [ReportService],
  imports: [HttpModule],
})
export class ReportModule {}
