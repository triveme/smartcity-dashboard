import { NestFactory } from '@nestjs/core';
import { PlanBarDataModule } from './plan-bar-data.module';
import { parseCorsOrigins } from '@app/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(PlanBarDataModule);
  app.enableShutdownHooks();

  app.enableCors({
    origin: parseCorsOrigins(process.env.NEXT_PUBLIC_FRONTEND_URL),
    methods: ['GET', 'DELETE', 'POST', 'PATCH'],
    credentials: true,
  });
  await app.listen(8092);
}

bootstrap();
