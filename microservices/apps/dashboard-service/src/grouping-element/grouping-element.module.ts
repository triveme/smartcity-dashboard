import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { GroupingElementService } from './grouping-element.service';
import { GroupingElementController } from './grouping-element.controller';
import { TenantService } from '../tenant/tenant.service';
import { GroupingElementRepo } from './grouping-element.repo';
import { TenantRepo } from '../tenant/tenant.repo';
import { CorporateInfoService } from '../corporate-info/corporate-info.service';
import { CorporateInfoRepo } from '../corporate-info/corporate-info.repo';
import { DashboardRepo } from '../dashboard/dashboard.repo';
import { AuthHelperMiddleware } from '@app/auth-helper';
import { CorporateInfoSidebarLogosRepo } from '../corporate-info-sidebar-logos/corporate-info-sidebar-logos.repo';
import { LogoRepo } from '../logo/logo.repo';

@Module({
  providers: [
    GroupingElementService,
    GroupingElementRepo,
    TenantService,
    TenantRepo,
    CorporateInfoService,
    CorporateInfoRepo,
    DashboardRepo,
    CorporateInfoSidebarLogosRepo,
    LogoRepo,
  ],
  controllers: [GroupingElementController],
})
export class GroupingElementModule {
  configure(consumer: MiddlewareConsumer): void {
    // Apply the AuthHelperMiddleware to protect specific routes
    consumer.apply(AuthHelperMiddleware).forRoutes(
      { path: 'groupingElements*', method: RequestMethod.ALL }, // Protect all methods in the "groupingElements" route
    );
  }
}
