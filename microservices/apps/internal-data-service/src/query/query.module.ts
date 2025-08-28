import { Module } from '@nestjs/common';
import { QueryService } from './query.service';
import { PostgresDbModule } from '@app/postgres-db';
import { DataService } from '../data/data.service';
import { TransformationModule } from '../transformation/transformation.module';

@Module({
  providers: [QueryService, DataService],
  imports: [PostgresDbModule, TransformationModule],
  exports: [QueryService],
})
export class QueryModule {}
