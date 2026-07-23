import { NestFactory } from '@nestjs/core';
import { DashboardServiceModule } from './dashboard-service.module';
import { json } from 'express';
import { parseCorsOrigins } from '@app/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(DashboardServiceModule, {
    logger:
      process.env.NODE_ENV === 'test'
        ? ['error', 'warn', 'log', 'verbose']
        : ['error', 'warn', 'log'],
  });
  app.enableCors({
    origin: parseCorsOrigins(process.env.NEXT_PUBLIC_FRONTEND_URL),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.use(json({ limit: '5mb' }));
  console.log('Dashboard Service is starting...');
  console.log(
    `CORS enabled for origins: ${process.env.NEXT_PUBLIC_FRONTEND_URL}`,
  );
  await app.listen(8081);
}

bootstrap();
