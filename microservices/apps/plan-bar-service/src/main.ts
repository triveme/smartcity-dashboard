import { NestFactory } from '@nestjs/core';
import { ScheduleService } from './schedule.service';
import { PlanBarDataModule } from './plan-bar-data.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(PlanBarDataModule);

  app.enableCors({
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL,
    methods: ['GET', 'DELETE', 'POST', 'PATCH'],
    credentials: true,
  });
  const schedulerService = app.get(ScheduleService);

  await schedulerService.runSchedule();

  await app.listen(8092);
}

bootstrap();
