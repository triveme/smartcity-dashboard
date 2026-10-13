import { DashboardDataService } from './dashboard.data.service';
import { BadGatewayException } from '@nestjs/common';

describe('DashboardDataService direct CSV requests', () => {
  beforeEach(() => jest.spyOn(console, 'warn').mockImplementation());
  afterEach(() => jest.restoreAllMocks());

  it.each([
    'none',
    'http',
    'processing',
    'query',
    'visible',
    'invalid-range',
    'standard',
    'timeframe',
  ])('gets dashboard-download data directly (failure: %s)', async (failure) => {
    const db = {
      select: jest.fn(() => ({
        from: jest.fn(() => ({
          where: jest.fn().mockResolvedValue([{ id: 'widget-1' }]),
        })),
      })),
    };
    const tabService = { getTabsByWidgetId: jest.fn().mockResolvedValue([]) };
    const csvDataService = {
      getData: jest.fn().mockResolvedValue([]),
    };
    const platformQueryResolver = {
      getByWidgetId: jest.fn().mockResolvedValue({
        query: { id: 'query-1' },
        query_config: { attributes: ['temperature'] },
        auth_data: { type: 'ngsi-ld' },
        data_source: { id: 'source-1' },
      }),
    };
    const service = new DashboardDataService(
      db as never,
      {} as never,
      {} as never,
      tabService as never,
      csvDataService as never,
      platformQueryResolver as never,
    );

    const config = {
      id: 'widget-1',
      changeTimeFramePeriod: failure === 'timeframe',
      downloadCurrentArea: failure === 'visible' || failure === 'invalid-range',
      timeFramePeriod: 'year',
      minRange:
        failure === 'invalid-range' ? 'invalid' : '2026-09-01T00:00:00.000Z',
      maxRange: '2026-09-02T23:59:59.999Z',
      selectedLegendNames: ['temperature'],
    };
    const resolvedQuery = await platformQueryResolver.getByWidgetId();
    if (['visible', 'standard', 'timeframe'].includes(failure)) {
      Object.assign(resolvedQuery.query_config, {
        timeframe: 'week',
        aggrMode: 'avg',
      });
    }
    if (failure === 'visible') {
      resolvedQuery.query_config.attributes = ['temperature', 'humidity'];
      csvDataService.getData.mockResolvedValue({
        entityId: 'sensor-1',
        index: [config.minRange, config.maxRange, '2026-09-03T00:00:00.000Z'],
        attrs: [
          { attrName: 'temperature', values: [10, 20, 30] },
          { attrName: 'humidity', values: [40, 50, 60] },
        ],
      });
    }
    if (failure === 'invalid-range') {
      await expect(
        service.downloadDashboardData('dashboard-1', ['widget-1'], [
          config,
        ] as never),
      ).rejects.toMatchObject({ status: 400 });
      expect(csvDataService.getData).not.toHaveBeenCalled();
      return;
    }

    if (['http', 'processing', 'query'].includes(failure)) {
      if (failure === 'query') {
        platformQueryResolver.getByWidgetId.mockResolvedValue(null);
      } else {
        csvDataService.getData.mockRejectedValue(
          failure === 'http'
            ? new BadGatewayException('Source data could not be fetched')
            : new Error('Source credentials could not be loaded'),
        );
      }
      await expect(
        service.downloadDashboardData('dashboard-1', ['widget-1'], [
          {
            id: 'widget-1',
            changeTimeFramePeriod: false,
            downloadCurrentArea: false,
          },
        ] as never),
      ).rejects.toMatchObject({
        status: failure === 'http' ? 502 : failure === 'query' ? 404 : 500,
      });
      return;
    }

    const csv = await service.downloadDashboardData(
      'dashboard-1',
      ['widget-1'],
      [config] as never,
    );
    if (failure === 'visible') {
      expect(csvDataService.getData).toHaveBeenCalledWith(
        expect.objectContaining({
          query_config: expect.objectContaining({
            timeframe: 'user_defined',
            dataStartDate: new Date(config.minRange),
            dataUntilDate: new Date(config.maxRange),
            aggrMode: 'avg',
          }),
        }),
      );
      expect(csv).toContain(config.minRange);
      expect(csv).toContain(config.maxRange);
      expect(csv).toContain('2026-09-03');
      expect(csv).toContain('"temperature"');
      expect(csv).toContain('"humidity"');
      expect(csv.split('\n')).toHaveLength(7);
      expect(resolvedQuery.query_config).toMatchObject({
        timeframe: 'week',
        aggrMode: 'avg',
      });
      expect(resolvedQuery.query_config).not.toHaveProperty('dataStartDate');
      return;
    }
    if (failure === 'standard' || failure === 'timeframe') {
      expect(csvDataService.getData).toHaveBeenCalledWith(
        expect.objectContaining({
          query_config: expect.objectContaining({
            timeframe: failure === 'standard' ? 'week' : 'year',
            aggrMode: 'avg',
          }),
        }),
      );
      return;
    }
    expect(csv).toBe('"entityId","attrName","value","index"');

    expect(csvDataService.getData).toHaveBeenCalledWith({
      queryIds: ['query-1'],
      auth_data: { type: 'ngsi-ld' },
      data_source: { id: 'source-1' },
      query_config: {
        attributes: ['temperature'],
        timeframe: 'month',
        aggrMode: 'none',
      },
    });
    expect(resolvedQuery.query_config).toEqual({
      attributes: ['temperature'],
    });
  });
});
