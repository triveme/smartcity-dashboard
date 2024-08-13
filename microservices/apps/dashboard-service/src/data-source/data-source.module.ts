import { Module } from '@nestjs/common';
import { DataSourceController } from './data-source.controller';
import { DataSourceRepo } from './data-source.repo';
import { AuthDataRepo } from '../auth-data/auth-data.repo';
import { DataSourceService } from './data-source.service';

@Module({
  providers: [DataSourceService, DataSourceRepo, AuthDataRepo],
  controllers: [DataSourceController],
  exports: [DataSourceRepo, DataSourceService],
})
export class DataSourceModule {}
