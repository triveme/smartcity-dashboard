import { drizzle } from 'drizzle-orm/node-postgres';
import { DashboardRepo } from './dashboard.repo';

describe('DashboardRepo tenant-scoped content', () => {
  it.each([['tenant-menden'], ['tenant-nfk', 'tenant-menden']])(
    'keeps tenant and role restrictions for %j',
    async (...tenantIds: string[]) => {
      const query = jest.fn().mockResolvedValue({ rows: [] });
      const repo = new DashboardRepo(drizzle({ query } as never));

      await expect(
        repo.getDashboardWithContent('dashboard-1', tenantIds, ['scs-admin']),
      ).resolves.toEqual([]);

      const [config, parameters] = query.mock.calls[0];
      expect(config.text).toContain(
        '"dashboard"."id" in (select "dashboard_id" from "dashboard_to_tenant"',
      );
      expect(config.text).toContain('"dashboard_to_tenant"."tenant_id" in (');
      expect(config.text).toContain('"dashboard"."visibility" =');
      expect(config.text).toContain('"dashboard"."read_roles" &&');
      expect(config.text).toContain('"dashboard"."write_roles" &&');
      expect(parameters).toEqual([
        'dashboard-1',
        ...tenantIds,
        'public',
        '{scs-admin}',
        '{scs-admin}',
      ]);
    },
  );
});
