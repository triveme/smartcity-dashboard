import { Module } from '@nestjs/common';
import { DataConversionService } from './data-conversion.service';

@Module({
  providers: [DataConversionService],
  exports: [DataConversionService],
})
export class DataConversionModule {}
