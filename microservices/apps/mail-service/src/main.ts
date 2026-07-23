import { NestFactory } from '@nestjs/core';
import { MailModule } from './mail.module';
import { parseCorsOrigins } from '@app/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(MailModule);
  app.enableCors({
    origin: parseCorsOrigins(process.env.NEXT_PUBLIC_FRONTEND_URL),
    methods: 'GET,POST',
    credentials: true,
  });

  await app.listen(8085);
}
bootstrap();
