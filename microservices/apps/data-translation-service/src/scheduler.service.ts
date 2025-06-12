import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataTranslationService } from './data-translation.service';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly dataTranslationServiceService: DataTranslationService,
  ) {}

  @Cron('0 * * * * *')
  async runSchedule(): Promise<void> {
    await this.dataTranslationServiceService.refreshTabData();
  }
}
