jest.mock(
  'apps/data-translation-service/src/populate/populate-chart.service',
  () => ({ PopulateChartService: class PopulateChartService {} }),
  { virtual: true },
);

import { NotFoundException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

describe('DashboardService tenant-scoped content', () => {
  const createService = () => {
    const tenantService = {
      getTenantByAbbreviation: jest.fn(async (abbreviation: string) => ({
        id: `tenant-${abbreviation}`,
      })),
    };
    const dashboardRepo = {
      getDashboardWithContent: jest
        .fn()
        .mockResolvedValue([{ dashboard: { id: 'dashboard-1' } }]),
    };
    const dashboard = { id: 'dashboard-1', panels: [] };
    const populateService = {
      reduceRowsToDashboardsWithContent: jest
        .fn()
        .mockResolvedValue([dashboard]),
    };
    const service = new DashboardService(
      {} as never,
      {} as never,
      {} as never,
      tenantService as never,
      {} as never,
      populateService as never,
      dashboardRepo as never,
      {} as never,
      {} as never,
      {} as never,
    );

    return {
      service,
      tenantService,
      dashboardRepo,
      populateService,
      dashboard,
    };
  };

  it.each([
    ['menden', ['menden']],
    ['nfk,buerstadt,menden', ['nfk', 'buerstadt', 'menden']],
    [' nfk, , menden, ', ['nfk', 'menden']],
  ])('loads content for the tenant claim %s', async (claim, abbreviations) => {
    const { service, tenantService, dashboardRepo, dashboard } =
      createService();
    const roles = ['scs-admin'];

    await expect(
      service.getDashboardWithContent('dashboard-1', roles, claim),
    ).resolves.toEqual(dashboard);

    expect(tenantService.getTenantByAbbreviation.mock.calls).toEqual(
      abbreviations.map((abbreviation) => [abbreviation]),
    );
    expect(dashboardRepo.getDashboardWithContent).toHaveBeenCalledWith(
      'dashboard-1',
      abbreviations.map((abbreviation) => `tenant-${abbreviation}`),
      roles,
    );
  });

  it('returns 404 when no allowed dashboard matches', async () => {
    const { service, dashboardRepo, populateService } = createService();
    dashboardRepo.getDashboardWithContent.mockResolvedValue([]);

    await expect(
      service.getDashboardWithContent('dashboard-1', [], 'nfk,menden'),
    ).rejects.toMatchObject({ status: 404 });

    expect(
      populateService.reduceRowsToDashboardsWithContent,
    ).not.toHaveBeenCalled();
  });

  it('does not drop tenant scoping for an empty claim', async () => {
    const { service, tenantService, dashboardRepo } = createService();

    await expect(
      service.getDashboardWithContent('dashboard-1', [], ' , , '),
    ).rejects.toMatchObject({ status: 404 });

    expect(tenantService.getTenantByAbbreviation).not.toHaveBeenCalled();
    expect(dashboardRepo.getDashboardWithContent).not.toHaveBeenCalled();
  });

  it('preserves the error for an unknown tenant', async () => {
    const { service, tenantService, dashboardRepo } = createService();
    tenantService.getTenantByAbbreviation.mockRejectedValue(
      new NotFoundException('Tenant Not Found'),
    );

    await expect(
      service.getDashboardWithContent('dashboard-1', [], 'unknown'),
    ).rejects.toMatchObject({ status: 404 });

    expect(dashboardRepo.getDashboardWithContent).not.toHaveBeenCalled();
  });
});
