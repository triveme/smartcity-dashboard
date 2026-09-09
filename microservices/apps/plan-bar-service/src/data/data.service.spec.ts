import axios from 'axios';
import { PlanBarService } from './data.service';

describe('PlanBarService queued fetch execution', () => {
  afterEach(() => jest.restoreAllMocks());

  it('serializes upstream requests and passes the abort signal to each request', async () => {
    jest.spyOn(console, 'info').mockImplementation();
    const signal = new AbortController().signal;
    let resolveShifts!: (value: { data: [] }) => void;
    const shiftsResponse = new Promise<{ data: [] }>((resolve) => {
      resolveShifts = resolve;
    });
    const get = jest
      .spyOn(axios, 'get')
      .mockImplementationOnce(() => shiftsResponse as any)
      .mockResolvedValueOnce({ data: [] } as any)
      .mockResolvedValueOnce({ data: [] } as any)
      .mockResolvedValueOnce({ data: [] } as any);
    const authService = { getToken: jest.fn().mockResolvedValue('token') };
    const service = new PlanBarService({} as any, authService as any);
    const batch = {
      auth_data: { liveUrl: 'https://example.test' },
      query_config: { entityIds: [] },
    } as any;

    const result = service.getDataFromDataSource(batch, signal);

    await Promise.resolve();
    expect(get).toHaveBeenCalledTimes(1);
    resolveShifts({ data: [] });
    await result;

    expect(get).toHaveBeenCalledTimes(4);
    for (const [, requestConfig] of get.mock.calls) {
      expect(requestConfig).toEqual(expect.objectContaining({ signal }));
    }
  });
});
