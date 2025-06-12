import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DashboardServiceModule } from '../../dashboard-service.module';
import {
  runLocalDatabasePreparation,
  truncateTables,
} from '../../../../test/database-operations/prepare-database';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { Client } from 'pg';
import { createDashboardByObject, getDashboard } from './test-data';
import { createPanelByObject, getPanel } from '../../panel/test/test-data';
import { createWidgetByObject, getWidget } from '../../widget/test/test-data';
import { createTab, getTab } from '../../tab/test/test-data';
import {
  createQuery,
  getAPIQuery,
  getNGSIHistoricMultipleEntityQuery,
  getNGSILiveQuery,
} from '../../query/test/test-data';
import {
  createDashboardToTenant,
  createTenantByObject,
  getTenant,
} from '../../tenant/test/test-data';
import { generateJWTToken } from '../../../../test/jwt-token-util';

xdescribe('DashboardServiceControllers (e2e)', () => {
  let app: INestApplication;
  let client: Client;
  let db: DbType;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DashboardServiceModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    client = await runLocalDatabasePreparation();
    db = module.get<DbType>(POSTGRES_DB);
  });

  let JWTToken = null;

  beforeEach(async () => {
    JWTToken = await generateJWTToken(
      process.env.KEYCLOAK_CLIENT_ID,
      process.env.KEYCLOAK_CLIENT_SECRET,
    );

    await truncateTables(client);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Dashboards with content', () => {
    it('/dashboards/:id?includeContent=true (GET) bar chart', async () => {
      const query = await createQuery(db, getNGSIHistoricMultipleEntityQuery());
      const dashboard = await createDashboardByObject(db, getDashboard());
      const panel = await createPanelByObject(db, getPanel(dashboard.id));
      const widget = await createWidgetByObject(
        db,
        getWidget([], []),
        panel.id,
      );

      await createTab(
        db,
        await getTab(db, widget.id, null, null, null, query.id),
      );

      const tenant = await createTenantByObject(db, getTenant());
      await createDashboardToTenant(db, dashboard.id, tenant.id);

      const response = await request(app.getHttpServer())
        .get(
          '/dashboards/url/' +
            dashboard.url +
            '?abbreviation=' +
            tenant.abbreviation,
        )
        .set('Authorization', `Bearer ${JWTToken}`);

      const result = response.body;

      validateDashboardContent(result);
      expect(
        result.panels[0].widgets[0].tabs[0].chartData.length,
      ).toBeGreaterThan(0);
    });

    it('/dashboards/:id?includeContent=true (GET) without authorization bar chart', async () => {
      const query = await createQuery(db, getAPIQuery());
      const dashboard = await createDashboardByObject(db, getDashboard());
      const panel = await createPanelByObject(db, getPanel(dashboard.id));
      const widget = await createWidgetByObject(
        db,
        getWidget([], []),
        panel.id,
      );
      await createTab(
        db,
        await getTab(db, widget.id, null, null, null, query.id),
      );

      const tenant = await createTenantByObject(db, getTenant());
      await createDashboardToTenant(db, dashboard.id, tenant.id);

      const response = await request(app.getHttpServer())
        .get(
          '/dashboards/url/' +
            dashboard.url +
            '?abbreviation=' +
            tenant.abbreviation,
        )
        .expect(200);

      const result = response.body;

      validateDashboardContent(result);
      expect(result.panels[0].widgets[0].tabs[0].chartData.length).toBe(0);
    });

    it('/dashboards?includeContent=true (GET)', async () => {
      const query1 = await createQuery(db, getAPIQuery());
      const dashboard1 = await createDashboardByObject(db, getDashboard());
      const panel1 = await createPanelByObject(db, getPanel(dashboard1.id));
      const widget1 = await createWidgetByObject(
        db,
        getWidget([], []),
        panel1.id,
      );
      await createTab(
        db,
        await getTab(db, widget1.id, null, null, null, query1.id),
      );

      const query2 = await createQuery(db, getAPIQuery());
      const dashboard2 = await createDashboardByObject(db, getDashboard());
      const panel2 = await createPanelByObject(db, getPanel(dashboard2.id));
      const widget2 = await createWidgetByObject(
        db,
        getWidget([], []),
        panel2.id,
      );
      await createTab(
        db,
        await getTab(db, widget2.id, null, null, null, query2.id),
      );

      const response = await request(app.getHttpServer())
        .get('/dashboards?includeContent=true')
        .set('Authorization', `Bearer ${JWTToken}`);

      const result = response.body;

      validateDashboardContent(result[0]);
      validateDashboardContent(result[1]);
    });

    it('/dashboards?includeContent=true (GET) without authorization', async () => {
      const query1 = await createQuery(db, getAPIQuery());
      const dashboard1 = await createDashboardByObject(db, getDashboard());
      const panel1 = await createPanelByObject(db, getPanel(dashboard1.id));
      const widget1 = await createWidgetByObject(
        db,
        getWidget([], []),
        panel1.id,
      );
      await createTab(
        db,
        await getTab(db, widget1.id, null, null, null, query1.id),
      );

      const query2 = await createQuery(db, getAPIQuery());
      const dashboard2 = await createDashboardByObject(db, getDashboard());
      const panel2 = await createPanelByObject(db, getPanel(dashboard2.id));
      const widget2 = await createWidgetByObject(
        db,
        getWidget([], []),
        panel2.id,
      );
      await createTab(
        db,
        await getTab(db, widget2.id, null, null, null, query2.id),
      );

      const response = await request(app.getHttpServer()).get(
        '/dashboards?includeContent=true',
      );

      const result = response.body;

      validateDashboardContent(result[0]);
      validateDashboardContent(result[1]);
    });

    it('/dashboard/tenant/:abbreviation?includeContent=true (GET)', async () => {
      const tenant = await createTenantByObject(db, getTenant());
      const query = await createQuery(db, getAPIQuery());
      const dashboard = await createDashboardByObject(db, getDashboard());
      const panel = await createPanelByObject(db, getPanel(dashboard.id));
      const widget = await createWidgetByObject(
        db,
        getWidget([], []),
        panel.id,
      );
      await createTab(
        db,
        await getTab(db, widget.id, null, null, null, query.id),
      );
      await createDashboardToTenant(db, dashboard.id, tenant.id);

      const response = await request(app.getHttpServer())
        .get(`/dashboards/tenant/${tenant.abbreviation}?includeContent=true`)
        .set('Authorization', `Bearer ${JWTToken}`);

      const result = response.body;

      validateDashboardContent(result[0]);
    });

    it('/dashboards/:id?includeContent=true (GET) line chart', async () => {
      const query = await createQuery(db, getNGSIHistoricMultipleEntityQuery());
      const dashboard = await createDashboardByObject(db, getDashboard());
      const panel = await createPanelByObject(db, getPanel(dashboard.id));
      const widget = await createWidgetByObject(
        db,
        getWidget([], []),
        panel.id,
      );
      await createTab(
        db,
        await getTab(db, widget.id, 'Diagramm', 'Linien Chart', null, query.id),
      );

      const tenant = await createTenantByObject(db, getTenant());
      await createDashboardToTenant(db, dashboard.id, tenant.id);

      const response = await request(app.getHttpServer())
        .get(
          '/dashboards/url/' +
            dashboard.url +
            '?abbreviation=' +
            tenant.abbreviation,
        )
        .set('Authorization', `Bearer ${JWTToken}`);

      const result = response.body;

      validateDashboardContent(result);
      expect(
        result.panels[0].widgets[0].tabs[0].chartData.length,
      ).toBeGreaterThan(0);
    });

    it('/dashboards/:id?includeContent=true (GET) measurement', async () => {
      const query = await createQuery(db, getNGSIHistoricMultipleEntityQuery());
      const dashboard = await createDashboardByObject(db, getDashboard());
      const panel = await createPanelByObject(db, getPanel(dashboard.id));
      const widget = await createWidgetByObject(
        db,
        getWidget([], []),
        panel.id,
      );
      await createTab(
        db,
        await getTab(db, widget.id, 'Diagramm', 'Measurement', null, query.id),
      );

      const tenant = await createTenantByObject(db, getTenant());
      await createDashboardToTenant(db, dashboard.id, tenant.id);

      const response = await request(app.getHttpServer())
        .get(
          '/dashboards/url/' +
            dashboard.url +
            '?abbreviation=' +
            tenant.abbreviation,
        )
        .set('Authorization', `Bearer ${JWTToken}`);

      const result = response.body;

      validateDashboardContent(result);
      expect(
        result.panels[0].widgets[0].tabs[0].chartData.length,
      ).toBeGreaterThan(0);
    });

    it('/dashboards/:id?includeContent=true (GET) colored slider', async () => {
      const query = await createQuery(db, getNGSIHistoricMultipleEntityQuery());
      const dashboard = await createDashboardByObject(db, getDashboard());
      const panel = await createPanelByObject(db, getPanel(dashboard.id));
      const widget = await createWidgetByObject(
        db,
        getWidget([], []),
        panel.id,
      );

      await createTab(
        db,
        await getTab(
          db,
          widget.id,
          'Diagramm',
          'Farbiger Slider',
          null,
          query.id,
        ),
      );

      const tenant = await createTenantByObject(db, getTenant());
      await createDashboardToTenant(db, dashboard.id, tenant.id);

      const response = await request(app.getHttpServer())
        .get(
          '/dashboards/url/' +
            dashboard.url +
            '?abbreviation=' +
            tenant.abbreviation,
        )
        .set('Authorization', `Bearer ${JWTToken}`);

      const result = response.body;

      validateDashboardContent(result);
      expect(
        result.panels[0].widgets[0].tabs[0].chartData.length,
      ).toBeGreaterThan(0);
    });

    it('/dashboards/:id?includeContent=true (GET) pie chart', async () => {
      const query = await createQuery(db, getNGSILiveQuery());
      const dashboard = await createDashboardByObject(db, getDashboard());
      const panel = await createPanelByObject(db, getPanel(dashboard.id));
      const widget = await createWidgetByObject(
        db,
        getWidget([], []),
        panel.id,
      );
      await createTab(
        db,
        await getTab(db, widget.id, 'Diagramm', 'Pie Chart', null, query.id),
      );

      const tenant = await createTenantByObject(db, getTenant());
      await createDashboardToTenant(db, dashboard.id, tenant.id);

      const response = await request(app.getHttpServer())
        .get(
          '/dashboards/url/' +
            dashboard.url +
            '?abbreviation=' +
            tenant.abbreviation,
        )
        .set('Authorization', `Bearer ${JWTToken}`);

      const result = response.body;

      validateDashboardContent(result);
      expect(
        result.panels[0].widgets[0].tabs[0].chartValues.length,
      ).toBeGreaterThan(0);
    });

    it('/dashboards/:id?includeContent=true (GET) stageable chart', async () => {
      const query = await createQuery(db, getNGSILiveQuery());
      const dashboard = await createDashboardByObject(db, getDashboard());
      const panel = await createPanelByObject(db, getPanel(dashboard.id));
      const widget = await createWidgetByObject(
        db,
        getWidget([], []),
        panel.id,
      );
      await createTab(
        db,
        await getTab(
          db,
          widget.id,
          'Diagramm',
          'Stageable Chart',
          null,
          query.id,
        ),
      );

      const tenant = await createTenantByObject(db, getTenant());
      await createDashboardToTenant(db, dashboard.id, tenant.id);

      const response = await request(app.getHttpServer())
        .get(
          '/dashboards/url/' +
            dashboard.url +
            '?abbreviation=' +
            tenant.abbreviation,
        )
        .set('Authorization', `Bearer ${JWTToken}`);

      const result = response.body;

      validateDashboardContent(result);
      expect(result.panels[0].widgets[0].tabs[0].chartValues).toHaveLength(1);
    });

    it('/dashboards/:id?includeContent=true (GET) 360 chart', async () => {
      const query = await createQuery(db, getNGSILiveQuery());
      const dashboard = await createDashboardByObject(db, getDashboard());
      const panel = await createPanelByObject(db, getPanel(dashboard.id));
      const widget = await createWidgetByObject(
        db,
        getWidget([], []),
        panel.id,
      );

      await createTab(
        db,
        await getTab(db, widget.id, 'Diagramm', '360° Chart', null, query.id),
      );

      const tenant = await createTenantByObject(db, getTenant());
      await createDashboardToTenant(db, dashboard.id, tenant.id);

      const response = await request(app.getHttpServer())
        .get(
          '/dashboards/url/' +
            dashboard.url +
            '?abbreviation=' +
            tenant.abbreviation,
        )
        .set('Authorization', `Bearer ${JWTToken}`);

      const result = response.body;

      validateDashboardContent(result);
      expect(result.panels[0].widgets[0].tabs[0].chartValues).toHaveLength(1);
    });

    it('/dashboards/:id?includeContent=true (GET) 180 chart', async () => {
      const query = await createQuery(db, getNGSILiveQuery());
      const dashboard = await createDashboardByObject(db, getDashboard());
      const panel = await createPanelByObject(db, getPanel(dashboard.id));
      const widget = await createWidgetByObject(
        db,
        getWidget([], []),
        panel.id,
      );

      await createTab(
        db,
        await getTab(db, widget.id, 'Diagramm', '180° Chart', null, query.id),
      );

      const tenant = await createTenantByObject(db, getTenant());
      await createDashboardToTenant(db, dashboard.id, tenant.id);

      const response = await request(app.getHttpServer())
        .get(
          '/dashboards/url/' +
            dashboard.url +
            '?abbreviation=' +
            tenant.abbreviation,
        )
        .set('Authorization', `Bearer ${JWTToken}`);

      const result = response.body;

      validateDashboardContent(result);
      expect(result.panels[0].widgets[0].tabs[0].chartValues).toHaveLength(1);
    });

    it('/dashboards/:id?includeContent=true (GET) Slider Overview', async () => {
      const query = await createQuery(db, getNGSILiveQuery());
      const dashboard = await createDashboardByObject(db, getDashboard());
      const panel = await createPanelByObject(db, getPanel(dashboard.id));
      const widget = await createWidgetByObject(
        db,
        getWidget([], []),
        panel.id,
      );

      await createTab(
        db,
        await getTab(
          db,
          widget.id,
          'Slider',
          'Slider Übersicht',
          null,
          query.id,
        ),
      );

      const tenant = await createTenantByObject(db, getTenant());
      await createDashboardToTenant(db, dashboard.id, tenant.id);

      const response = await request(app.getHttpServer())
        .get(
          '/dashboards/url/' +
            dashboard.url +
            '?abbreviation=' +
            tenant.abbreviation,
        )
        .set('Authorization', `Bearer ${JWTToken}`);

      const result = response.body;

      validateDashboardContent(result);
      expect(result.panels[0].widgets[0].tabs[0].chartData).toHaveLength(1);
    });

    it('/dashboards/:id?includeContent=true (GET) Value', async () => {
      const query = await createQuery(db, getNGSILiveQuery());
      const dashboard = await createDashboardByObject(db, getDashboard());
      const panel = await createPanelByObject(db, getPanel(dashboard.id));
      const widget = await createWidgetByObject(
        db,
        getWidget([], []),
        panel.id,
      );

      await createTab(
        db,
        await getTab(db, widget.id, 'Wert', null, null, query.id),
      );

      const tenant = await createTenantByObject(db, getTenant());
      await createDashboardToTenant(db, dashboard.id, tenant.id);

      const response = await request(app.getHttpServer())
        .get(
          '/dashboards/url/' +
            dashboard.url +
            '?abbreviation=' +
            tenant.abbreviation,
        )
        .set('Authorization', `Bearer ${JWTToken}`);

      const result = response.body;

      validateDashboardContent(result);
      expect(result.panels[0].widgets[0].tabs[0].chartValues).toHaveLength(1);
    });

    function validateDashboardContent(result): void {
      expect(result).toHaveProperty('panels');

      if (result.panels && result.panels.length > 0) {
        const hasWidgets = result.panels.some(
          (panel) => panel.widgets && panel.widgets.length > 0,
        );
        expect(hasWidgets).toBe(true);
      } else {
        throw new Error('No panels found in the dashboard content');
      }

      if (result.panels && result.panels.length > 0) {
        const hasTabs = result.panels.some(
          (panel) =>
            panel.widgets &&
            panel.widgets.some(
              (widget) => widget.tabs && widget.tabs.length > 0,
            ),
        );
        expect(hasTabs).toBe(true);
      } else {
        throw new Error('No panels found in the dashboard content');
      }

      if (result.panels && result.panels.length > 0) {
        const hasDataModel = result.panels.some(
          (panel) =>
            panel.widgets &&
            panel.widgets.some(
              (widget) =>
                widget.tabs &&
                widget.tabs.some(
                  (tab) =>
                    tab.dataModel &&
                    tab.dataModel.model &&
                    Object.keys(tab.dataModel.model).length > 0,
                ),
            ),
        );

        expect(hasDataModel).toBe(true);
      } else {
        throw new Error('No panels found in the dashboard content');
      }
    }
  });

  describe('combined widget with content', () => {
    it('should return combined widgets with data', async () => {
      const tenant = await createTenantByObject(db, getTenant());
      const query1 = await createQuery(db, getNGSILiveQuery());
      const query2 = await createQuery(
        db,
        getNGSIHistoricMultipleEntityQuery(),
      );
      const dashboard = await createDashboardByObject(db, getDashboard());
      const panel = await createPanelByObject(db, getPanel(dashboard.id));

      const childWidget1 = await createWidgetByObject(db, getWidget([], []));
      const childTab1Value = await getTab(
        db,
        childWidget1.id,
        'Wert',
        null,
        null,
        query1.id,
      );
      await createTab(db, childTab1Value);

      const childWidget2 = await createWidgetByObject(db, getWidget([], []));
      const childTab2Value = await getTab(
        db,
        childWidget2.id,
        'Diagramm',
        'Balken Chart',
        null,
        query2.id,
      );
      await createTab(db, childTab2Value);

      const primaryWidget = await createWidgetByObject(
        db,
        getWidget([], []),
        panel.id,
      );
      const primaryTab = await getTab(db, primaryWidget.id);
      primaryTab.componentType = 'Kombinierte Komponente';
      primaryTab.childWidgets = [childWidget1.id, childWidget2.id];
      await createTab(db, primaryTab);

      await createDashboardToTenant(db, dashboard.id, tenant.id);

      const response = await request(app.getHttpServer())
        .get(
          '/dashboards/url/' +
            dashboard.url +
            '?abbreviation=' +
            tenant.abbreviation,
        )
        .set('Authorization', `Bearer ${JWTToken}`);

      const body = response.body;
      expect(body).not.toBeNull();
      expect(body.panels).toHaveLength(1);
      expect(body.panels[0].widgets).toHaveLength(1);
      expect(body.panels[0].widgets[0].tabs).toHaveLength(1);

      const combinedWidgets =
        body.panels[0].widgets[0].widgetData.combinedWidgets;
      expect(combinedWidgets).toHaveLength(2);
      expect(combinedWidgets[0].tabs).toHaveLength(1);
      expect(combinedWidgets[1].tabs).toHaveLength(1);
      expect(combinedWidgets[0].tabs[0].chartValues).toHaveLength(1);
      expect(combinedWidgets[1].tabs[0].chartData.length).toBe(2);
      expect(combinedWidgets[1].tabs[0].chartData[0].values.length).not.toBe(0);
      expect(combinedWidgets[1].tabs[0].chartData[1].values.length).not.toBe(0);
    });
  });
});
