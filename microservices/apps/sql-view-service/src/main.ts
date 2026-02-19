import { NestFactory } from '@nestjs/core';
import { SqlViewDataModule } from './sql-view-data.module';
import { ScheduleService } from './schedule.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(SqlViewDataModule);

  app.enableCors({
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL,
    methods: ['GET', 'DELETE', 'POST', 'PATCH'],
    credentials: true,
  });
  const schedulerService = app.get(ScheduleService);

  await schedulerService.runSchedule();

  await app.listen(8091);
}

bootstrap();
