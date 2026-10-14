import { HttpService } from '@nestjs/axios';
import axios, { InternalAxiosRequestConfig } from 'axios';
import { EncryptionUtil } from '../../dashboard-service/src/util/encryption.util';
import { DataService } from './data/data.service';
import { FiwareWizardService } from './fiware-wizard/fiware-wizard.service';

describe('NGSI-LD context headers', () => {
  const entitiesUrl = 'http://broker.test/ngsi-ld/v1/entities';
  const contextUrl = 'http://context.test/context.jsonld';
  const contextLink = `<${contextUrl}>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"`;
  const entity = {
    id: 'entity-1',
    type: 'ParkingGroup',
    name: { type: 'Property', value: 'Parking' },
    totalSpotNumber: { type: 'Property', value: 10 },
  };
  const historicEntity = {
    id: entity.id,
    type: entity.type,
    totalSpotNumber: [
      { type: 'Property', value: 10, observedAt: '2026-10-14T08:40:00Z' },
    ],
  };
  const originalAdapter = axios.defaults.adapter;
  let wizardService: FiwareWizardService;
  let dataService: DataService;
  let adapter: jest.Mock;

  beforeEach(() => {
    adapter = jest.fn(async (config: InternalAxiosRequestConfig) => {
      let data: object;
      const url = new URL(config.url);

      if (config.method === 'post') {
        data = { access_token: 'token' };
      } else if (url.pathname.endsWith('/types')) {
        data = { typeList: [entity.type] };
      } else if (url.pathname.endsWith('/types/ParkingGroup')) {
        data = { attributeDetails: [{ attributeName: 'totalSpotNumber' }] };
      } else if (url.pathname.includes('/temporal/entities')) {
        data = historicEntity;
      } else if (url.pathname.endsWith('/entities/entity-1')) {
        data = entity;
      } else {
        data = [entity];
      }

      return { data, status: 200, statusText: 'OK', headers: {}, config };
    });
    axios.defaults.adapter = adapter;
    jest.spyOn(EncryptionUtil, 'decryptPassword').mockReturnValue('secret');
    wizardService = new FiwareWizardService(
      {} as never,
      new HttpService(),
      {} as never,
    );
    jest
      .spyOn(wizardService, 'getDataSourceById')
      .mockResolvedValue({ authDataId: 'auth-1' } as never);
    jest.spyOn(wizardService, 'getAuthDataById').mockResolvedValue({
      liveUrl: entitiesUrl,
      authUrl: 'http://auth.test/token',
      ngsildTenant: 'tenant',
      ngsildContextUrl: contextUrl,
    } as never);
    dataService = new DataService({} as never, {} as never);
  });

  afterEach(() => {
    axios.defaults.adapter = originalAdapter;
    jest.restoreAllMocks();
  });

  const expectContextHeaders = (requestCount: number): void => {
    const requests = adapter.mock.calls
      .map(([config]) => config as InternalAxiosRequestConfig)
      .filter((config) => config.method === 'get');

    expect(requests).toHaveLength(requestCount);
    for (const request of requests) {
      expect(request.headers.get('Link')).toBe(contextLink);
      expect(request.headers.get('NGSILD-Tenant')).toBe('tenant');
      expect(request.headers.get('Authorization')).toBe('Bearer token');
    }
  };

  const createQueryBatch = (timeframe: string, isBlacklist = false) => ({
    queryIds: ['query-1'],
    data_source: { id: 'source-1' },
    auth_data: {
      liveUrl: entitiesUrl,
      timeSeriesUrl: entitiesUrl,
      ngsildTenant: 'tenant',
      ngsildContextUrl: contextUrl,
    },
    query_config: {
      id: 'query-1',
      timeframe,
      fiwareType: entity.type,
      entityIds: isBlacklist ? ['excluded-entity'] : [entity.id],
      attributes: ['totalSpotNumber'],
      aggrMode: 'none',
      isBlacklist,
    },
  });

  it('preserves the context header when fetching types', async () => {
    await expect(
      wizardService.getTypesNgsiLd('default', 'source-1', []),
    ).resolves.toEqual([entity.type]);

    expectContextHeaders(1);
  });

  it('preserves the context header when fetching sensors', async () => {
    await expect(
      wizardService.getEntityIdsNgsiLd('default', 'source-1', [], entity.type),
    ).resolves.toEqual([entity.id]);

    expectContextHeaders(1);
  });

  it('preserves the context header when fetching attributes', async () => {
    await expect(
      wizardService.getEntityAttributesNgsiLd(
        'default',
        'source-1',
        [],
        [entity.type],
      ),
    ).resolves.toEqual(['totalSpotNumber']);

    expectContextHeaders(1);
  });

  it.each(['live', 'day'])(
    'preserves the context header when fetching %s data',
    async (timeframe) => {
      await expect(
        dataService.getDataFromDataSourceNgsiLd(
          createQueryBatch(timeframe) as never,
          'token',
        ),
      ).resolves.toEqual(timeframe === 'live' ? [entity] : historicEntity);

      expectContextHeaders(1);
    },
  );

  it.each(['live', 'day'])(
    'preserves the context header for %s blacklist queries',
    async (timeframe) => {
      await expect(
        dataService.getDataFromDataSourceNgsiLd(
          createQueryBatch(timeframe, true) as never,
          'token',
        ),
      ).resolves.toEqual(timeframe === 'live' ? [entity] : historicEntity);

      expectContextHeaders(timeframe === 'live' ? 1 : 2);
    },
  );

  it('preserves the context header for historic data and static names', async () => {
    const queryBatch = createQueryBatch('day');
    queryBatch.query_config.attributes.push('name');

    await expect(
      dataService.getDataFromDataSourceNgsiLd(queryBatch as never, 'token'),
    ).resolves.toEqual({ ...historicEntity, name: entity.name });

    expectContextHeaders(2);
  });
});
