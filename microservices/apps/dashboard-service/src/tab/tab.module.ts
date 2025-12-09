import { Module } from '@nestjs/common';
import { TabService } from './tab.service';
import { TabController } from './tab.controller';
import { TabRepo } from './tab.repo';
import { WidgetRepo } from '../widget/widget.repo';
import { TenantRepo } from '../tenant/tenant.repo';
import { CustomMapImageModule } from './custom-map-image/custom-map-image.module';
import { TabImageModule } from './tab-image/tab-image.module';

@Module({
  imports: [TabImageModule, CustomMapImageModule],
  providers: [TabService, TabRepo, WidgetRepo, TenantRepo],
  controllers: [TabController],
  exports: [TabImageModule, CustomMapImageModule],
})
export class TabModule {}
