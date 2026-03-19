import { Module } from '@nestjs/common';
import { QueryService } from './query.service';
import { DataService } from 'apps/ngsi-service/src/data/data.service';
import { PostgresDbModule } from '@app/postgres-db';

@Module({
  providers: [QueryService, DataService],
  exports: [PostgresDbModule, QueryService],
})
export class QueryModule {}
