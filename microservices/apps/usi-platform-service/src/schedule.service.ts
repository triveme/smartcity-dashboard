import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { UsiPlaformService } from './usi-platform.service';

@Injectable()
export class ScheduleService {
  constructor(private readonly apiService: UsiPlaformService) {}

  @Cron('0 * * * * *') // every minute
  async runSchedule(): Promise<void> {
    await this.apiService.updateFiwareQueries();
  }
}
