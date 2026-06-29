import { NestFactory } from '@nestjs/core';
import { ScheduleService } from './schedule.service';
import { InternalDataModule } from './internal-data.module';
import { parseCorsOrigins } from '@app/common';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(InternalDataModule, {
    logger: ['error', 'warn', 'log'],
  });
  app.enableCors({
    origin: parseCorsOrigins(process.env.NEXT_PUBLIC_FRONTEND_URL),
    methods: ['GET', 'DELETE', 'POST', 'PATCH'],
    credentials: true,
  });

  const schedulerService = app.get(ScheduleService);

  await schedulerService.runSchedule();

  await app.listen(8089);
}

bootstrap();
