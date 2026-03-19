import { NestFactory } from '@nestjs/core';
import { ProjectDataModule } from './project-data.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(ProjectDataModule);

  app.enableCors({
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL,
    methods: ['GET', 'DELETE', 'POST', 'PATCH'],
    credentials: true,
  });

  await app.listen(8090);
}

bootstrap();
