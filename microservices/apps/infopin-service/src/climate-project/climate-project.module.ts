import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ClimateProjectService } from './climate-project.service';
import { ClimateProjectController } from './climate-project.controller';
import { AuthHelperMiddleware } from '@app/auth-helper';

@Module({
  providers: [ClimateProjectService],
  controllers: [ClimateProjectController],
  exports: [ClimateProjectService],
})
export class ClimateProjectModule {
  configure(consumer: MiddlewareConsumer): void {
    // Apply the AuthHelperMiddleware to protect specific routes
    consumer.apply(AuthHelperMiddleware).forRoutes(
      { path: 'climate-projects*', method: RequestMethod.ALL }, // Protect all methods in the "dashboards" route
    );
  }
}
