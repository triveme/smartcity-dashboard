import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SqlViewService } from './data.service';

@Module({
  providers: [SqlViewService],
  exports: [SqlViewService],
  imports: [HttpModule],
})
export class DataModule {}
