import { SetMetadata } from '@nestjs/common';

export const NO_STORE_CACHE_KEY = 'no-store-cache';

export const NoStoreCache = (): ClassDecorator & MethodDecorator =>
  SetMetadata(NO_STORE_CACHE_KEY, true);
