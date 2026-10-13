jest.mock(
  'apps/data-translation-service/src/populate/populate-chart.service',
  () => ({ PopulateChartService: class PopulateChartService {} }),
  { virtual: true },
);

import { WidgetDataService } from './widget.data.service';
import { BadGatewayException } from '@nestjs/common';

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
    const csvDataService = { getData: jest.fn().mockResolvedValue([]) };
    const platformQueryResolver = {
      getByWidgetId: jest.fn().mockResolvedValue({
        query: { id: 'query-1' },
        query_config: {
          attributes: ['temperature'],
          extendedDateSelection: options?.extendedDateSelection ?? true,
        },
        auth_data: { type: 'ngsi-ld' },
        data_source: { id: 'source-1' },
        tab: { extendedTimeframe: options?.extendedTimeframe ?? 'week' },
      }),
    };
    const service = new WidgetDataService(
      db as never,
      tabService as never,
      populateChartService as never,
      platformInternalClient as never,
      platformQueryResolver as never,
      csvDataService as never,
    );

    return {
      service,
      platformInternalClient,
      platformQueryResolver,
      populateChartService,
      csvDataService,
      db,
      tabService,
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

  it.each([true, false])(
    'rejects CSV source failures (HTTP: %s)',
    async (isHttpError) => {
      const { service, csvDataService } = createService();
      csvDataService.getData.mockRejectedValue(
        isHttpError
          ? new BadGatewayException('Source data could not be fetched')
          : new Error('Source credentials could not be loaded'),
      );
      await expect(
        service.downloadWidgetData('widget-1', {
          changeTimeFramePeriod: false,
          downloadCurrentArea: false,
        } as never),
      ).rejects.toMatchObject({ status: isHttpError ? 502 : 500 });
    },
  );

  it('gets widget-download data directly without a user token or platform request', async () => {
    const { service, platformInternalClient, csvDataService } = createService();

    const csv = await service.downloadWidgetData('widget-1', {
      changeTimeFramePeriod: false,
      downloadCurrentArea: false,
    } as never);
    expect(csv).toBe('"entityId","attrName","value","index"');

    expect(csvDataService.getData).toHaveBeenCalledWith({
      queryIds: ['query-1'],
      auth_data: { type: 'ngsi-ld' },
      data_source: { id: 'source-1' },
      query_config: {
        attributes: ['temperature'],
        extendedDateSelection: true,
        timeframe: 'month',
        aggrMode: 'none',
      },
    });
    expect(platformInternalClient.getQueryData).not.toHaveBeenCalled();
  });

  it('uses the matching widget configuration regardless of array order', async () => {
    const { service, csvDataService } = createService();

    await service.downloadWidgetData('widget-1', [
      { id: 'widget-2', changeTimeFramePeriod: true, timeFramePeriod: 'year' },
      { id: 'widget-1', changeTimeFramePeriod: true, timeFramePeriod: 'week' },
    ] as never);

    expect(csvDataService.getData).toHaveBeenCalledWith(
      expect.objectContaining({
        query_config: expect.objectContaining({ timeframe: 'week' }),
      }),
    );
  });

  it.each(['ngsi', 'ngsi-ld', 'ngsi-v2'])(
    'fetches the visible historical range without filtering returned %s CSV data',
    async (type) => {
      const { service, csvDataService, platformQueryResolver } =
        createService();
      const query = await platformQueryResolver.getByWidgetId();
      query.auth_data.type = type;
      Object.assign(query.query_config, { timeframe: 'week', aggrMode: 'avg' });
      query.query_config.attributes = ['temperature', 'humidity'];
      const minRange = '2026-09-01T00:00:00.000Z';
      const maxRange = '2026-09-02T23:59:59.999Z';
      csvDataService.getData.mockResolvedValue({
        entityId: 'sensor-1',
        index: [minRange, maxRange, '2026-09-03T00:00:00.000Z'],
        attrs: [
          { attrName: 'temperature', values: [10, 20, 30] },
          { attrName: 'humidity', values: [40, 50, 60] },
        ],
      });

      const csv = await service.downloadWidgetData('widget-1', {
        id: 'widget-1',
        downloadCurrentArea: true,
        changeTimeFramePeriod: false,
        minRange,
        maxRange,
        selectedLegendNames: ['temperature'],
      } as never);

      expect(csvDataService.getData).toHaveBeenCalledWith(
        expect.objectContaining({
          query_config: expect.objectContaining({
            timeframe: 'user_defined',
            dataStartDate: new Date(minRange),
            dataUntilDate: new Date(maxRange),
            aggrMode: 'avg',
          }),
        }),
      );
      expect(csv).toContain(minRange);
      expect(csv).toContain(maxRange);
      expect(csv).toContain('2026-09-03');
      expect(csv).toContain('"temperature"');
      expect(csv).toContain('"humidity"');
      expect(csv.split('\n')).toHaveLength(7);
      expect(query.query_config).toMatchObject({
        timeframe: 'week',
        aggrMode: 'avg',
      });
      expect(query.query_config).not.toHaveProperty('dataStartDate');
    },
  );

  it.each([
    { minRange: 'invalid', maxRange: '2026-09-02' },
    { minRange: '2026-09-03', maxRange: '2026-09-02' },
    { minRange: undefined, maxRange: undefined },
  ])('rejects invalid visible CSV ranges: %j', async (range) => {
    const { service, csvDataService } = createService();

    await expect(
      service.downloadWidgetData('widget-1', {
        id: 'widget-1',
        downloadCurrentArea: true,
        ...range,
      } as never),
    ).rejects.toMatchObject({ status: 400 });
    expect(csvDataService.getData).not.toHaveBeenCalled();
  });

  it('keeps the stored timeframe for standard-configuration exports', async () => {
    const { service, csvDataService, platformQueryResolver } = createService();
    const query = await platformQueryResolver.getByWidgetId();
    Object.assign(query.query_config, {
      timeframe: 'quarter',
      aggrMode: 'avg',
    });

    await service.downloadWidgetData('widget-1', {
      id: 'widget-1',
      downloadCurrentArea: false,
      changeTimeFramePeriod: false,
      timeFramePeriod: 'year',
      minRange: '2026-09-01',
      maxRange: '2026-09-02',
    } as never);

    expect(csvDataService.getData).toHaveBeenCalledWith(
      expect.objectContaining({ query_config: query.query_config }),
    );
  });

  it('uses stored query settings when no matching configuration exists', async () => {
    const { service, csvDataService } = createService();

    await service.downloadWidgetData('widget-1', [
      { id: 'widget-2', changeTimeFramePeriod: true, timeFramePeriod: 'year' },
    ] as never);

    expect(csvDataService.getData).toHaveBeenCalledWith(
      expect.objectContaining({
        query_config: expect.objectContaining({ timeframe: 'month' }),
      }),
    );
  });

  it('resolves the configuration separately for each combined-widget child', async () => {
    const { service, csvDataService, db, tabService } = createService();
    const where = jest
      .fn()
      .mockResolvedValueOnce([{ id: 'widget-1' }])
      .mockResolvedValueOnce([{ id: 'child-1' }])
      .mockResolvedValueOnce([{ id: 'child-2' }]);
    db.select.mockReturnValue({ from: jest.fn(() => ({ where })) });
    tabService.getTabsByWidgetId.mockResolvedValue([
      {
        componentType: 'Kombinierte Komponente',
        childWidgets: ['child-1', 'child-2'],
      },
    ]);

    await service.downloadWidgetData('widget-1', [
      { id: 'child-2', changeTimeFramePeriod: true, timeFramePeriod: 'year' },
      { id: 'child-1', changeTimeFramePeriod: true, timeFramePeriod: 'week' },
    ] as never);

    expect(csvDataService.getData).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        query_config: expect.objectContaining({ timeframe: 'week' }),
      }),
    );
    expect(csvDataService.getData).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        query_config: expect.objectContaining({ timeframe: 'year' }),
      }),
    );
  });

  it('rejects missing widget queries instead of returning error CSV', async () => {
    const { service, platformQueryResolver } = createService();
    platformQueryResolver.getByWidgetId.mockResolvedValue(null);

    await expect(
      service.downloadWidgetData('widget-1', []),
    ).rejects.toMatchObject({ status: 404 });
  });

  it('rejects missing widgets instead of returning error CSV', async () => {
    const { service, db } = createService();
    db.select.mockReturnValue({
      from: jest.fn(() => ({ where: jest.fn().mockResolvedValue([]) })),
    });

    await expect(
      service.downloadWidgetData('widget-1', []),
    ).rejects.toMatchObject({ status: 404 });
  });
});
