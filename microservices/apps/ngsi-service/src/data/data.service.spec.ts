import axios from 'axios';
import { DataService } from './data.service';

describe('NGSI DataService upstream failures', () => {
  afterEach(() => jest.restoreAllMocks());

  it('propagates V2 upstream errors to the queue executor', async () => {
    jest.spyOn(console, 'error').mockImplementation();
    const error = new Error('upstream unavailable');
    jest.spyOn(axios, 'get').mockRejectedValue(error);
    const service = new DataService({} as never, {} as never);
    const queryBatch = {
      queryIds: ['query-1'],
      data_source: { id: 'source-1' },
      auth_data: { liveUrl: 'https://example.test/live' },
      query_config: {
        timeframe: 'live',
        fiwareService: 'tenant',
        fiwareServicePath: '/',
        fiwareType: 'Sensor',
        entityIds: ['entity-1'],
        attributes: ['temperature'],
      },
    };

    await expect(
      service.getDataFromDataSourceNgsiV2(queryBatch as never, 'token'),
    ).rejects.toBe(error);
  });

  it('does not convert an upstream fetch error into a successful empty result', async () => {
    const error = new Error('upstream unavailable');
    const authService = {
      getAccessTokenByQuery: jest.fn().mockResolvedValue('token'),
    };
    const service = new DataService(authService as never, {} as never);
    const queryBatch = {
      auth_data: { type: 'ngsi-v2' },
      data_source: { id: 'source-1' },
      query_config: {},
    };
    jest.spyOn(service, 'getDataFromDataSourceNgsiV2').mockRejectedValue(error);

    await expect(
      service.getDataFromDataSource(queryBatch as never),
    ).rejects.toBe(error);
  });
});
