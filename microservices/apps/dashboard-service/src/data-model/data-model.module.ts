import { Module } from '@nestjs/common';
import { DataModelService } from './data-model.service';
import { DataModelController } from './data-model.controller';
import { DataModelRepo } from './data-model.repo';

@Module({
  providers: [DataModelService, DataModelRepo],
  controllers: [DataModelController],
})
export class DataModelModule {}
