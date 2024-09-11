import { NestFactory } from '@nestjs/core';
import { DashboardServiceModule } from './dashboard-service.module';
import { json } from 'express';
import { DashboardServiceLogger } from './logging/logger.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(DashboardServiceModule, {
    logger: new DashboardServiceLogger(),
  });
  app.enableCors({
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.use(json({ limit: '5mb' }));
  await app.listen(8081);
}

bootstrap();
