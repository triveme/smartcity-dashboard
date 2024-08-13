import { NestFactory } from '@nestjs/core';
import { NgsiModule } from './ngsi.module';
import { ScheduleService } from './scheduler.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(NgsiModule);

  app.enableCors({
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const schedulerService = app.get(ScheduleService);
  await schedulerService.runSchedule();
  await app.listen(8082);
}
bootstrap();
