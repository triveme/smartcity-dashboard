import { Module } from '@nestjs/common';
import { DataService } from './data.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [DataService],
  exports: [DataService],
  imports: [HttpModule],
})
export class DataModule {}
