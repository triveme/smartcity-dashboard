import { Injectable } from '@nestjs/common';
import { CalendarData, TabWithContent } from '../data-translation.service';
import { DataTranslationRepo } from '../data-translation.repo';

@Injectable()
export class PopulateCalendarService {
  constructor(private readonly dataTranslationRepo: DataTranslationRepo) {}

  async populateTab(tab: TabWithContent): Promise<string | null> {
    if (!tab.queryId) {
      return null;
    }

    const query = await this.dataTranslationRepo.getQueryById(tab.queryId);
    if (!query || query.queryData === null || query.queryData === undefined) {
      return null;
    }

    const queryConfig = await this.dataTranslationRepo.getQueryConfigById(
      query.queryConfigId,
    );
    if (!queryConfig) {
      return null;
    }

    tab.calendarData = query.queryData as CalendarData;
    tab.timeframe = queryConfig.timeframe ?? null;

    return queryConfig.timeframe ?? null;
  }
}
