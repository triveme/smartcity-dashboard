jest.mock(
  'apps/data-translation-service/src/populate/populate-chart.service',
  () => ({ PopulateChartService: class PopulateChartService {} }),
  { virtual: true },
);

import { WidgetService } from './widget.service';

describe('WidgetService export read access', () => {
  const widgetRepo = { getById: jest.fn() };
  const service = Object.assign(Object.create(WidgetService.prototype), {
    widgetRepo,
  }) as WidgetService;
  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(console, 'error').mockImplementation();
  });
  afterEach(() => jest.restoreAllMocks());

  it('allows anonymous access to public widgets without roles', async () => {
    const widget = {
      id: 'widget-1',
      visibility: 'public',
      readRoles: [],
      writeRoles: ['writer'],
    };
    widgetRepo.getById.mockResolvedValue(widget);
    await expect(service.getByIdForExport('widget-1', [])).resolves.toEqual(
      widget,
    );
  });

  it('allows protected-widget readers without requiring write access', async () => {
    const widget = {
      id: 'widget-1',
      visibility: 'protected',
      readRoles: ['reader'],
      writeRoles: ['writer'],
    };
    widgetRepo.getById.mockResolvedValue(widget);
    await expect(
      service.getByIdForExport('widget-1', ['reader']),
    ).resolves.toEqual(widget);
  });

  it.each([{ roles: [] }, { roles: ['unrelated'] }])(
    'rejects protected-widget export with roles $roles',
    async ({ roles }) => {
      widgetRepo.getById.mockResolvedValue({
        id: 'widget-1',
        visibility: 'protected',
        readRoles: ['reader'],
        writeRoles: ['writer'],
      });
      await expect(
        service.getByIdForExport('widget-1', roles),
      ).rejects.toMatchObject({ status: 403 });
    },
  );

  it('rejects missing widgets', async () => {
    widgetRepo.getById.mockResolvedValue(null);
    await expect(
      service.getByIdForExport('widget-1', []),
    ).rejects.toMatchObject({ status: 404 });
  });
});
