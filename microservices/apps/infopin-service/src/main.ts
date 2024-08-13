import { NestFactory } from '@nestjs/core';
import { json } from 'express';
import { InfopinServiceModule } from './infopin-service.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(InfopinServiceModule);
  app.enableCors({
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.use(json({ limit: '5mb' }));
  await app.listen(8084);
}

bootstrap();
