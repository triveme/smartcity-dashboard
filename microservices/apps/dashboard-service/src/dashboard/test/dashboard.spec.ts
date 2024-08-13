import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DashboardServiceModule } from '../../dashboard-service.module';
import { dashboards } from '@app/postgres-db/schemas/dashboard.schema';
import axios from 'axios';
import {
  runLocalDatabasePreparation,
  truncateTables,
} from '../../../../test/database-operations/prepare-database';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { Client } from 'pg';
import {
  createDashboardByObject,
  getDashboard,
  getDashboardFromDb,
  getDashboardToTenantForDashboardFromDb,
} from './test-data';
import { v4 as uuid } from 'uuid';
import {
  createGroupingElementByObject,
  getGroupingElement,
  getGroupingElementFromDb,
} from '../../grouping-element/test/test-data';
import {
  createDashboardToTenant,
  createTenantByObject,
  getTenant,
  getTenantFromDb,
} from '../../tenant/test/test-data';
import { GroupingElement } from '@app/postgres-db/schemas/dashboard.grouping-element.schema';
import { createPanelByObject, getPanel } from '../../panel/test/test-data';
import { createWidgetByObject, getWidget } from '../../widget/test/test-data';
import { createTab } from '../../tab/test/test-data';

describe('DashboardServiceControllers (e2e)', () => {
  let app: INestApplication;
  let client: Client;
  let db: DbType;
  const dashboardUrls = ['dashboard1', 'dashboard2'];

  beforeAll(async () => {
    process.env.EDIT_ROLES = '["scs-admin"]';

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

  describe('Dashboards', () => {
    // create
    it('/dashboards (POST)', async () => {
      for (let i = 0; i < 3; i++) {
        const dashboard = getDashboard();
        dashboard.id = uuid();
        dashboard.url = dashboard.url + i;

        const response = await request(app.getHttpServer())
          .post('/dashboards')
          .set('Authorization', `Bearer ${JWTToken}`)
          .send(dashboard)
          .expect(201);

        const attributeNames = Object.keys(dashboards);

        for (const attributeName of attributeNames) {
          expect(response.body).toHaveProperty(attributeName);

          const columnDefinition = dashboards[attributeName];
          if (columnDefinition.notNull) {
            expect(dashboards[attributeName]).not.toBeNull();
          }
        }
      }
    });

    it('/dashboards (POST) with tenant', async () => {
      const tenant = await createTenantByObject(db, getTenant());

      for (let i = 0; i < 3; i++) {
        const dashboard = getDashboard();
        dashboard.id = uuid();
        dashboard.url = dashboard.url + i;

        const response = await request(app.getHttpServer())
          .post(`/dashboards?tenant=${tenant.abbreviation}`)
          .set('Authorization', `Bearer ${JWTToken}`)
          .send(dashboard)
          .expect(201);

        const attributeNames = Object.keys(dashboards);

        for (const attributeName of attributeNames) {
          expect(response.body).toHaveProperty(attributeName);

          const columnDefinition = dashboards[attributeName];
          if (columnDefinition.notNull) {
            expect(dashboards[attributeName]).not.toBeNull();
          }
        }
      }
    });

    it('/dashboards (POST) with forbidden', async () => {
      const dashboard = getDashboard();
      dashboard.id = uuid();

      await request(app.getHttpServer())
        .post('/dashboards')
        .send(dashboard)
        .expect(403);
    });

    it('/dashboards (POST) with missing tenant', async () => {
      const dashboard = getDashboard();
      dashboard.id = uuid();

      await request(app.getHttpServer())
        .post('/dashboards?tenant=test')
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(dashboard)
        .expect(400);
    });

    it('/dashboards (POST) with existing url', async () => {
      await createDashboardByObject(db, getDashboard());
      const dashboard = getDashboard();
      dashboard.id = uuid();

      await request(app.getHttpServer())
        .post('/dashboards?tenant=test')
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(dashboard)
        .expect(400);
    });

    // getAll
    it('/dashboards (GET)', async () => {
      const dashboard = await createDashboardByObject(db, getDashboard());

      const response = await request(app.getHttpServer())
        .get('/dashboards')
        .set('Authorization', `Bearer ${JWTToken}`);

      expect(response.body).toBeInstanceOf(Array);

      const attributeNames = Object.keys(dashboards);

      for (const dashboard of response.body) {
        for (const attributeName of attributeNames) {
          expect(dashboard).toHaveProperty(attributeName);

          const columnDefinition = dashboards[attributeName];
          if (columnDefinition.notNull) {
            expect(dashboards[attributeName]).not.toBeNull();
          }
        }
      }

      const responseIds = response.body.map((dashboard) => dashboard.id);
      expect(responseIds).toContain(dashboard.id);
    });

    // getById
    it('/dashboards/:id (GET)', async () => {
      for (const url of dashboardUrls) {
        const dashboard = await createDashboardByObject(db, getDashboard(url));

        const response = await request(app.getHttpServer())
          .get('/dashboards/' + dashboard.id)
          .set('Authorization', `Bearer ${JWTToken}`);

        const attributeNames = Object.keys(dashboards);

        for (const attributeName of attributeNames) {
          expect(response.body).toHaveProperty(attributeName);

          const columnDefinition = dashboards[attributeName];
          if (columnDefinition.notNull) {
            expect(response.body[attributeName]).not.toBeNull();
          }
        }
      }
    });

    // getByUrl
    it('/dashboards/url/:url (GET)', async () => {
      for (const url of dashboardUrls) {
        await createDashboardByObject(db, getDashboard(url));

        const response = await request(app.getHttpServer())
          .get('/dashboards/url/' + url)
          .set('Authorization', `Bearer ${JWTToken}`);

        const attributeNames = Object.keys(dashboards);

        for (const attributeName of attributeNames) {
          expect(response.body).toHaveProperty(attributeName);

          const columnDefinition = dashboards[attributeName];
          if (columnDefinition.notNull) {
            expect(response.body[attributeName]).not.toBeNull();
          }
        }
      }
    });

    // update
    it('/dashboards/:id (PATCH)', async () => {
      const dashboard = await createDashboardByObject(db, getDashboard());
      await createGroupingElementByObject(db, getGroupingElement());

      const updateDashboard = {
        name: 'Sample Dashboard updated',
        url: 'http://localhost:1234/dashboard-updated',
        icon: '/testicon/updated',
        type: 'example',
        readRoles: [],
        writeRoles: [],
        visibility: 'public',
      };

      const response = await request(app.getHttpServer())
        .patch('/dashboards/' + dashboard.id)
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(updateDashboard)
        .expect(200);

      expect(response.body).toMatchObject(updateDashboard);
    });

    it('/dashboards/:id (PATCH) with updated tenant abbreviation', async () => {
      const tenant = await createTenantByObject(db, getTenant());
      const updateTenantObject = getTenant();
      updateTenantObject.abbreviation = 'edag-test-1';
      const updateTenant = await createTenantByObject(db, updateTenantObject);
      const dashboard = await createDashboardByObject(db, getDashboard());
      await createGroupingElementByObject(
        db,
        getGroupingElement(true, dashboard.url),
      );
      await createDashboardToTenant(db, dashboard.id, tenant.id);

      const updateDashboard = {
        name: 'Sample Dashboard updated',
        url: 'http://localhost:1234/dashboard-updated',
        icon: '/testicon/updated',
        type: 'example',
        readRoles: [],
        writeRoles: [],
        visibility: 'public',
      };

      const response = await request(app.getHttpServer())
        .patch(
          `/dashboards/${dashboard.id}?tenant=${updateTenant.abbreviation}`,
        )
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(updateDashboard)
        .expect(200);

      expect(response.body).toMatchObject(updateDashboard);
    });

    it('/dashboards/:id (PATCH) with delete tenant abbreviation', async () => {
      const tenant = await createTenantByObject(db, getTenant());
      const dashboard = await createDashboardByObject(db, getDashboard());
      await createGroupingElementByObject(
        db,
        getGroupingElement(true, dashboard.url),
      );
      await createDashboardToTenant(db, dashboard.id, tenant.id);

      const updateDashboard = {
        name: 'Sample Dashboard updated',
        url: 'http://localhost:1234/dashboard-updated',
        icon: '/testicon/updated',
        type: 'example',
        readRoles: [],
        writeRoles: [],
        visibility: 'public',
      };

      const response = await request(app.getHttpServer())
        .patch(`/dashboards/${dashboard.id}`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(updateDashboard)
        .expect(200);

      expect(response.body).toMatchObject(updateDashboard);
    });

    it('/dashboards/:id (PATCH) with new tenant abbreviation', async () => {
      const tenant = await createTenantByObject(db, getTenant());
      const dashboard = await createDashboardByObject(db, getDashboard());
      await createGroupingElementByObject(
        db,
        getGroupingElement(true, dashboard.url),
      );

      const updateDashboard = {
        name: 'Sample Dashboard updated',
        url: 'http://localhost:1234/dashboard-updated',
        icon: '/testicon/updated',
        type: 'example',
        readRoles: [],
        writeRoles: [],
        visibility: 'public',
      };

      const response = await request(app.getHttpServer())
        .patch(`/dashboards/${dashboard.id}?tenant=${tenant.abbreviation}`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(updateDashboard)
        .expect(200);

      expect(response.body).toMatchObject(updateDashboard);
    });

    it('/dashboards/:id (PATCH) with not existing tenant abbreviation', async () => {
      const dashboard = await createDashboardByObject(db, getDashboard());
      await createGroupingElementByObject(
        db,
        getGroupingElement(true, dashboard.url),
      );

      const updateDashboard = {
        name: 'Sample Dashboard updated',
        url: 'http://localhost:1234/dashboard-updated',
        icon: '/testicon/updated',
        type: 'example',
        readRoles: [],
        writeRoles: [],
        visibility: 'public',
      };

      await request(app.getHttpServer())
        .patch(`/dashboards/${dashboard.id}?tenant=test`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(updateDashboard)
        .expect(404);
    });

    // update
    it('/dashboards/:id (PATCH) but new url exists', async () => {
      await createDashboardByObject(db, getDashboard('test1'));
      const dashboard2 = await createDashboardByObject(
        db,
        getDashboard('test2'),
      );

      const updateDashboard = {
        name: 'Sample Dashboard updated',
        url: 'test1',
        icon: '/testicon/updated',
        type: 'example',
        readRoles: [],
        writeRoles: [],
        visibility: 'public',
      };

      await request(app.getHttpServer())
        .patch('/dashboards/' + dashboard2.id)
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(updateDashboard)
        .expect(409);
    });

    // update
    it('/dashboards/:id (PATCH) but not found', async () => {
      const updateDashboard = {
        name: 'Sample Dashboard updated',
        url: 'http://localhost:1234/dashboard-updated',
        icon: '/testicon/updated',
        type: 'example',
        readRoles: [],
        writeRoles: [],
        visibility: 'public',
      };

      await request(app.getHttpServer())
        .patch('/dashboards/' + uuid())
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(updateDashboard)
        .expect(404);
    });

    // update
    it('/dashboards/:id (PATCH) but no authorization', async () => {
      const dashboard = await createDashboardByObject(db, getDashboard());

      const updateDashboard = {
        name: 'Sample Dashboard updated',
        url: 'http://localhost:1234/dashboard-updated',
        icon: '/testicon/updated',
        type: 'example',
        readRoles: [],
        writeRoles: [],
        visibility: 'public',
      };

      await request(app.getHttpServer())
        .patch('/dashboards/' + dashboard.id)
        .send(updateDashboard)
        .expect(403);
    });

    it('gets dashboard by tenant abbreviation', async () => {
      const dashboard = await createDashboardByObject(db, getDashboard());
      const tenant = await createTenantByObject(db, getTenant());
      await createDashboardToTenant(db, dashboard.id, tenant.id);

      const response = await request(app.getHttpServer())
        .get(`/dashboards/tenant/${tenant.abbreviation}`)
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0]).toMatchObject(dashboard);
    });

    // delete
    it('/dashboards/:id (DELETE)', async () => {
      const dashboard = await createDashboardByObject(db, getDashboard());
      const panel = await createPanelByObject(db, getPanel(dashboard.id));
      const widget = await createWidgetByObject(
        db,
        getWidget([], []),
        panel.id,
      );
      await createTab(db, widget.id);

      await request(app.getHttpServer())
        .delete('/dashboards/' + dashboard.id)
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(200);
    });

    // delete
    it('/dashboards/:id (DELETE) with not existing panel', async () => {
      const dashboard = await createDashboardByObject(db, getDashboard());
      const panel = await createPanelByObject(db, getPanel(dashboard.id));
      const widget = await createWidgetByObject(
        db,
        getWidget([], []),
        panel.id,
      );
      await createTab(db, widget.id);

      await request(app.getHttpServer())
        .delete('/dashboards/' + dashboard.id)
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(200);
    });

    it('/dashboards/:id (DELETE) with non existing dashboard', async () => {
      await request(app.getHttpServer())
        .delete('/dashboards/' + uuid())
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(404);
    });

    it('deletes grouping element, when deleting dashboard page', async () => {
      const dashboard = await createDashboardByObject(
        db,
        getDashboard('http://localhost'),
      );
      const groupingElement = await createGroupingElementByObject(
        db,
        getGroupingElement(true),
      );

      await request(app.getHttpServer())
        .delete('/dashboards/' + dashboard.id)
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(200);

      const dashboardFromDb = await getDashboardFromDb(db, dashboard.id);
      const groupingElementFromDb = await getGroupingElementFromDb(
        db,
        groupingElement.id,
      );

      expect(dashboardFromDb).toBeNull();
      expect(groupingElementFromDb).toBeNull();
    });

    it('deletes dashboard2tenant relation, when deleting dashboard page', async () => {
      const dashboard = await createDashboardByObject(
        db,
        getDashboard('http://localhost'),
      );
      const tenant = await createTenantByObject(db, getTenant());
      await createDashboardToTenant(db, dashboard.id, tenant.id);

      await request(app.getHttpServer())
        .delete('/dashboards/' + dashboard.id)
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(200);

      const dashboardFromDb = await getDashboardFromDb(db, dashboard.id);
      const dashboardToTenantFromDb =
        await getDashboardToTenantForDashboardFromDb(db, dashboard.id);
      const tenantFromDb = await getTenantFromDb(db, tenant.id);

      expect(dashboardFromDb).toBeNull();
      expect(dashboardToTenantFromDb).toBeNull();
      expect(tenantFromDb).toEqual(tenant);
    });

    it('should return the first dashboard url with grouping elements', async () => {
      await createDashboardByObject(db, getDashboard('test1'));
      await createDashboardByObject(db, getDashboard('test2'));
      const groupingElement1: GroupingElement =
        await createGroupingElementByObject(
          db,
          getGroupingElement(false, 'groupingElement1', null, 0),
        );
      const groupingElement2: GroupingElement =
        await createGroupingElementByObject(
          db,
          getGroupingElement(false, 'groupingElement2', groupingElement1.id),
        );
      const groupingElement3: GroupingElement =
        await createGroupingElementByObject(
          db,
          getGroupingElement(true, 'test1', groupingElement2.id),
        );
      await createGroupingElementByObject(
        db,
        getGroupingElement(true, 'test2', null, 1),
      );

      const response = await request(app.getHttpServer())
        .get('/dashboards/first/url')
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0]).toBe(
        `/${groupingElement1.url}/${groupingElement2.url}/${groupingElement3.url}`,
      );
    });

    it('should return the first dashboard url without grouping elements', async () => {
      await createDashboardByObject(db, getDashboard('test1'));
      await createDashboardByObject(db, getDashboard('test2'));
      const groupingElement1: GroupingElement =
        await createGroupingElementByObject(
          db,
          getGroupingElement(true, 'test1', null, 0),
        );
      await createGroupingElementByObject(
        db,
        getGroupingElement(true, 'test2', null, 1),
      );

      const response = await request(app.getHttpServer())
        .get('/dashboards/first/url')
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0]).toBe(`${groupingElement1.url}`);
    });

    it('throw not found because no grouping element as dashboard found', async () => {
      await createDashboardByObject(db, getDashboard('test1'));
      const groupingElement1 = await createGroupingElementByObject(
        db,
        getGroupingElement(false, 'groupingElement1', null, 0),
      );
      await createGroupingElementByObject(
        db,
        getGroupingElement(false, 'test1', groupingElement1.id, 0),
      );

      await request(app.getHttpServer())
        .get('/dashboards/first/url')
        .expect(404);
    });

    it('throw not found because no grouping element found', async () => {
      await createDashboardByObject(db, getDashboard('test1'));

      await request(app.getHttpServer())
        .get('/dashboards/first/url')
        .expect(404);
    });
  });
});
