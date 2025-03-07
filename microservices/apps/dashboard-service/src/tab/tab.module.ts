import { Module } from '@nestjs/common';
import { TabService } from './tab.service';
import { TabController } from './tab.controller';
import { TabRepo } from './tab.repo';
import { WidgetRepo } from '../widget/widget.repo';
import { TenantRepo } from '../tenant/tenant.repo';

@Module({
  providers: [TabService, TabRepo, WidgetRepo, TenantRepo],
  controllers: [TabController],
})
export class TabModule {}
