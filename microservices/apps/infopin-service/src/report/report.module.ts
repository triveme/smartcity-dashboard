import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { AuthHelperMiddleware } from '@app/auth-helper';

@Module({
  providers: [ReportService],
  controllers: [ReportController],
})
export class ReportModule {
  configure(consumer: MiddlewareConsumer): void {
    // Apply the AuthHelperMiddleware to protect specific routes
    consumer.apply(AuthHelperMiddleware).forRoutes(
      { path: 'reports*', method: RequestMethod.ALL }, // Protect all methods in the "dashboards" route
    );
  }
}
