import { Module } from '@nestjs/common';
import { QueryService } from './query.service';
import { PostgresDbModule } from '@app/postgres-db';
import { PlanBarService } from '../data/data.service';
import { AuthService } from '../auth/auth.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [QueryService, PlanBarService, AuthService],
  imports: [PostgresDbModule, HttpModule],
  exports: [QueryService],
})
export class QueryModule {}
