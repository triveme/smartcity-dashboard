import { Module } from '@nestjs/common';
import { DataService } from './data.service';
import { HttpModule } from '@nestjs/axios';
import { TransformationModule } from '../transformation/transformation.module';

@Module({
  providers: [DataService],
  exports: [DataService],
  imports: [HttpModule, TransformationModule],
})
export class DataModule {}
