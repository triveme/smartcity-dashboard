import { NestFactory } from '@nestjs/core';
import { SqlViewDataModule } from './sql-view-data.module';
import { parseCorsOrigins } from '@app/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(SqlViewDataModule);
  app.enableShutdownHooks();
  app.enableCors({
    origin: parseCorsOrigins(process.env.NEXT_PUBLIC_FRONTEND_URL),
    methods: ['GET', 'DELETE', 'POST', 'PATCH'],
    credentials: true,
  });
  await app.listen(8091);
}

bootstrap();
