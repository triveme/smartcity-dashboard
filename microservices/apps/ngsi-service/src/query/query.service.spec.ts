import { Logger } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { QueryService } from './query.service';

const createDb = (updatedQueryIds: string[]) => {
  const returning = jest
    .fn()
    .mockResolvedValue(updatedQueryIds.map((id) => ({ id })));
  const updateWhere = jest.fn().mockReturnValue({ returning });
  const set = jest.fn().mockReturnValue({ where: updateWhere });
  const update = jest.fn().mockReturnValue({ set });
  const selectWhere = jest.fn().mockReturnValue({
    getSQL: () => sql`select 1`,
  });
  const selectFrom = jest.fn().mockReturnValue({ where: selectWhere });
  const select = jest.fn().mockReturnValue({ from: selectFrom });

  return { db: { update, select }, updateWhere, returning };
};

const batch = {
  queryIds: ['query-1'],
  queryConfigSnapshot: { id: 'config-1', hash: 'hash-before-update' },
} as any;

describe('QueryService stale queued result protection', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('persists a result when the query configuration snapshot is unchanged', async () => {
    const { db, returning } = createDb(['query-1']);
    const service = new QueryService(db as any);

    await service.setQueryDataOfBatch(batch, { attrs: [] });

    expect(returning).toHaveBeenCalledWith({ id: expect.anything() });
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('discards a result when the query configuration hash changed after queueing', async () => {
    const { db, returning } = createDb([]);
    const service = new QueryService(db as any);

    await service.setQueryDataOfBatch(batch, { attrs: [] });

    expect(returning).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      'Discarded stale query result for configuration config-1',
    );
  });
});
