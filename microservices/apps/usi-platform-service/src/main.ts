import { NestFactory } from '@nestjs/core';
import { UsiPlatformModule } from './usi-platform.module';
import { ScheduleService } from './schedule.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(UsiPlatformModule);

  app.enableCors({
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL,
    methods: 'GET',
    credentials: true,
  });

  const schedulerService = app.get(ScheduleService);

  await schedulerService.runSchedule();
  await app.listen(8088);
}

bootstrap();
