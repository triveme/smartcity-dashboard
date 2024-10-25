import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { GeneralSettingsController } from './general-settings.controller';
import { GeneralSettingsRepo } from './general-settings.repo';
import { GeneralSettingsService } from './general-settings.service';
import { AuthHelperMiddleware, AuthHelperUtility } from '@app/auth-helper';
import { TenantRepo } from '../tenant/tenant.repo';

@Module({
  controllers: [GeneralSettingsController],
  providers: [
    GeneralSettingsRepo,
    GeneralSettingsService,
    TenantRepo,
    AuthHelperUtility,
  ],
})
export class GeneralSettingsModule {
  configure(consumer: MiddlewareConsumer): void {
    // Apply the AuthHelperMiddleware to protect specific routes
    consumer.apply(AuthHelperMiddleware).forRoutes(
      { path: 'general-settings*', method: RequestMethod.ALL }, // Protect all methods in the "general-settings" route
    );
  }
}
