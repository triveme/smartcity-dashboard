import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { DefectController } from './defect.controller';
import { DefectService } from './defect.service';
import { AuthHelperMiddleware } from '@app/auth-helper';

@Module({
  controllers: [DefectController],
  providers: [DefectService],
})
export class DefectModule {
  configure(consumer: MiddlewareConsumer): void {
    // Apply the AuthHelperMiddleware to protect specific routes
    consumer.apply(AuthHelperMiddleware).forRoutes(
      { path: 'defects*', method: RequestMethod.ALL }, // Protect all methods in the "defects" route
    );
  }
}
