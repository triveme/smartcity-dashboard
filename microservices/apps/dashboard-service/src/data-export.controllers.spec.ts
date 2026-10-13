jest.mock('./dashboard/dashboard.service', () => ({
  DashboardService: class DashboardService {},
}));
jest.mock('./widget/widget.service', () => ({
  WidgetService: class WidgetService {},
}));
jest.mock(
  'apps/data-translation-service/src/populate/populate-chart.service',
  () => ({ PopulateChartService: class PopulateChartService {} }),
  { virtual: true },
);

import { AuthGuard } from '@app/auth-helper/AuthGuard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { DashboardController } from './dashboard/dashboard.controller';
import { WidgetController } from './widget/widget.controller';

describe('CSV export controller access checks', () => {
  const request = {
    roles: ['reader'],
    headers: { authorization: 'Bearer caller-token' },
  };
  const dashboardService = { getDashboardWithWidgets: jest.fn() };
  const widgetService = { getByIdForExport: jest.fn() };
  const dashboardDataService = { downloadDashboardData: jest.fn() };
  const widgetDataService = { downloadWidgetData: jest.fn() };
  const dashboardController = new DashboardController(
    dashboardService as never,
    dashboardDataService as never,
  );
  const widgetController = new WidgetController(
    widgetService as never,
    widgetDataService as never,
    {} as never,
  );

  beforeEach(() => {
    jest.resetAllMocks();
    dashboardService.getDashboardWithWidgets.mockResolvedValue({
      allowDataExport: true,
      panels: [{ widgets: [{ id: 'widget-1' }] }],
    });
    widgetService.getByIdForExport.mockResolvedValue({ allowDataExport: true });
    dashboardDataService.downloadDashboardData.mockResolvedValue('csv-data');
    widgetDataService.downloadWidgetData.mockResolvedValue('csv-data');
  });

  it.each([dashboardController, widgetController])(
    'bypasses the broken global JWT verification for export',
    async (controller) => {
      const jwtService = { verifyAsync: jest.fn() };
      const guard = new AuthGuard(
        jwtService as unknown as JwtService,
        new Reflector(),
      );
      const context = {
        getHandler: () => controller.downloadData,
        getClass: () => controller.constructor,
      } as unknown as ExecutionContext;

      await expect(guard.canActivate(context)).resolves.toBe(true);
      expect(jwtService.verifyAsync).not.toHaveBeenCalled();
    },
  );

  it('checks dashboard access with middleware roles before exporting', async () => {
    await expect(
      dashboardController.downloadData(
        'dashboard-1',
        ['widget-1'],
        '{}',
        request as never,
      ),
    ).resolves.toBe('csv-data');

    expect(dashboardService.getDashboardWithWidgets).toHaveBeenCalledWith(
      'dashboard-1',
      ['reader'],
    );
    expect(dashboardDataService.downloadDashboardData).toHaveBeenCalledWith(
      'dashboard-1',
      ['widget-1'],
      {},
    );
  });

  it('checks widget read access with middleware roles before exporting', async () => {
    await expect(
      widgetController.downloadData('widget-1', '{}', request as never),
    ).resolves.toBe('csv-data');

    expect(widgetService.getByIdForExport).toHaveBeenCalledWith('widget-1', [
      'reader',
    ]);
    expect(widgetDataService.downloadWidgetData).toHaveBeenCalledWith(
      'widget-1',
      {},
    );
  });

  it('stops dashboard export when the existing access check rejects', async () => {
    dashboardService.getDashboardWithWidgets.mockRejectedValue(
      new ForbiddenException(),
    );

    await expect(
      dashboardController.downloadData(
        'dashboard-1',
        ['widget-1'],
        '{}',
        request as never,
      ),
    ).rejects.toMatchObject({ status: 403 });
    expect(dashboardDataService.downloadDashboardData).not.toHaveBeenCalled();
  });

  it('stops widget export when the existing access check rejects', async () => {
    widgetService.getByIdForExport.mockRejectedValue(new ForbiddenException());

    await expect(
      widgetController.downloadData('widget-1', '{}', request as never),
    ).rejects.toMatchObject({ status: 403 });
    expect(widgetDataService.downloadWidgetData).not.toHaveBeenCalled();
  });

  it('rejects widget IDs outside the authorized dashboard', async () => {
    await expect(
      dashboardController.downloadData(
        'dashboard-1',
        ['foreign-widget'],
        '{}',
        request as never,
      ),
    ).rejects.toMatchObject({ status: 403 });
    expect(dashboardDataService.downloadDashboardData).not.toHaveBeenCalled();
  });

  it('normalizes a single widget ID before checking membership', async () => {
    await dashboardController.downloadData(
      'dashboard-1',
      'widget-1' as never,
      '{}',
      request as never,
    );

    expect(dashboardDataService.downloadDashboardData).toHaveBeenCalledWith(
      'dashboard-1',
      ['widget-1'],
      {},
    );
  });

  it('rejects dashboard export when disabled', async () => {
    dashboardService.getDashboardWithWidgets.mockResolvedValue({
      allowDataExport: false,
    });

    await expect(
      dashboardController.downloadData(
        'dashboard-1',
        ['widget-1'],
        '{}',
        request as never,
      ),
    ).rejects.toMatchObject({ status: 403 });
    expect(dashboardDataService.downloadDashboardData).not.toHaveBeenCalled();
  });

  it('checks anonymous dashboard read access with empty roles', async () => {
    await dashboardController.downloadData('dashboard-1', ['widget-1'], '{}', {
      headers: {},
      authenticated: false,
    } as never);
    expect(dashboardService.getDashboardWithWidgets).toHaveBeenCalledWith(
      'dashboard-1',
      [],
    );
    expect(dashboardDataService.downloadDashboardData).toHaveBeenCalledWith(
      'dashboard-1',
      ['widget-1'],
      {},
    );
  });

  it('checks anonymous widget read access with empty roles', async () => {
    await widgetController.downloadData('widget-1', '{}', {
      headers: {},
      authenticated: false,
    } as never);
    expect(widgetService.getByIdForExport).toHaveBeenCalledWith('widget-1', []);
    expect(widgetDataService.downloadWidgetData).toHaveBeenCalledWith(
      'widget-1',
      {},
    );
  });

  it('rejects protected dashboards for anonymous callers', async () => {
    dashboardService.getDashboardWithWidgets.mockRejectedValue(
      new ForbiddenException(),
    );
    await expect(
      dashboardController.downloadData('dashboard-1', ['widget-1'], '{}', {
        headers: {},
      } as never),
    ).rejects.toMatchObject({ status: 403 });
    expect(dashboardDataService.downloadDashboardData).not.toHaveBeenCalled();
  });

  it('rejects protected widgets for anonymous callers', async () => {
    widgetService.getByIdForExport.mockRejectedValue(new ForbiddenException());
    await expect(
      widgetController.downloadData('widget-1', '{}', { headers: {} } as never),
    ).rejects.toMatchObject({ status: 403 });
    expect(widgetDataService.downloadWidgetData).not.toHaveBeenCalled();
  });

  it('rejects dashboard export when disabled for anonymous callers', async () => {
    dashboardService.getDashboardWithWidgets.mockResolvedValue({
      allowDataExport: false,
    });

    await expect(
      dashboardController.downloadData('dashboard-1', ['widget-1'], '{}', {
        headers: {},
        authenticated: false,
      } as never),
    ).rejects.toMatchObject({ status: 403 });
    expect(dashboardDataService.downloadDashboardData).not.toHaveBeenCalled();
  });

  it('rejects widget export when disabled', async () => {
    widgetService.getByIdForExport.mockResolvedValue({
      allowDataExport: false,
    });

    await expect(
      widgetController.downloadData('widget-1', '{}', request as never),
    ).rejects.toMatchObject({ status: 403 });
    expect(widgetDataService.downloadWidgetData).not.toHaveBeenCalled();
  });
});
