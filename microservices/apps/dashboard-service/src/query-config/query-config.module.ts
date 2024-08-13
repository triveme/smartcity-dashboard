import { Module } from '@nestjs/common';
import { QueryConfigService } from './query-config.service';
import { QueryConfigController } from './query-config.controller';
import { QueryService } from '../query/query.service';
import { QueryRepo } from '../query/query.repo';
import { QueryConfigRepo } from './query-config.repo';

@Module({
  providers: [QueryConfigService, QueryConfigRepo, QueryService, QueryRepo],
  controllers: [QueryConfigController],
})
export class QueryConfigModule {}
