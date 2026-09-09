import { OrchideoConnectService } from './api.service';

describe('OrchideoConnectService scheduler queueing', () => {
  it('submits each tenant batch as background queue work', async () => {
    const batch = {
      queryIds: ['query-1'],
      data_source: { id: 'source-1' },
      auth_data: { id: 'auth-1', apiUrl: 'https://example.test' },
      query_config: {
        dataSourceId: 'source-1',
        fiwareService: 'collection',
        fiwareType: 'source',
        entityIds: ['entity-1'],
        attributes: ['temperature'],
        timeframe: 'live',
        aggrMode: 'none',
      },
    } as any;
    const queueSignal = new AbortController().signal;
    const dataService = {
      executeQueuedFetch: jest.fn(({ execute }) => execute(queueSignal)),
      getDataFromDataSource: jest.fn().mockResolvedValue([]),
    };
    const queryService = {
      getQueriesToUpdate: jest
        .fn()
        .mockResolvedValue(
          new Map([['tenant-a', new Map([['first', batch]])]]),
        ),
      setQueryDataOfBatch: jest.fn().mockResolvedValue(undefined),
    };
    const service = new OrchideoConnectService(
      {} as any,
      queryService as any,
      dataService as any,
      {} as any,
    );

    await service.updateQueries();

    expect(dataService.executeQueuedFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'scheduler',
        priority: 'background',
        fingerprintInput: expect.objectContaining({
          platform: 'orchideo',
          operation: 'query-data',
        }),
      }),
    );
    expect(dataService.getDataFromDataSource).toHaveBeenCalledWith(
      batch,
      queueSignal,
    );
  });
});
