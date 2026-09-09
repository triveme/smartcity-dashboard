import axios from 'axios';
import { PlatformInternalClientService } from './platform-internal.client.service';

describe('PlatformInternalClientService', () => {
  const urls: Record<string, string> = {
    NGSI_SERVICE_BASE_URL: 'http://ngsi',
    ORCHIDEO_CONNECT_SERVICE_BASE_URL: 'http://orchideo',
    INTERNAL_DATA_SERVICE_BASE_URL: 'http://internal',
    USI_PLATFORM_SERVICE_BASE_URL: 'http://usi',
    SQL_VIEW_SERVICE_BASE_URL: 'http://sql',
    PLAN_BAR_SERVICE_BASE_URL: 'http://planbar',
  };
  const configService = { get: jest.fn((key: string) => urls[key]) };
  const service = new PlatformInternalClientService(configService as never);

  beforeEach(() => jest.restoreAllMocks());

  it.each([
    ['ngsi', 'http://ngsi'],
    ['ngsi-ld', 'http://ngsi'],
    ['ngsi-v2', 'http://ngsi'],
    ['api', 'http://orchideo'],
    ['internal', 'http://internal'],
    ['usi', 'http://usi'],
    ['sql', 'http://sql'],
    ['planbar', 'http://planbar'],
  ])('routes %s query data and forwards authorization', async (type, url) => {
    const post = jest
      .spyOn(axios, 'post')
      .mockResolvedValue({ data: ['data'] });

    await expect(
      service.getQueryData(type, 'query-id', 'Bearer caller-token', {
        timeframe: 'week',
      }),
    ).resolves.toEqual(['data']);

    expect(post).toHaveBeenCalledWith(
      `${url}/internal/query-data`,
      { queryId: 'query-id', overrides: { timeframe: 'week' } },
      { headers: { Authorization: 'Bearer caller-token' } },
    );
  });

  it.each([
    ['ngsi', 'http://ngsi'],
    ['ngsi-ld', 'http://ngsi'],
    ['ngsi-v2', 'http://ngsi'],
    ['api', 'http://orchideo'],
    ['internal', 'http://internal'],
    ['usi', 'http://usi'],
    ['sql', 'http://sql'],
    ['planbar', 'http://planbar'],
  ])(
    'routes %s population to its platform with caller authorization',
    async (type, url) => {
      const post = jest
        .spyOn(axios, 'post')
        .mockResolvedValue({ data: undefined });

      await expect(
        service.enqueueQueryPopulation(type, 'query-id', [
          'Bearer caller-token',
        ]),
      ).resolves.toBeUndefined();

      expect(post).toHaveBeenCalledWith(
        `${url}/internal/query-populations`,
        { queryId: 'query-id' },
        { headers: { Authorization: 'Bearer caller-token' } },
      );
    },
  );

  it('does not call a platform without caller authorization', async () => {
    const post = jest.spyOn(axios, 'post');

    await expect(
      service.getQueryData('ngsi', 'query-id', undefined),
    ).rejects.toThrow('Missing Authorization header');

    expect(post).not.toHaveBeenCalled();
  });
});
