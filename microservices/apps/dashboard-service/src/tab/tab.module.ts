import { Module } from '@nestjs/common';
import { TabService } from './tab.service';
import { TabController } from './tab.controller';
import { TabRepo } from './tab.repo';
import { WidgetRepo } from '../widget/widget.repo';
import { TenantRepo } from '../tenant/tenant.repo';
import { TabImageModule } from './tab-image/tab-image.module';

@Module({
  imports: [TabImageModule],
  providers: [TabService, TabRepo, WidgetRepo, TenantRepo],
  controllers: [TabController],
  exports: [TabImageModule],
})
export class TabModule {}
