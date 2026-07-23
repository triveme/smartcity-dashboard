import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { NO_STORE_CACHE_KEY } from './no-store-cache.decorator';

@Injectable()
export class NoStoreCacheInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const shouldDisableCaching = this.reflector.getAllAndOverride<boolean>(
      NO_STORE_CACHE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!shouldDisableCaching || context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<{ method?: string }>();
    if (!request?.method || !['GET', 'HEAD'].includes(request.method)) {
      return next.handle();
    }

    const response = context.switchToHttp().getResponse();
    response.setHeader('Cache-Control', 'private, no-store');
    response.setHeader(
      'Vary',
      this.appendVaryHeaders(response.getHeader('Vary'), [
        'Authorization',
        'Cookie',
      ]),
    );

    return next.handle();
  }

  private appendVaryHeaders(
    existingHeader: number | string | string[] | undefined,
    valuesToAdd: string[],
  ): string {
    const normalizedValues = new Set<string>();

    const values = Array.isArray(existingHeader)
      ? existingHeader
      : typeof existingHeader === 'string'
        ? existingHeader.split(',')
        : [];

    values
      .map((value) => value.trim())
      .filter(Boolean)
      .forEach((value) => normalizedValues.add(value));

    valuesToAdd.forEach((value) => normalizedValues.add(value));

    return Array.from(normalizedValues).join(', ');
  }
}
