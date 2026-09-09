jest.mock(
  'apps/data-translation-service/src/populate/populate-chart.service',
  () => ({ PopulateChartService: class PopulateChartService {} }),
  { virtual: true },
);

import { WidgetDataService } from './widget.data.service';

describe('WidgetDataService platform requests', () => {
  beforeEach(() => jest.spyOn(console, 'warn').mockImplementation());
  afterEach(() => jest.restoreAllMocks());

  const createService = () => {
    const db = {
      select: jest.fn(() => ({
        from: jest.fn(() => ({
          where: jest.fn().mockResolvedValue([{ id: 'widget-1' }]),
        })),
      })),
    };
    const tabService = { getTabsByWidgetId: jest.fn().mockResolvedValue([]) };
    const populateChartService = {
      normalizeHistoricalQueryData: jest.fn().mockReturnValue([]),
    };
    const platformInternalClient = {
      getQueryData: jest.fn().mockResolvedValue([]),
    };
    const platformQueryResolver = {
      getByWidgetId: jest.fn().mockResolvedValue({
        query: { id: 'query-1' },
        query_config: { attributes: ['temperature'] },
        auth_data: { type: 'ngsi-ld' },
      }),
    };
    const service = new WidgetDataService(
      db as never,
      tabService as never,
      populateChartService as never,
      platformInternalClient as never,
      platformQueryResolver as never,
    );

    return { service, platformInternalClient, populateChartService };
  };

  it('gets range data through the selected platform client', async () => {
    const { service, platformInternalClient, populateChartService } =
      createService();

    await expect(
      service.getRangeData(
        'widget-1',
        { from: '2026-09-01T00:00:00.000Z', to: '2026-09-02T00:00:00.000Z' },
        false,
        'Bearer caller-token',
      ),
    ).resolves.toEqual([]);

    expect(platformInternalClient.getQueryData).toHaveBeenCalledWith(
      'ngsi-ld',
      'query-1',
      'Bearer caller-token',
      {
        timeframe: 'user_defined',
        dataStartDate: new Date('2026-09-01T00:00:00.000Z'),
        dataUntilDate: new Date('2026-09-02T00:00:00.000Z'),
      },
    );
    expect(
      populateChartService.normalizeHistoricalQueryData,
    ).toHaveBeenCalled();
  });

  it('gets widget-download data through the selected platform client', async () => {
    const { service, platformInternalClient } = createService();

    await service.downloadWidgetData(
      'widget-1',
      {
        changeTimeFramePeriod: false,
        downloadCurrentArea: false,
      } as never,
      'Bearer caller-token',
    );

    expect(platformInternalClient.getQueryData).toHaveBeenCalledWith(
      'ngsi-ld',
      'query-1',
      'Bearer caller-token',
      {
        timeframe: 'month',
        aggrMode: 'none',
        aggrPeriod: undefined,
      },
    );
  });
});
