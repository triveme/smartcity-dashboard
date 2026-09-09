import { NestFactory } from '@nestjs/core';
import { NgsiModule } from './ngsi.module';
import { parseCorsOrigins } from '@app/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(NgsiModule, {
    logger: ['error', 'warn', 'log'],
  });
  app.enableShutdownHooks();
  app.enableCors({
    origin: parseCorsOrigins(process.env.NEXT_PUBLIC_FRONTEND_URL),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(8082);
}
bootstrap();
