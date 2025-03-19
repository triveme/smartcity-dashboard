import { NestFactory } from '@nestjs/core';
import { UsiPlatformModule } from './usi-platform.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(UsiPlatformModule);

  app.enableCors({
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL,
    methods: 'GET',
    credentials: true,
  });

  await app.listen(8088);
}

bootstrap();
