jest.mock(
  'apps/internal-data-service/src/helper',
  () => ({ parseCleanNumber: jest.fn() }),
  { virtual: true },
);

import { DataTranslationService } from './data-translation.service';

describe('DataTranslationService', () => {
  it('stores raw query data for a Belegungskalender tab', async () => {
    const calendarData = [
      {
        id: 'calendar-entry',
        type: 'planbar',
        name: { type: 'Text', value: 'Name', metadata: {} },
        usage: { type: 'Text', value: 'Usage', metadata: {} },
        location: { type: 'Text', value: 'Location', metadata: {} },
        date: { type: 'Text', value: '2026-07-17', metadata: {} },
      },
    ];
    const tab = {
      id: 'calendar-tab',
      widgetId: 'calendar-widget',
      queryId: 'calendar-query',
      componentType: 'Belegungskalender',
      componentSubType: null,
      chartValues: [],
      textValue: '',
      imageSrc: '',
    };
    const dataTranslationRepo = {
      getAllTabs: jest.fn().mockResolvedValue([tab]),
      getWidgetById: jest.fn().mockResolvedValue({
        id: 'calendar-widget',
        usesQueryParameter: false,
      }),
      getWidgetData: jest.fn().mockResolvedValue(null),
      setWidgetData: jest.fn().mockResolvedValue(undefined),
    };
    const populateCalendarService = {
      populateTab: jest
        .fn()
        .mockImplementation(
          async (tabWithContent: { calendarData?: unknown }) => {
            tabWithContent.calendarData = calendarData;
            return null;
          },
        ),
    };
    const service = new DataTranslationService(
      undefined as never,
      { populateTab: jest.fn() } as never,
      { populateTab: jest.fn() } as never,
      { populateTab: jest.fn() } as never,
      dataTranslationRepo as never,
      { populateListview: jest.fn() } as never,
      populateCalendarService as never,
    );

    await service.refreshTabData();

    expect(populateCalendarService.populateTab).toHaveBeenCalledWith(
      expect.objectContaining({ componentType: 'Belegungskalender' }),
    );
    expect(dataTranslationRepo.setWidgetData).toHaveBeenCalledWith(
      'calendar-widget',
      expect.objectContaining({ calendarData }),
    );
  });
});
