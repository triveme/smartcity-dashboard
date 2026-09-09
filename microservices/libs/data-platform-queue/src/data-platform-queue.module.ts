import { DynamicModule, Module, Provider } from '@nestjs/common';
import { DataPlatformQueue } from './data-platform-queue.service';
import { DataPlatformQueueOptions } from './data-platform-queue.types';

export const DATA_PLATFORM_QUEUE_OPTIONS = Symbol(
  'DATA_PLATFORM_QUEUE_OPTIONS',
);
export const DATA_PLATFORM_QUEUE = Symbol('DATA_PLATFORM_QUEUE');

@Module({})
export class DataPlatformQueueModule {
  static register(options: DataPlatformQueueOptions): DynamicModule {
    const providers: Provider[] = [
      { provide: DATA_PLATFORM_QUEUE_OPTIONS, useValue: options },
      {
        provide: DataPlatformQueue,
        useFactory: (queueOptions: DataPlatformQueueOptions) =>
          new DataPlatformQueue(queueOptions),
        inject: [DATA_PLATFORM_QUEUE_OPTIONS],
      },
      { provide: DATA_PLATFORM_QUEUE, useExisting: DataPlatformQueue },
    ];
    return {
      module: DataPlatformQueueModule,
      global: true,
      providers,
      exports: [DataPlatformQueue, DATA_PLATFORM_QUEUE],
    };
  }
}
