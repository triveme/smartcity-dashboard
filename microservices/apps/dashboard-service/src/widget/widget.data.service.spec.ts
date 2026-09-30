jest.mock(
  'apps/data-translation-service/src/populate/populate-chart.service',
  () => ({ PopulateChartService: class PopulateChartService {} }),
  { virtual: true },
);

import { WidgetDataService } from './widget.data.service';

describe('WidgetDataService platform requests', () => {
  beforeEach(() => jest.spyOn(console, 'warn').mockImplementation());
  afterEach(() => jest.restoreAllMocks());

  const createService = (options?: {
    extendedDateSelection?: boolean;
    extendedTimeframe?: string | null;
  }) => {
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
        query_config: {
          attributes: ['temperature'],
          extendedDateSelection: options?.extendedDateSelection ?? true,
        },
        auth_data: { type: 'ngsi-ld' },
        tab: { extendedTimeframe: options?.extendedTimeframe ?? 'week' },
      }),
    };
    const service = new WidgetDataService(
      db as never,
      tabService as never,
      populateChartService as never,
      platformInternalClient as never,
      platformQueryResolver as never,
    );

    return {
      service,
      platformInternalClient,
      platformQueryResolver,
      populateChartService,
    };
  };

  it('gets range data through the selected platform client', async () => {
    const { service, platformInternalClient, populateChartService } =
      createService();

    await expect(
      service.getRangeData(
        'widget-1',
        {
          from: '2026-09-01T00:00:00.000Z',
          to: '2026-09-02T00:00:00.000Z',
          timeZone: 'UTC',
        },
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

  it('rejects a range that exceeds the configured historic timeframe', async () => {
    const { service, platformInternalClient } = createService();

    await expect(
      service.getRangeData('widget-1', {
        from: '2026-09-01T00:00:00.000Z',
        to: '2026-09-09T00:00:00.000Z',
        timeZone: 'UTC',
      }),
    ).rejects.toMatchObject({ status: 400 });

    expect(platformInternalClient.getQueryData).not.toHaveBeenCalled();
  });

  it('rejects range data when historic selection is disabled', async () => {
    const { service, platformInternalClient } = createService({
      extendedDateSelection: false,
    });

    await expect(
      service.getRangeData('widget-1', {
        from: '2026-09-01T00:00:00.000Z',
        to: '2026-09-02T00:00:00.000Z',
        timeZone: 'UTC',
      }),
    ).rejects.toMatchObject({ status: 400 });

    expect(platformInternalClient.getQueryData).not.toHaveBeenCalled();
  });

  it('accepts a range within the configured yearly historic timeframe', async () => {
    const { service, platformInternalClient } = createService({
      extendedTimeframe: 'year',
    });

    await expect(
      service.getRangeData('widget-1', {
        from: '2026-09-01T00:00:00.000Z',
        to: '2027-09-01T00:00:00.000Z',
        timeZone: 'UTC',
      }),
    ).resolves.toEqual([]);

    expect(platformInternalClient.getQueryData).toHaveBeenCalled();
  });

  it('accepts the exact maximum configured historic timeframe', async () => {
    const { service, platformInternalClient } = createService();

    await expect(
      service.getRangeData('widget-1', {
        from: '2026-09-01T00:00:00.000Z',
        to: '2026-09-07T23:59:59.999Z',
        timeZone: 'UTC',
      }),
    ).resolves.toEqual([]);

    expect(platformInternalClient.getQueryData).toHaveBeenCalled();
  });

  it('uses the requesting chart tab to resolve the historic range settings', async () => {
    const { service, platformQueryResolver } = createService();

    await service.getRangeData('widget-1', {
      from: '2026-09-01T00:00:00.000Z',
      to: '2026-09-02T00:00:00.000Z',
      timeZone: 'UTC',
      tabId: 'tab-1',
    });

    expect(platformQueryResolver.getByWidgetId).toHaveBeenCalledWith(
      'widget-1',
      'tab-1',
    );
  });

  it('accepts an exact weekly range in Europe/Berlin', async () => {
    const { service, platformInternalClient } = createService();

    await expect(
      service.getRangeData('widget-1', {
        from: '2026-09-13T22:00:00.000Z',
        to: '2026-09-20T21:59:59.999Z',
        timeZone: 'Europe/Berlin',
      }),
    ).resolves.toEqual([]);

    expect(platformInternalClient.getQueryData).toHaveBeenCalledWith(
      'ngsi-ld',
      'query-1',
      undefined,
      expect.objectContaining({
        dataStartDate: new Date('2026-09-13T22:00:00.000Z'),
        dataUntilDate: new Date('2026-09-20T21:59:59.999Z'),
      }),
    );
  });

  it('handles a weekly range across the Europe/Berlin DST transition', async () => {
    const { service, platformInternalClient } = createService();

    await expect(
      service.getRangeData('widget-1', {
        from: '2026-03-23T23:00:00.000Z',
        to: '2026-03-30T21:59:59.999Z',
        timeZone: 'Europe/Berlin',
      }),
    ).resolves.toEqual([]);

    expect(platformInternalClient.getQueryData).toHaveBeenCalledWith(
      'ngsi-ld',
      'query-1',
      undefined,
      expect.objectContaining({
        dataStartDate: new Date('2026-03-23T23:00:00.000Z'),
        dataUntilDate: new Date('2026-03-30T21:59:59.999Z'),
      }),
    );
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
