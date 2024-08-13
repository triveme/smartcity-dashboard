import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AuthDataController } from './auth-data.controller';
import { DataSourceService } from '../data-source/data-source.service';
import { AuthGuard } from '@app/auth-helper/AuthGuard';
import { AuthDataRepo } from './auth-data.repo';
import { DataSourceRepo } from '../data-source/data-source.repo';
import { AuthDataService } from './auth-data.service';
import { AuthHelperMiddleware, AuthHelperUtility } from '@app/auth-helper';

@Module({
  providers: [
    AuthDataService,
    AuthDataRepo,
    DataSourceService,
    AuthGuard,
    DataSourceRepo,
    AuthHelperUtility,
  ],
  controllers: [AuthDataController],
  exports: [AuthDataRepo],
})
export class AuthDataModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Apply the AuthHelperMiddleware to protect specific routes
    consumer.apply(AuthHelperMiddleware).forRoutes(
      { path: 'auth-datas*', method: RequestMethod.ALL }, // Protect all methods in the "auth-datas" route
    );
  }
}
