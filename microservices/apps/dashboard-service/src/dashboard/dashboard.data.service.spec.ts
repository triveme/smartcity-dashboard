import { DashboardDataService } from './dashboard.data.service';

describe('DashboardDataService platform requests', () => {
  beforeEach(() => jest.spyOn(console, 'warn').mockImplementation());
  afterEach(() => jest.restoreAllMocks());

  it('gets dashboard-download data through the selected platform client', async () => {
    const db = {
      select: jest.fn(() => ({
        from: jest.fn(() => ({
          where: jest.fn().mockResolvedValue([{ id: 'widget-1' }]),
        })),
      })),
    };
    const tabService = { getTabsByWidgetId: jest.fn().mockResolvedValue([]) };
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
    const service = new DashboardDataService(
      db as never,
      {} as never,
      {} as never,
      tabService as never,
      platformInternalClient as never,
      platformQueryResolver as never,
    );

    await service.downloadDashboardData(
      'dashboard-1',
      ['widget-1'],
      [
        {
          id: 'widget-1',
          changeTimeFramePeriod: false,
          downloadCurrentArea: false,
        },
      ] as never,
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
