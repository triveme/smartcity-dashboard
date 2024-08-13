import { Module } from '@nestjs/common';
import { QueryController } from './query.controller';
import { QueryService } from './query.service';
import { QueryRepo } from './query.repo';

@Module({
  controllers: [QueryController],
  providers: [QueryService, QueryRepo],
  exports: [QueryService],
})
export class QueryModule {}
