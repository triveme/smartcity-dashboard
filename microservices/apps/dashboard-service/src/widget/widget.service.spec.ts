jest.mock(
  'apps/data-translation-service/src/populate/populate-chart.service',
  () => ({ PopulateChartService: class PopulateChartService {} }),
  { virtual: true },
);

import { WidgetService } from './widget.service';

const createService = () => {
  const selectWhere = jest
    .fn()
    .mockResolvedValueOnce([{ id: 'source-1', authDataId: 'auth-1' }])
    .mockResolvedValueOnce([{ id: 'auth-1', type: 'ngsi-ld' }]);
  const db = {
    transaction: jest.fn(
      async (callback: (transaction: unknown) => Promise<unknown>) =>
        callback({}),
    ),
    select: jest.fn(() => ({
      from: jest.fn(() => ({ where: selectWhere })),
    })),
  };
  const tabService = {
    create: jest.fn(),
    update: jest.fn(),
    handleSpecialTabs: jest.fn().mockResolvedValue(undefined),
  };
  const queryConfigService = {
    create: jest.fn(),
    update: jest.fn(),
  };
  const widgetDataService = {
    runQueryDataPopulation: jest.fn().mockResolvedValue(undefined),
  };
  const widgetRepo = { getByIds: jest.fn().mockResolvedValue([]) };
  const tenantRepo = {
    getTenantByAbbreviation: jest.fn().mockResolvedValue({ id: 'tenant-1' }),
  };
  const service = new WidgetService(
    db as never,
    widgetRepo as never,
    {} as never,
    {} as never,
    {} as never,
    tabService as never,
    {} as never,
    queryConfigService as never,
    {} as never,
    {} as never,
    {} as never,
    {} as never,
    tenantRepo as never,
    {} as never,
    {} as never,
    widgetDataService as never,
  );

  return {
    service,
    queryConfigService,
    tabService,
    widgetDataService,
    widgetRepo,
    tenantRepo,
    selectWhere,
  };
};

describe('WidgetService tenant widgets', () => {
  it('returns an empty array when the tenant has no widget associations', async () => {
    const { service, selectWhere, widgetRepo } = createService();
    selectWhere.mockReset().mockResolvedValue([]);

    await expect(
      service.getWidgetsByTenantAbbreviation('tenant-a'),
    ).resolves.toEqual([]);
    expect(widgetRepo.getByIds).not.toHaveBeenCalled();
  });

  it('returns an empty array when associated widgets no longer exist', async () => {
    const { service, selectWhere } = createService();
    selectWhere.mockReset().mockResolvedValue([{ widgetId: 'widget-1' }]);

    await expect(
      service.getWidgetsByTenantAbbreviation('tenant-a'),
    ).resolves.toEqual([]);
  });

  it('returns the widgets associated with the tenant', async () => {
    const { service, selectWhere, widgetRepo } = createService();
    const widgets = [{ id: 'widget-1' }];
    selectWhere.mockReset().mockResolvedValue([{ widgetId: 'widget-1' }]);
    widgetRepo.getByIds.mockResolvedValue(widgets);

    await expect(
      service.getWidgetsByTenantAbbreviation('tenant-a'),
    ).resolves.toEqual(widgets);
    expect(widgetRepo.getByIds).toHaveBeenCalledWith(['widget-1']);
  });

  it('preserves the 404 for a missing tenant', async () => {
    const { service, tenantRepo } = createService();
    tenantRepo.getTenantByAbbreviation.mockResolvedValue(undefined);

    await expect(
      service.getWidgetsByTenantAbbreviation('missing-tenant'),
    ).rejects.toMatchObject({
      message: 'Tenant not found',
      status: 404,
    });
  });
});

describe('WidgetService initial platform population', () => {
  beforeEach(() => jest.spyOn(console, 'error').mockImplementation());
  afterEach(() => jest.restoreAllMocks());

  const createPayload = () =>
    ({
      widget: { id: 'widget-1' },
      tab: {
        id: 'tab-1',
        componentType: 'Chart',
        componentSubType: 'Line',
      },
      queryConfig: { id: 'config-1', dataSourceId: 'source-1' },
    }) as never;

  it('dispatches one authenticated population request after widget creation', async () => {
    const { service, queryConfigService, tabService, widgetDataService } =
      createService();
    jest
      .spyOn(service, 'create')
      .mockResolvedValue({ id: 'widget-1' } as never);
    queryConfigService.create.mockResolvedValue({ queryId: 'query-1' });
    tabService.create.mockResolvedValue({ id: 'tab-1' });

    await service.createWithChildren(
      createPayload(),
      ['writer'],
      'tenant-a',
      'Bearer caller-token',
    );

    expect(widgetDataService.runQueryDataPopulation).toHaveBeenCalledTimes(1);
    expect(widgetDataService.runQueryDataPopulation).toHaveBeenCalledWith(
      'query-1',
      'ngsi-ld',
      'Bearer caller-token',
    );
  });

  it('dispatches one authenticated population request after widget update', async () => {
    const { service, queryConfigService, tabService, widgetDataService } =
      createService();
    jest
      .spyOn(service, 'update')
      .mockResolvedValue({ id: 'widget-1' } as never);
    tabService.update.mockResolvedValue({ id: 'tab-1' });
    queryConfigService.update.mockResolvedValue({
      id: 'config-1',
      dataSourceId: 'source-1',
    });
    const payload = createPayload() as {
      widget: object;
      tab: { id: string; queryId?: string };
      queryConfig: { id: string; dataSourceId: string };
    };
    payload.tab.queryId = 'query-1';

    await service.updateWithChildren(
      'widget-1',
      payload as never,
      ['writer'],
      'tenant-a',
      'Bearer caller-token',
    );

    expect(widgetDataService.runQueryDataPopulation).toHaveBeenCalledTimes(1);
    expect(widgetDataService.runQueryDataPopulation).toHaveBeenCalledWith(
      'query-1',
      'ngsi-ld',
      'Bearer caller-token',
    );
  });
});
