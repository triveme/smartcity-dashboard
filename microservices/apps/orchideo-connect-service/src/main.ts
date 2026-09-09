import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { OrchideoConnectModule } from './api.module';
import { ScheduleService } from './schedule.service';
import { OrganisationScheduleService } from './organisation-schedule.service';
import { parseCorsOrigins } from '@app/common';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(OrchideoConnectModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });
  app.enableShutdownHooks();
  app.enableCors({
    origin: parseCorsOrigins(process.env.NEXT_PUBLIC_FRONTEND_URL),
    methods: 'GET',
    credentials: true,
  });

  const schedulerService = app.get(ScheduleService);
  const organisationSchedulerService = app.get(OrganisationScheduleService);

  await app.listen(8083);

  void (async () => {
    await schedulerService.runSchedule();
    await organisationSchedulerService.runSchedule();
  })().catch((error: unknown) => {
    logger.error(
      'Initial Orchideo refresh failed',
      error instanceof Error ? error.stack : String(error),
    );
  });
}

bootstrap();
