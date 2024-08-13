import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { FiwareWizardService } from './fiware-wizard.service';
import { FiwareWizardController } from './fiware-wizard.controller';
import { HttpModule } from '@nestjs/axios';
import { AuthHelperMiddleware } from '@app/auth-helper';

@Module({
  imports: [HttpModule],
  providers: [FiwareWizardService],
  controllers: [FiwareWizardController],
})
export class FiwareWizardModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Apply the AuthHelperMiddleware to protect specific routes
    consumer.apply(AuthHelperMiddleware).forRoutes(
      { path: 'fiwareWizard*', method: RequestMethod.ALL }, // Protect all methods in the "fiwareWizard" route
    );
  }
}
