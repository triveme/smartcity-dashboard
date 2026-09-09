import { UnauthorizedException } from '@nestjs/common';
import { InternalQueryPopulationController as InternalDataController } from './internal-data-service/src/internal-query-population.controller';
import { InternalQueryPopulationController as OrchideoController } from './orchideo-connect-service/src/internal-query-population.controller';
import { InternalQueryPopulationController as PlanBarController } from './plan-bar-service/src/internal-query-population.controller';
import { InternalQueryPopulationController as SqlViewController } from './sql-view-service/src/internal-query-population.controller';
import { InternalQueryPopulationController as UsiController } from './usi-platform-service/src/internal-query-population.controller';

type InternalController = {
  populateQuery(queryId: string, request: never): Promise<void>;
  getQueryData(
    queryId: string,
    overrides: object,
    request: never,
  ): Promise<unknown>;
};

type Platform = {
  name: string;
  create: (service: object) => InternalController;
};

const platforms: Platform[] = [
  {
    name: 'Orchideo',
    create: (service) =>
      new OrchideoController(service as never) as unknown as InternalController,
  },
  {
    name: 'Internal Data',
    create: (service) =>
      new InternalDataController(
        service as never,
      ) as unknown as InternalController,
  },
  {
    name: 'USI',
    create: (service) =>
      new UsiController(service as never) as unknown as InternalController,
  },
  {
    name: 'SQL View',
    create: (service) =>
      new SqlViewController(service as never) as unknown as InternalController,
  },
  {
    name: 'PlanBar',
    create: (service) =>
      new PlanBarController(service as never) as unknown as InternalController,
  },
];

describe.each(platforms)('$name internal query endpoints', ({ create }) => {
  const service = {
    enqueueQueryPopulation: jest.fn(),
    getQueuedQueryData: jest.fn(),
  };
  const controller = create(service);

  beforeEach(() => jest.clearAllMocks());

  it('rejects unauthenticated population requests', async () => {
    await expect(
      controller.populateQuery('query-id', { authenticated: false } as never),
    ).rejects.toThrow(UnauthorizedException);

    expect(service.enqueueQueryPopulation).not.toHaveBeenCalled();
  });

  it('queues population with the caller identity', async () => {
    service.enqueueQueryPopulation.mockResolvedValue(undefined);

    await expect(
      controller.populateQuery('query-id', {
        authenticated: true,
        roles: ['writer'],
        tenant: 'tenant-a',
      } as never),
    ).resolves.toBeUndefined();

    expect(service.enqueueQueryPopulation).toHaveBeenCalledWith(
      'query-id',
      ['writer'],
      'tenant-a',
    );
  });

  it('waits for queued interactive query data and returns its result', async () => {
    let resolveResult!: (value: object[]) => void;
    service.getQueuedQueryData.mockImplementation(
      () =>
        new Promise<object[]>((resolve) => {
          resolveResult = resolve;
        }),
    );

    const result = controller.getQueryData('query-id', { timeframe: 'week' }, {
      authenticated: true,
      roles: ['reader'],
      tenant: 'tenant-a',
    } as never);

    expect(service.getQueuedQueryData).toHaveBeenCalledWith(
      'query-id',
      { timeframe: 'week' },
      ['reader'],
      'tenant-a',
    );
    resolveResult([{ id: 'entity-1' }]);
    await expect(result).resolves.toEqual([{ id: 'entity-1' }]);
  });

  it('preserves queued query-data errors', async () => {
    const error = new Error('upstream failed');
    service.getQueuedQueryData.mockRejectedValue(error);

    await expect(
      controller.getQueryData('query-id', {}, { authenticated: true } as never),
    ).rejects.toBe(error);
  });
});
