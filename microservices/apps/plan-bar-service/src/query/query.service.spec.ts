import { QueryService } from './query.service';

describe('PlanBar QueryService scheduler queueing', () => {
  it('submits every due batch as background queue work', async () => {
    const batch = {
      queryIds: ['query-1'],
      data_source: { id: 'source-1' },
      auth_data: {
        id: 'auth-1',
        liveUrl: 'https://example.test/live',
      },
      query_config: {
        dataSourceId: 'source-1',
        entityIds: ['driver-1'],
      },
    } as any;
    const queueSignal = new AbortController().signal;
    const planBarService = {
      executeQueuedFetch: jest.fn(({ execute }) => execute(queueSignal)),
      getDataFromDataSource: jest.fn().mockResolvedValue([]),
    };
    const service = new QueryService({} as any, planBarService as any);
    jest
      .spyOn(service, 'getQueriesToUpdate')
      .mockResolvedValue(new Map([['first', batch]]));
    jest.spyOn(service, 'setQueryDataOfBatch').mockResolvedValue(undefined);

    await service.updateQueries();

    expect(planBarService.executeQueuedFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'scheduler',
        priority: 'background',
        fingerprintInput: expect.objectContaining({
          platform: 'plan-bar',
          operation: 'query-data',
        }),
      }),
    );
    expect(planBarService.getDataFromDataSource).toHaveBeenCalledWith(
      batch,
      queueSignal,
    );
  });
});
