import { NestFactory } from '@nestjs/core';
import { ScheduleService } from './schedule.service';
import { StaticDataModule } from './static-data.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(StaticDataModule);

  app.enableCors({
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL,
    methods: 'GET',
    credentials: true,
  });

  const schedulerService = app.get(ScheduleService);

  await schedulerService.runSchedule();

  await app.listen(8087);
}

bootstrap();
