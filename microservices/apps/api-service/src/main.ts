import { NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';
import { ScheduleService } from './schedule.service';
import { OrganisationScheduleService } from './organisation-schedule.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(ApiModule);

  app.enableCors({
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL,
    methods: 'GET',
    credentials: true,
  });

  const schedulerService = app.get(ScheduleService);
  const organisationSchedulerService = app.get(OrganisationScheduleService);

  await schedulerService.runSchedule();
  await organisationSchedulerService.runSchedule();

  await app.listen(8083);
}

bootstrap();
