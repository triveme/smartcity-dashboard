import { QueryService } from './query.service';

describe('Internal Data QueryService scheduler queueing', () => {
  it('submits every due batch as background queue work', async () => {
    const batch = {
      queryIds: ['query-1'],
      data_source: { id: 'source-1' },
      query_config: {
        dataSourceId: 'source-1',
        fiwareService: 'collection',
        fiwareType: 'source',
        entityIds: ['entity-1'],
        attributes: ['temperature'],
      },
    } as any;
    const queueSignal = new AbortController().signal;
    const dataService = {
      executeQueuedFetch: jest.fn(({ execute }) => execute(queueSignal)),
      getDataFromDataSource: jest.fn().mockResolvedValue([{ Id: 'entity-1' }]),
    };
    const transformationService = {
      transformCollection: jest.fn().mockReturnValue([]),
    };
    const service = new QueryService(
      {} as any,
      dataService as any,
      transformationService as any,
    );
    jest
      .spyOn(service, 'getQueriesToUpdate')
      .mockResolvedValue(new Map([['first', batch]]));
    jest.spyOn(service, 'setQueryDataOfBatch').mockResolvedValue(undefined);

    await service.updateQueries();

    expect(dataService.executeQueuedFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'scheduler',
        priority: 'background',
        fingerprintInput: expect.objectContaining({
          platform: 'internal-data',
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
