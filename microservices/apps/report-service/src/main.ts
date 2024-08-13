import { NestFactory } from '@nestjs/core';
import { ReportModule } from './report.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(ReportModule);
  app.enableCors({
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  await app.listen(8086);
}

bootstrap();
