jest.mock(
  'apps/data-translation-service/src/populate/populate-chart.service',
  () => ({ PopulateChartService: class PopulateChartService {} }),
  { virtual: true },
);

import { WidgetDataService } from './widget.data.service';

describe('WidgetDataService platform requests', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation();
    jest.useFakeTimers({ now: new Date('2026-10-05T10:15:00.000Z') });
  });
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

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
        from: '2025-09-01T00:00:00.000Z',
        to: '2026-09-01T00:00:00.000Z',
        timeZone: 'UTC',
      }),
    ).resolves.toEqual([]);

    expect(platformInternalClient.getQueryData).toHaveBeenCalled();
  });

  it.each(['', '   '])(
    'reports a missing historic timeframe (%j) separately from invalid dates',
    async (extendedTimeframe) => {
      const { service, platformInternalClient } = createService({
        extendedTimeframe,
      });

      await expect(
        service.getRangeData('widget-1', {
          from: '2026-09-01T00:00:00.000Z',
          to: '2026-09-01T23:59:59.999Z',
          timeZone: 'UTC',
        }),
      ).rejects.toMatchObject({
        status: 400,
        message: 'Historic timeframe is not configured for this chart',
      });

      expect(platformInternalClient.getQueryData).not.toHaveBeenCalled();
    },
  );

  it.each(['2026-10-05T23:59:59.999Z', '2026-10-06T00:00:00.000Z'])(
    'rejects future range ends (%s), including later today',
    async (to) => {
      const { service, platformInternalClient } = createService();

      await expect(
        service.getRangeData('widget-1', {
          from: '2026-10-05T00:00:00.000Z',
          to,
          timeZone: 'UTC',
        }),
      ).rejects.toMatchObject({
        status: 400,
        message: 'Historic range must not include future dates',
      });

      expect(platformInternalClient.getQueryData).not.toHaveBeenCalled();
    },
  );

  it('accepts a historic range ending exactly now', async () => {
    const { service, platformInternalClient } = createService();

    await expect(
      service.getRangeData('widget-1', {
        from: '2026-10-05T00:00:00.000Z',
        to: new Date().toISOString(),
        timeZone: 'UTC',
      }),
    ).resolves.toEqual([]);

    expect(platformInternalClient.getQueryData).toHaveBeenCalled();
  });

  it.each([
    { extendedTimeframe: 'month', from: '2026-01-31', end: '2026-02-28' },
    { extendedTimeframe: 'month', from: '2024-01-31', end: '2024-02-29' },
    { extendedTimeframe: 'quarter', from: '2026-01-31', end: '2026-04-30' },
    { extendedTimeframe: 'year', from: '2024-02-29', end: '2025-02-28' },
    { extendedTimeframe: 'year2', from: '2024-02-29', end: '2026-02-28' },
    { extendedTimeframe: 'year3', from: '2020-02-29', end: '2023-02-28' },
  ])(
    'clamps the $extendedTimeframe maximum from $from to $end',
    async ({ extendedTimeframe, from, end }) => {
      const { service, platformInternalClient } = createService({
        extendedTimeframe,
      });
      const endDate = new Date(`${end}T23:59:59.999Z`);
      const range = {
        from: `${from}T00:00:00.000Z`,
        to: endDate.toISOString(),
        timeZone: 'UTC',
      };

      await expect(service.getRangeData('widget-1', range)).resolves.toEqual(
        [],
      );
      expect(platformInternalClient.getQueryData).toHaveBeenCalledTimes(1);
      platformInternalClient.getQueryData.mockClear();

      await expect(
        service.getRangeData('widget-1', {
          ...range,
          to: new Date(endDate.getTime() + 1).toISOString(),
        }),
      ).rejects.toMatchObject({ status: 400 });
      expect(platformInternalClient.getQueryData).not.toHaveBeenCalled();
    },
  );

  it.each([
    {
      from: '2026-01-30T23:00:00.000Z',
      to: '2026-02-28T22:59:59.999Z',
      outside: '2026-02-28T23:00:00.000Z',
    },
    {
      from: '2026-03-30T22:00:00.000Z',
      to: '2026-04-30T21:59:59.999Z',
      outside: '2026-04-30T22:00:00.000Z',
    },
  ])(
    'clamps month ends in the browser calendar timezone ($from)',
    async ({ from, to, outside }) => {
      const { service, platformInternalClient } = createService({
        extendedTimeframe: 'month',
      });
      const range = { from, to, timeZone: 'Europe/Berlin' };

      await expect(service.getRangeData('widget-1', range)).resolves.toEqual(
        [],
      );
      platformInternalClient.getQueryData.mockClear();
      await expect(
        service.getRangeData('widget-1', { ...range, to: outside }),
      ).rejects.toMatchObject({ status: 400 });
      expect(platformInternalClient.getQueryData).not.toHaveBeenCalled();
    },
  );

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
