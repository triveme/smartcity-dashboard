import { QueryService } from './query.service';

describe('SQL View QueryService scheduler queueing', () => {
  it('submits every due batch as background queue work', async () => {
    const batch = {
      queryIds: ['query-1'],
      data_source: { id: 'source-1' },
      query_config: {
        dataSourceId: 'source-1',
        fiwareService: 'weather_view',
        attributes: ['temperature'],
      },
    } as any;
    const queueSignal = new AbortController().signal;
    const sqlViewService = {
      executeQueuedFetch: jest.fn(({ execute }) => execute(queueSignal)),
      getDataFromDataSource: jest.fn().mockResolvedValue({ attributes: [] }),
    };
    const transformationService = {
      convertAttributesToFiware: jest.fn().mockReturnValue({ attrs: [] }),
    };
    const service = new QueryService(
      {} as any,
      sqlViewService as any,
      transformationService as any,
    );
    jest
      .spyOn(service, 'getQueriesToUpdate')
      .mockResolvedValue(new Map([['first', batch]]));
    jest.spyOn(service, 'setQueryDataOfBatch').mockResolvedValue(undefined);

    await service.updateQueries();

    expect(sqlViewService.executeQueuedFetch).toHaveBeenCalledWith(
      expect.objectContaining({
        category: 'scheduler',
        priority: 'background',
        fingerprintInput: expect.objectContaining({
          platform: 'sql-view',
          operation: 'query-data',
        }),
      }),
    );
    expect(sqlViewService.getDataFromDataSource).toHaveBeenCalledWith(
      batch,
      queueSignal,
    );
  });
});
