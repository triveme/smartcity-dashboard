import { UnauthorizedException } from '@nestjs/common';
import { InternalQueryPopulationController } from './internal-query-population.controller';

describe('InternalQueryPopulationController', () => {
  const ngsiService = {
    enqueueQueryPopulation: jest.fn(),
    getQueuedQueryData: jest.fn(),
  };
  const controller = new InternalQueryPopulationController(
    ngsiService as never,
  );

  beforeEach(() => jest.clearAllMocks());

  it('requires authenticated middleware state for query data', async () => {
    await expect(
      controller.getQueryData('query-id', {}, {
        authenticated: false,
      } as never),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('queues population with the authenticated identity', async () => {
    ngsiService.enqueueQueryPopulation.mockResolvedValue(undefined);

    await expect(
      controller.populateQuery('query-id', {
        authenticated: true,
        roles: ['writer'],
        tenant: 'tenant-a',
      } as never),
    ).resolves.toBeUndefined();

    expect(ngsiService.enqueueQueryPopulation).toHaveBeenCalledWith(
      'query-id',
      ['writer'],
      'tenant-a',
    );
  });

  it('passes the authenticated identity to the queued query-data service', async () => {
    ngsiService.getQueuedQueryData.mockResolvedValue([{ id: 'entity' }]);

    await expect(
      controller.getQueryData('query-id', { timeframe: 'week' }, {
        authenticated: true,
        roles: ['reader'],
        tenant: 'tenant-a',
      } as never),
    ).resolves.toEqual([{ id: 'entity' }]);

    expect(ngsiService.getQueuedQueryData).toHaveBeenCalledWith(
      'query-id',
      { timeframe: 'week' },
      ['reader'],
      'tenant-a',
    );
  });
});
