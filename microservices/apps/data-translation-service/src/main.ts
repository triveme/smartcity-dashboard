import { NestFactory } from '@nestjs/core';
import { DataTranslationServiceModule } from './data-translation.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(DataTranslationServiceModule, {
    logger: ['error', 'warn', 'log'],
  });

  await app.init();

  await new Promise(() => {
    // This is needed to keep the process alive even without http endpoints
    console.log('Service is running in background mode...');
  });
}
bootstrap();
