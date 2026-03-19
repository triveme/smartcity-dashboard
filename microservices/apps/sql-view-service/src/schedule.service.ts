import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { QueryService } from './query/query.service';

@Injectable()
export class ScheduleService {
  constructor(private readonly queryService: QueryService) {}

  @Cron('0 * * * * *') // every minute
  async runSchedule(): Promise<void> {
    await this.queryService.updateQueries();
  }
}
