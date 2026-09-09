import { NgsiService } from './ngsi.service';

describe('NgsiService scheduler queueing', () => {
  it('submits every due FIWARE batch as background queue work', async () => {
    const batch = {
      queryIds: ['query-1'],
      data_source: { id: 'source-1' },
      auth_data: {
        id: 'auth-1',
        type: 'ngsi-v2',
        liveUrl: 'https://example.test/live',
        timeSeriesUrl: 'https://example.test/history',
      },
      query_config: {
        dataSourceId: 'source-1',
        fiwareService: 'tenant',
        fiwareServicePath: '/',
        fiwareType: 'Sensor',
        entityIds: ['sensor-1'],
        attributes: ['temperature'],
        timeframe: 'day',
        aggrMode: 'avg',
        aggrPeriod: 'hour',
      },
    } as any;
    const queueSignal = new AbortController().signal;
    const dataService = {
      executeQueuedFetch: jest.fn(({ execute }) => execute(queueSignal)),
      getDataFromDataSource: jest.fn().mockResolvedValue({ attrs: [] }),
    };
    const queryService = {
      getQueriesToUpdate: jest.fn().mockResolvedValue(
        new Map([
          ['first', batch],
          ['second', batch],
        ]),
      ),
      setQueryDataOfBatch: jest.fn().mockResolvedValue(undefined),
    };
    const service = new NgsiService(
      {} as any,
      dataService as any,
      {} as any,
      queryService as any,
    );

    await service.updateFiwareQueries();

    expect(dataService.executeQueuedFetch).toHaveBeenCalledTimes(2);
    expect(dataService.executeQueuedFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'scheduler',
        priority: 'background',
        fingerprintInput: expect.objectContaining({
          platform: 'ngsi',
          operation: 'query-data',
        }),
      }),
    );
    expect(dataService.getDataFromDataSource).toHaveBeenCalledWith(
      batch,
      queueSignal,
    );
    expect(queryService.setQueryDataOfBatch).toHaveBeenCalledTimes(2);
  });

  it('keeps the scheduler running when a queued FIWARE update fails', async () => {
    const batch = {
      queryIds: ['query-1'],
      data_source: { id: 'source-1' },
      auth_data: { id: 'auth-1', type: 'ngsi-v2' },
      query_config: {
        dataSourceId: 'source-1',
        entityIds: ['sensor-1'],
        attributes: ['temperature'],
      },
    } as any;
    const dataService = {
      executeQueuedFetch: jest
        .fn()
        .mockRejectedValueOnce(new Error('authentication failed'))
        .mockResolvedValueOnce(undefined),
    };
    const queryService = {
      getQueriesToUpdate: jest.fn().mockResolvedValue(
        new Map([
          ['first', batch],
          ['second', batch],
        ]),
      ),
    };
    const service = new NgsiService(
      {} as any,
      dataService as any,
      {} as any,
      queryService as any,
    );

    await expect(service.updateFiwareQueries()).resolves.toBeUndefined();
    expect(dataService.executeQueuedFetch).toHaveBeenCalledTimes(2);
  });

  it('waits for queued interactive on-demand data and preserves its response', async () => {
    let resolveData!: (value: object) => void;
    const pendingData = new Promise<object>((resolve) => {
      resolveData = resolve;
    });
    const batch = {
      queryIds: ['query-1'],
      data_source: { id: 'source-1' },
      auth_data: { id: 'auth-1', type: 'ngsi-v2' },
      query_config: {
        dataSourceId: 'source-1',
        entityIds: ['old-entity'],
        attributes: ['old-attribute'],
      },
    } as any;
    const queueSignal = new AbortController().signal;
    const dataService = {
      executeQueuedFetch: jest.fn(({ execute }) => execute(queueSignal)),
      getDataFromDataSource: jest.fn().mockReturnValue(pendingData),
    };
    const queryService = {
      getQueryHashMap: jest
        .fn()
        .mockResolvedValue(new Map([['query-1', batch]])),
    };
    const service = new NgsiService(
      {} as any,
      dataService as any,
      {} as any,
      queryService as any,
    );

    const result = service.getOnDemandData(
      'query-1',
      'entity-1',
      'temperature',
    );
    await Promise.resolve();

    expect(dataService.executeQueuedFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'on-demand',
        priority: 'interactive',
        fingerprintInput: expect.objectContaining({
          operation: 'on-demand-data',
        }),
      }),
    );
    expect(dataService.getDataFromDataSource).toHaveBeenCalledWith(
      expect.objectContaining({
        query_config: expect.objectContaining({
          entityIds: ['entity-1'],
          attributes: ['temperature'],
        }),
      }),
      queueSignal,
    );

    resolveData({
      index: ['2026-09-01T00:00:00.000Z'],
      attributes: [{ attrName: 'temperature', values: [21] }],
    });

    await expect(result).resolves.toEqual({
      name: 'temperature',
      values: [['2026-09-01T00:00:00.000Z', 21]],
    });
  });

  it('preserves queued on-demand errors', async () => {
    const error = new Error('upstream failed');
    const batch = {
      queryIds: ['query-1'],
      data_source: { id: 'source-1' },
      auth_data: { id: 'auth-1', type: 'ngsi-v2' },
      query_config: { dataSourceId: 'source-1' },
    } as any;
    const dataService = {
      executeQueuedFetch: jest.fn().mockRejectedValue(error),
    };
    const queryService = {
      getQueryHashMap: jest
        .fn()
        .mockResolvedValue(new Map([['query-1', batch]])),
    };
    const service = new NgsiService(
      {} as any,
      dataService as any,
      {} as any,
      queryService as any,
    );

    await expect(
      service.getOnDemandData('query-1', 'entity-1', 'temperature'),
    ).rejects.toBe(error);
  });
});
