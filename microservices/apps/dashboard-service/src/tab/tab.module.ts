import { Module } from '@nestjs/common';
import { TabService } from './tab.service';
import { TabController } from './tab.controller';
import { TabRepo } from './tab.repo';

@Module({
  providers: [TabService, TabRepo],
  controllers: [TabController],
})
export class TabModule {}
