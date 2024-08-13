import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { NgsiService } from './ngsi.service';

@Injectable()
export class ScheduleService {
  constructor(private readonly ngsiService: NgsiService) {}

  @Cron('0 * * * * *') // every minute
  async runSchedule(): Promise<void> {
    await this.ngsiService.updateQueries();
  }
}
