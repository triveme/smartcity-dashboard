import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DashboardServiceModule } from '../../dashboard-service.module';
import axios from 'axios';
import {
  runLocalDatabasePreparation,
  truncateTables,
} from '../../../../test/database-operations/prepare-database';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { Client } from 'pg';
import { createDashboardByObject, getDashboard } from './test-data';
import { createPanelByObject, getPanel } from '../../panel/test/test-data';
import { createWidgetByObject, getWidget } from '../../widget/test/test-data';
import { createTab } from '../../tab/test/test-data';
import { createQuery } from '../../query/test/test-data';
import {
  createDashboardToTenant,
  createTenantByObject,
  getTenant,
} from '../../tenant/test/test-data';

describe('DashboardServiceControllers (e2e)', () => {
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
    // Get JWT token
    const authUrl = process.env.KEYCLOAK_CLIENT_URI;

    const data = new URLSearchParams();
    data.append('client_id', process.env.KEYCLOAK_CLIENT_ID);
    data.append('client_secret', process.env.KEYCLOAK_CLIENT_SECRET);
    data.append('grant_type', 'client_credentials');

    try {
      await process.nextTick(() => {});
      const res = await axios.post(authUrl, data);
      JWTToken = res.data.access_token;
    } catch (error) {
      console.error('Error occurred:', error);
    }

    await truncateTables(client);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Dashboards with content', () => {
    it('/dashboards/:id?includeContent=true (GET)', async () => {
      const query = await createQuery(db, 'ngsi-v2');
      const dashboard = await createDashboardByObject(db, getDashboard());
      const panel = await createPanelByObject(db, getPanel(dashboard.id));
      const widget = await createWidgetByObject(
        db,
        getWidget([], []),
        panel.id,
      );
      await createTab(db, widget.id, null, query.id);

      const response = await request(app.getHttpServer())
        .get('/dashboards/' + dashboard.id + '?includeContent=true')
        .set('Authorization', `Bearer ${JWTToken}`);

      const result = response.body;

      validateDashboardContent(result);
    });

    it('/dashboards/:id?includeContent=true (GET) without authorization', async () => {
      const query = await createQuery(db, 'api');
      const dashboard = await createDashboardByObject(db, getDashboard());
      const panel = await createPanelByObject(db, getPanel(dashboard.id));
      const widget = await createWidgetByObject(
        db,
        getWidget([], []),
        panel.id,
      );
      await createTab(db, widget.id, null, query.id);

      await request(app.getHttpServer())
        .get('/dashboards/' + dashboard.id + '?includeContent=true')
        .expect(403);
    });

    it('/dashboards?includeContent=true (GET)', async () => {
      const query1 = await createQuery(db, 'api');
      const dashboard1 = await createDashboardByObject(db, getDashboard());
      const panel1 = await createPanelByObject(db, getPanel(dashboard1.id));
      const widget1 = await createWidgetByObject(
        db,
        getWidget([], []),
        panel1.id,
      );
      await createTab(db, widget1.id, null, query1.id);

      const query2 = await createQuery(db, 'api');
      const dashboard2 = await createDashboardByObject(db, getDashboard());
      const panel2 = await createPanelByObject(db, getPanel(dashboard2.id));
      const widget2 = await createWidgetByObject(
        db,
        getWidget([], []),
        panel2.id,
      );
      await createTab(db, widget2.id, null, query2.id);

      const response = await request(app.getHttpServer())
        .get('/dashboards?includeContent=true')
        .set('Authorization', `Bearer ${JWTToken}`);

      const result = response.body;

      validateDashboardContent(result[0]);
      validateDashboardContent(result[1]);
    });

    it('/dashboards?includeContent=true (GET) without authorization', async () => {
      const query1 = await createQuery(db, 'api');
      const dashboard1 = await createDashboardByObject(db, getDashboard());
      const panel1 = await createPanelByObject(db, getPanel(dashboard1.id));
      const widget1 = await createWidgetByObject(
        db,
        getWidget([], []),
        panel1.id,
      );
      await createTab(db, widget1.id, null, query1.id);

      const query2 = await createQuery(db, 'api');
      const dashboard2 = await createDashboardByObject(db, getDashboard());
      const panel2 = await createPanelByObject(db, getPanel(dashboard2.id));
      const widget2 = await createWidgetByObject(
        db,
        getWidget([], []),
        panel2.id,
      );
      await createTab(db, widget2.id, null, query2.id);

      const response = await request(app.getHttpServer()).get(
        '/dashboards?includeContent=true',
      );

      const result = response.body;

      validateDashboardContent(result[0]);
      validateDashboardContent(result[1]);
    });

    it('/dashboard/tenant/:abbreviation?includeContent=true (GET)', async () => {
      const tenant = await createTenantByObject(db, getTenant());
      const query = await createQuery(db, 'api');
      const dashboard = await createDashboardByObject(db, getDashboard());
      const panel = await createPanelByObject(db, getPanel(dashboard.id));
      const widget = await createWidgetByObject(
        db,
        getWidget([], []),
        panel.id,
      );
      await createTab(db, widget.id, null, query.id);
      await createDashboardToTenant(db, dashboard.id, tenant.id);

      const response = await request(app.getHttpServer())
        .get(`/dashboards/tenant/${tenant.abbreviation}?includeContent=true`)
        .set('Authorization', `Bearer ${JWTToken}`);

      const result = response.body;

      validateDashboardContent(result[0]);
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
});
