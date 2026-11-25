import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ValueTranslationController } from './value-translation.controller';
import { ValueTranslationService } from './value-translation.service';
import { ValueTranslationRepo } from './value-translation.repo';
import { AuthHelperMiddleware } from '@app/auth-helper';

@Module({
  providers: [ValueTranslationService, ValueTranslationRepo],
  controllers: [ValueTranslationController],
  exports: [ValueTranslationService, ValueTranslationRepo],
})
export class ValueTranslationModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AuthHelperMiddleware).forRoutes({
      path: 'value-translation*',
      method: RequestMethod.ALL,
    });
  }
}
