import { UsiPlaformService } from './usi-platform.service';

describe('UsiPlaformService scheduler queueing', () => {
  it('submits every due batch as background queue work', async () => {
    const batch = {
      queryIds: ['query-1'],
      data_source: { id: 'source-1' },
      auth_data: {
        id: 'auth-1',
        apiUrl: 'https://example.test/api',
        liveUrl: 'https://example.test/live',
      },
      query_config: {
        dataSourceId: 'source-1',
        fiwareType: 'weather',
        entityIds: ['sensor-1'],
        attributes: ['temperature'],
        timeframe: 'day',
        aggrMode: 'avg',
        aggrPeriod: 'hour',
      },
    } as any;
    const queueSignal = new AbortController().signal;
    const queryConfigService = {
      executeQueuedFetch: jest.fn(({ execute }) => execute(queueSignal)),
      getSensorData: jest.fn().mockResolvedValue({ attrs: [] }),
    };
    const queryService = {
      getQueriesToUpdate: jest
        .fn()
        .mockResolvedValue(new Map([['first', batch]])),
    };
    const service = new UsiPlaformService(
      {} as any,
      queryService as any,
      queryConfigService as any,
    );
    jest.spyOn(service, 'setQueryDataOfBatch').mockResolvedValue(undefined);

    await service.updateFiwareQueries();

    expect(queryConfigService.executeQueuedFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'scheduler',
        priority: 'background',
        fingerprintInput: expect.objectContaining({
          platform: 'usi',
          operation: 'query-data',
        }),
      }),
    );
    expect(queryConfigService.getSensorData).toHaveBeenCalledWith(
      batch.query_config,
      queueSignal,
    );
  });
});
