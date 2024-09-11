import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { OrganisationService } from './organisation/organisation.service';

@Injectable()
export class OrganisationScheduleService {
  constructor(private readonly organisationService: OrganisationService) {}

  @Cron('0 0 0 * * *') // every day
  async runSchedule(): Promise<void> {
    await this.organisationService.updateGroupingElements();
  }
}
