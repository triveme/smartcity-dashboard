import { NestFactory } from '@nestjs/core';
import { StaticDataModule } from './static-data.module';
import { parseCorsOrigins } from '@app/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(StaticDataModule);
  app.enableCors({
    origin: parseCorsOrigins(process.env.NEXT_PUBLIC_FRONTEND_URL),
    methods: 'GET',
    credentials: true,
  });

  await app.listen(8087);
}

bootstrap();
