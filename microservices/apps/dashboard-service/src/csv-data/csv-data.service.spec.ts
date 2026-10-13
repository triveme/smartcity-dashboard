import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { POSTGRES_DB } from '@app/postgres-db';
import { DataPlatformQueue } from '@app/data-platform-queue';
import { CsvDataModule } from './csv-data.module';
import { CsvDataService } from './csv-data.service';

@Global()
@Module({
  providers: [
    { provide: POSTGRES_DB, useValue: {} },
    { provide: ConfigService, useValue: { get: jest.fn() } },
  ],
  exports: [POSTGRES_DB, ConfigService],
})
class CsvTestDependenciesModule {}

describe('CsvDataService direct source fetching', () => {
  const ngsi = { getDataFromDataSource: jest.fn() };
  const orchideo = {
    getDataFromDataSource: jest.fn(),
    getSystemUserForTenant: jest.fn(),
  };
  const orchideoConnect = { transformToTargetModel: jest.fn() };
  const internal = { getDataFromDataSource: jest.fn() };
  const planbar = { getDataFromDataSource: jest.fn() };
  const sql = { getDataFromDataSource: jest.fn() };
  const usi = { getSensorData: jest.fn() };
  const service = new CsvDataService(
    ngsi as never,
    orchideo as never,
    orchideoConnect as never,
    internal as never,
    planbar as never,
    sql as never,
    usi as never,
  );
  const createBatch = (type: string) => ({
    queryIds: ['query-1'],
    query_config: {
      id: 'config-1',
      hash: 'hash-1',
      dataSourceId: 'source-1',
      attributes: ['temperature'],
      timeframe: 'month',
    },
    data_source: { id: 'source-1' },
    auth_data: { id: 'auth-1', type, tenantAbbreviation: 'menden' },
  });

  beforeEach(() => {
    jest.resetAllMocks();
    for (const source of [ngsi, orchideo, internal, planbar, sql])
      source.getDataFromDataSource.mockResolvedValue({ value: 1 });
    usi.getSensorData.mockResolvedValue({ value: 1 });
  });

  it.each(['ngsi', 'ngsi-ld', 'ngsi-v2'])(
    'fetches %s with stored source credentials and no user token',
    async (type) => {
      const batch = createBatch(type);
      await expect(service.getData(batch as never)).resolves.toEqual({
        value: 1,
      });
      expect(ngsi.getDataFromDataSource).toHaveBeenCalledWith({
        ...batch,
        queryConfigSnapshot: { id: 'config-1', hash: 'hash-1' },
      });
    },
  );

  it.each([
    ['internal', internal],
    ['planbar', planbar],
    ['sql', sql],
  ])('fetches %s directly with the configured source', async (type, source) => {
    const batch = createBatch(type as string);
    await expect(service.getData(batch as never)).resolves.toEqual({
      value: 1,
    });
    expect(
      (source as typeof internal).getDataFromDataSource,
    ).toHaveBeenCalledWith(batch);
  });

  it('fetches USI directly using the existing sensor-data service', async () => {
    const batch = createBatch('usi');
    await expect(service.getData(batch as never)).resolves.toEqual({
      value: 1,
    });
    expect(usi.getSensorData).toHaveBeenCalledWith(batch.query_config);
  });

  it('uses the tenant system user and existing transformation for Orchideo', async () => {
    const batch = createBatch('api');
    const systemUser = { username: 'source-user', password: 'stored-password' };
    orchideo.getSystemUserForTenant.mockResolvedValue(systemUser);
    orchideo.getDataFromDataSource.mockResolvedValue([
      { id: 'sensor-1', temperature: 12 },
    ]);
    orchideoConnect.transformToTargetModel.mockReturnValue({
      entityId: 'sensor-1',
    });
    await expect(service.getData(batch as never)).resolves.toEqual({
      entityId: 'sensor-1',
    });
    expect(orchideo.getSystemUserForTenant).toHaveBeenCalledWith('menden');
    expect(orchideo.getDataFromDataSource).toHaveBeenCalledWith({
      ...batch,
      queryConfigSnapshot: { id: 'config-1', hash: 'hash-1' },
      system_user: systemUser,
    });
    expect(orchideoConnect.transformToTargetModel).toHaveBeenCalledWith([
      { id: 'sensor-1', temperature: 12 },
    ]);
  });

  it('rejects missing Orchideo system users without fetching', async () => {
    orchideo.getSystemUserForTenant.mockResolvedValue(null);
    await expect(service.getData(createBatch('api') as never)).rejects.toThrow(
      'No system user',
    );
    expect(orchideo.getDataFromDataSource).not.toHaveBeenCalled();
  });

  it('rejects unsupported sources', async () => {
    await expect(
      service.getData(createBatch('unsupported') as never),
    ).rejects.toThrow('not supported');
    expect(ngsi.getDataFromDataSource).not.toHaveBeenCalled();
  });

  it('propagates source failures', async () => {
    ngsi.getDataFromDataSource.mockRejectedValue(
      new Error('source unavailable'),
    );
    await expect(
      service.getData(createBatch('ngsi-ld') as never),
    ).rejects.toThrow('source unavailable');
  });

  it('resolves all actual source-service dependencies without new configuration', async () => {
    const module = await Test.createTestingModule({
      imports: [CsvTestDependenciesModule, CsvDataModule],
    }).compile();
    try {
      expect(module.get(CsvDataService)).toBeInstanceOf(CsvDataService);
      const queue = module.get(DataPlatformQueue);
      const queueSpy = jest.spyOn(queue, 'enqueue');
      const actualService = module.get(CsvDataService);
      await expect(
        actualService.getData(createBatch('unsupported') as never),
      ).rejects.toThrow('not supported');
      expect(queueSpy).not.toHaveBeenCalled();
    } finally {
      await module.close();
    }
  });
});
