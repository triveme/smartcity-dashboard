import { NestFactory } from '@nestjs/core';
import { UsiPlatformModule } from './usi-platform.module';
import { parseCorsOrigins } from '@app/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(UsiPlatformModule);
  app.enableShutdownHooks();
  app.enableCors({
    origin: parseCorsOrigins(process.env.NEXT_PUBLIC_FRONTEND_URL),
    methods: 'GET',
    credentials: true,
  });

  await app.listen(8088);
}

bootstrap();
