import { Module } from '@nestjs/common';
import { QueryService } from './query.service';

@Module({
  providers: [QueryService],
})
export class QueryModule {}
