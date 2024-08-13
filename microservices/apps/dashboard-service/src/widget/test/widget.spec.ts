import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DashboardServiceModule } from '../../dashboard-service.module';
import { widgets } from '@app/postgres-db/schemas/dashboard.widget.schema';
import axios from 'axios';
import {
  runLocalDatabasePreparation,
  truncateTables,
} from '../../../../test/database-operations/prepare-database';
import {
  createWidgetByObject,
  createWidgetToTenantRelation,
  getWidget,
} from './test-data';
import { Client } from 'pg';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { createTab, getTab } from '../../tab/test/test-data';
import {
  createQueryConfig,
  getQueryConfig,
} from '../../query-config/test/test-data';
import {
  createDataSourceByObject,
  getDataSource,
} from '../../data-source/test/test-data';
import { v4 as uuid } from 'uuid';
import { createTenantByObject, getTenant } from '../../tenant/test/test-data';

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

  describe('Widgets', () => {
    // create
    it('/widgets (POST)', async () => {
      const widget = getWidget([], []);

      const response = await request(app.getHttpServer())
        .post('/widgets')
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(widget)
        .expect(201);

      expect(response.body).toMatchObject(widget);
    });

    it('/widgets (POST) with tenant', async () => {
      const tenant = await createTenantByObject(db, getTenant());
      const widget = getWidget([], []);

      const response = await request(app.getHttpServer())
        .post(`/widgets?tenant=${tenant.abbreviation}`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(widget)
        .expect(201);

      expect(response.body).toMatchObject(widget);
    });

    it('/widgets (POST) with non existing tenant', async () => {
      const widget = getWidget([], []);

      await request(app.getHttpServer())
        .post(`/widgets?tenant=test`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(widget)
        .expect(400);
    });

    // getAll
    it('/widgets (GET)', async () => {
      const widget = await createWidgetByObject(db, getWidget([], []));

      const response = await request(app.getHttpServer())
        .get('/widgets')
        .set('Authorization', `Bearer ${JWTToken}`);

      expect(response.body).toBeInstanceOf(Array);

      const attributeNames = Object.keys(widgets);

      for (const widget of response.body) {
        for (const attributeName of attributeNames) {
          expect(widget).toHaveProperty(attributeName);

          const columnDefinition = widgets[attributeName];
          if (columnDefinition.notNull) {
            expect(widgets[attributeName]).not.toBeNull();
          }
        }
      }

      const responseIds = response.body.map((widget) => widget.id);
      expect(responseIds).toContain(widget.id);
    });

    // getAll
    it('/widgets (GET) without token', async () => {
      const widget = await createWidgetByObject(db, getWidget([], []));

      const response = await request(app.getHttpServer()).get('/widgets');

      expect(response.body).toBeInstanceOf(Array);

      const attributeNames = Object.keys(widgets);

      for (const widget of response.body) {
        for (const attributeName of attributeNames) {
          if (attributeName !== 'readRoles' && attributeName !== 'writeRoles') {
            expect(widget).toHaveProperty(attributeName);

            const columnDefinition = widgets[attributeName];
            if (columnDefinition.notNull) {
              expect(widgets[attributeName]).not.toBeNull();
            }
          }
        }
      }

      const responseIds = response.body.map((widget) => widget.id);
      expect(responseIds).toContain(widget.id);
    });

    // getAll
    it('/widgets (GET) with no widgets found', async () => {
      const response = await request(app.getHttpServer())
        .get('/widgets')
        .set('Authorization', `Bearer ${JWTToken}`);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(0);
    });

    // getById
    it('/widgets/:id (GET)', async () => {
      const widget = await createWidgetByObject(db, getWidget([], []));

      const response = await request(app.getHttpServer())
        .get('/widgets/' + widget.id)
        .set('Authorization', `Bearer ${JWTToken}`);

      const attributeNames = Object.keys(widgets);

      for (const attributeName of attributeNames) {
        expect(response.body).toHaveProperty(attributeName);

        const columnDefinition = widgets[attributeName];
        if (columnDefinition.notNull) {
          expect(response.body[attributeName]).not.toBeNull();
        }
      }
    });

    it('/widgets/:id (GET) without roles', async () => {
      const widget = await createWidgetByObject(db, getWidget([], []));

      const response = await request(app.getHttpServer()).get(
        '/widgets/' + widget.id,
      );

      const attributeNames = Object.keys(widgets);

      for (const attributeName of attributeNames) {
        if (attributeName !== 'readRoles' && attributeName !== 'writeRoles') {
          expect(response.body).toHaveProperty(attributeName);

          const columnDefinition = widgets[attributeName];
          if (columnDefinition.notNull) {
            expect(response.body[attributeName]).not.toBeNull();
          }
        }
      }
    });

    it('/widgets/:id (GET) not found', async () => {
      await request(app.getHttpServer())
        .get(`/widgets/${uuid()}`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(404);
    });

    it('/widgets/:id (GET) unauthorized', async () => {
      const widget = await createWidgetByObject(
        db,
        getWidget(['scs-admin'], []),
      );

      await request(app.getHttpServer())
        .get('/widgets/' + widget.id)
        .expect(403);
    });

    it('/widgets/tenant/:abbreviation (GET)', async () => {
      const tenant = await createTenantByObject(db, getTenant());
      const widget = await createWidgetByObject(db, getWidget([], []));
      await createWidgetToTenantRelation(db, widget.id, tenant.id);

      const response = await request(app.getHttpServer())
        .get(`/widgets/tenant/${tenant.abbreviation}`)
        .expect(200);

      const returnValue = response.body;

      expect(returnValue.length).toBe(1);
      expect(returnValue[0]).toMatchObject(widget);
    });

    it('/widgets/tenant/:abbreviation (GET) nothing found', async () => {
      const tenant = await createTenantByObject(db, getTenant());

      await request(app.getHttpServer())
        .get(`/widgets/tenant/${tenant.abbreviation}`)
        .expect(404);
    });

    it('/widgets/tenant/:abbreviation (GET) but tenant not found', async () => {
      await request(app.getHttpServer())
        .get(`/widgets/tenant/test`)
        .expect(404);
    });

    // update
    it('/widgets/:id (PATCH)', async () => {
      const widget = await createWidgetByObject(db, getWidget([], []));
      const updateWidget = {
        name: 'Sample Widget updated',
        height: 150,
        width: 150,
        visibility: 'protected',
        readRoles: ['scs-admin'],
        writeRoles: ['scs-admin'],
      };

      const response = await request(app.getHttpServer())
        .patch(`/widgets/${widget.id}`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(updateWidget)
        .expect(200);

      expect(response.body).toMatchObject(updateWidget);
    });

    it('/widgets/:id (PATCH) create tenant relationship', async () => {
      const tenant = await createTenantByObject(db, getTenant());
      const widget = await createWidgetByObject(db, getWidget([], []));

      const updateWidget = {
        name: 'Sample Widget updated',
        height: 150,
        width: 150,
        visibility: 'protected',
        readRoles: ['scs-admin'],
        writeRoles: ['scs-admin'],
      };

      const response = await request(app.getHttpServer())
        .patch(`/widgets/${widget.id}?tenant=${tenant.abbreviation}`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(updateWidget)
        .expect(200);

      expect(response.body).toMatchObject(updateWidget);
    });

    it('/widgets/:id (PATCH) change tenant relationship', async () => {
      const tenant = await createTenantByObject(db, getTenant());
      const widget = await createWidgetByObject(db, getWidget([], []));
      await createWidgetToTenantRelation(db, widget.id, tenant.id);

      const tenant2Object = getTenant();
      tenant2Object.abbreviation = 'test-tenant';
      const tenant2 = await createTenantByObject(db, tenant2Object);

      const updateWidget = {
        name: 'Sample Widget updated',
        height: 150,
        width: 150,
        visibility: 'protected',
        readRoles: ['scs-admin'],
        writeRoles: ['scs-admin'],
      };

      const response = await request(app.getHttpServer())
        .patch(`/widgets/${widget.id}?tenant=${tenant2.abbreviation}`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(updateWidget)
        .expect(200);

      expect(response.body).toMatchObject(updateWidget);
    });

    it('/widgets/:id (PATCH) delete tenant relationship', async () => {
      const tenant = await createTenantByObject(db, getTenant());
      const widget = await createWidgetByObject(db, getWidget([], []));
      await createWidgetToTenantRelation(db, widget.id, tenant.id);

      const updateWidget = {
        name: 'Sample Widget updated',
        height: 150,
        width: 150,
        visibility: 'protected',
        readRoles: ['scs-admin'],
        writeRoles: ['scs-admin'],
      };

      const response = await request(app.getHttpServer())
        .patch(`/widgets/${widget.id}`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(updateWidget)
        .expect(200);

      expect(response.body).toMatchObject(updateWidget);
    });

    it('/widgets/:id (PATCH) tenant not found', async () => {
      const tenant = await createTenantByObject(db, getTenant());
      const widget = await createWidgetByObject(db, getWidget([], []));
      await createWidgetToTenantRelation(db, widget.id, tenant.id);

      const updateWidget = {
        name: 'Sample Widget updated',
        height: 150,
        width: 150,
        visibility: 'protected',
        readRoles: ['scs-admin'],
        writeRoles: ['scs-admin'],
      };

      await request(app.getHttpServer())
        .patch(`/widgets/${widget.id}?tenant=test`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(updateWidget)
        .expect(404);
    });

    // update
    it('/widgets/:id (PATCH) protected to public', async () => {
      const widgetObject = getWidget(['scs-admin'], ['scs-admin']);
      widgetObject.visibility = 'protected';

      const widget = await createWidgetByObject(db, widgetObject);
      const updateWidget = {
        name: 'Sample Widget updated',
        height: 150,
        width: 150,
        visibility: 'public',
      };

      const response = await request(app.getHttpServer())
        .patch(`/widgets/${widget.id}`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(updateWidget)
        .expect(200);

      expect(response.body).toMatchObject(updateWidget);
    });

    it('/widgets/:id (PATCH) widget to update not found', async () => {
      const updateWidget = {
        name: 'Sample Widget updated',
        height: 150,
        width: 150,
        visibility: 'public',
        readRoles: [],
        writeRoles: [],
      };

      await request(app.getHttpServer())
        .patch(`/widgets/${uuid()}`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(updateWidget)
        .expect(404);
    });

    // delete
    it('/widgets/:id (DELETE)', async () => {
      const widget = await createWidgetByObject(db, getWidget([], []));
      await createTab(db, widget.id);

      await request(app.getHttpServer())
        .delete('/widgets/' + widget.id)
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(200);
    });

    it('/widgets/:id (DELETE) with tenant', async () => {
      const tenant = await createTenantByObject(db, getTenant());
      const widget = await createWidgetByObject(db, getWidget([], []));
      await createTab(db, widget.id);
      await createWidgetToTenantRelation(db, widget.id, tenant.id);

      await request(app.getHttpServer())
        .delete(`/widgets/${widget.id}?tenant=${tenant.abbreviation}`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(200);
    });

    it('/widgets/:id (DELETE) protected', async () => {
      const widgetObject = getWidget(['scs-admin'], ['scs-admin']);
      widgetObject.visibility = 'protected';
      const widget = await createWidgetByObject(db, widgetObject);
      await createTab(db, widget.id);

      await request(app.getHttpServer())
        .delete('/widgets/' + widget.id)
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(200);
    });

    it('/widgets/:id (DELETE) protected with no authorization', async () => {
      const widgetObject = getWidget([], []);
      widgetObject.visibility = 'protected';
      const widget = await createWidgetByObject(db, widgetObject);
      await createTab(db, widget.id);

      await request(app.getHttpServer())
        .delete('/widgets/' + widget.id)
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(403);
    });

    it('/widgets/:id (DELETE) widget not found', async () => {
      await request(app.getHttpServer())
        .delete(`/widgets/${uuid()}`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(404);
    });

    it('/widgets/with-children (POST Map Config)', async () => {
      const dataSource = await createDataSourceByObject(
        db,
        await getDataSource(undefined, db),
      );
      const widget = getWidget([], []);
      const tab = getTab(widget.id);
      const queryConfig = getQueryConfig(dataSource.id);

      tab.componentSubType = 'Parking';
      tab.componentType = 'Karte';
      tab.mapLatitude = 50.585075277802574;
      tab.mapLongitude = 9.603538459598571;

      await request(app.getHttpServer())
        .post('/widgets/with-children')
        .set('Authorization', `Bearer ${JWTToken}`)
        .send({
          widget: widget,
          tab: tab,
          queryConfig: queryConfig,
        })
        .expect(201);
    });

    it('/widgets/with-children (POST Image Config)', async () => {
      const widget = getWidget([], []);
      const tab = getTab(widget.id);

      tab.componentType = 'Bild';
      tab.imageSrc = 'https://google.com/logo.png';

      await request(app.getHttpServer())
        .post('/widgets/with-children')
        .set('Authorization', `Bearer ${JWTToken}`)
        .send({
          widget: widget,
          tab: tab,
          queryConfig: null,
        })
        .expect(201);
    });

    it('/widgets/with-children (GET)', async () => {
      const dataSource = await createDataSourceByObject(
        db,
        await getDataSource(undefined, db),
      );
      const widget = await createWidgetByObject(db, getWidget([], []));
      const tab = await createTab(db, widget.id);
      await createQueryConfig(db, 'ngsi-v2', dataSource.id);

      const response = await request(app.getHttpServer())
        .get(`/widgets/with-children/${widget.id}`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(200);

      expect(response.body.widget).toMatchObject(widget);
      expect(response.body.tab).toMatchObject(tab);
    });

    it('/widgets/with-children (GET) without token', async () => {
      const dataSource = await createDataSourceByObject(
        db,
        await getDataSource(undefined, db),
      );
      const widget = await createWidgetByObject(db, getWidget([], []));
      const tab = await createTab(db, widget.id);
      await createQueryConfig(db, 'ngsi-v2', dataSource.id);

      const response = await request(app.getHttpServer())
        .get(`/widgets/with-children/${widget.id}`)
        .expect(200);

      const resultPayload = response.body;

      expect(widget).toMatchObject(resultPayload.widget);
      expect(tab).toMatchObject(resultPayload.tab);
    });

    it('/widgets/with-children/:id (PATCH)', async () => {
      const dataSource = await createDataSourceByObject(
        db,
        await getDataSource(undefined, db),
      );
      const widget = await createWidgetByObject(db, getWidget([], []));
      const tab = await createTab(db, widget.id);
      const queryConfig = await createQueryConfig(db, 'ngsi-v2', dataSource.id);

      const updateValues = {
        widget: {
          name: 'Sample Widget updated',
        },
        tab: {
          id: tab.id,
          componentType: 'Karte',
          componentSubType: 'Parking',
        },
        queryConfig: {
          id: queryConfig.id,
          fiwareService: 'etteln-dataspace',
        },
      };

      const response = await request(app.getHttpServer())
        .patch(`/widgets/with-children/${widget.id}`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(updateValues)
        .expect(200);

      expect(response.body.widget).toMatchObject(updateValues.widget);
      expect(response.body.tab).toMatchObject(updateValues.tab);
      expect(response.body.queryConfig).toMatchObject(updateValues.queryConfig);
    });

    it('/widgets/with-children/:id (PATCH) with image', async () => {
      await createDataSourceByObject(db, await getDataSource(undefined, db));
      const widget = await createWidgetByObject(db, getWidget([], []));
      const tab = await createTab(db, widget.id);

      const updateValues = {
        widget: {
          name: 'Sample Widget updated',
        },
        tab: {
          id: tab.id,
          componentType: 'Bild',
        },
      };

      const response = await request(app.getHttpServer())
        .patch(`/widgets/with-children/${widget.id}`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(updateValues)
        .expect(200);

      console.log(response.body);

      expect(response.body.widget).toMatchObject(updateValues.widget);
      expect(response.body.tab).toMatchObject(updateValues.tab);
      expect(response.body.queryConfig).toBeNull();
    });

    it('/widgets/with-children/:id (PATCH) with missing query config id', async () => {
      const dataSource = await createDataSourceByObject(
        db,
        await getDataSource(undefined, db),
      );
      const widget = await createWidgetByObject(db, getWidget([], []));
      const tab = await createTab(db, widget.id);
      await createQueryConfig(db, 'ngsi-v2', dataSource.id);

      const updateValues = {
        widget: {
          name: 'Sample Widget updated',
        },
        tab: {
          id: tab.id,
          componentType: 'Karte',
          componentSubType: 'Parking',
        },
        queryConfig: {
          fiwareService: 'etteln-dataspace',
        },
      };

      await request(app.getHttpServer())
        .patch(`/widgets/with-children/${widget.id}`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(updateValues)
        .expect(400);
    });

    it('/widgets/with-children/:id (PATCH) with missing tab id', async () => {
      const dataSource = await createDataSourceByObject(
        db,
        await getDataSource(undefined, db),
      );
      const widget = await createWidgetByObject(db, getWidget([], []));
      await createTab(db, widget.id);
      await createQueryConfig(db, 'ngsi-v2', dataSource.id);

      const updateValues = {
        widget: {
          name: 'Sample Widget updated',
        },
        tab: {
          componentType: 'Karte',
          componentSubType: 'Parking',
        },
        queryConfig: {
          fiwareService: 'etteln-dataspace',
        },
      };

      await request(app.getHttpServer())
        .patch(`/widgets/with-children/${widget.id}`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(updateValues)
        .expect(400);
    });

    it('/widgets/with-children/:id (PATCH) with missing component type on tab', async () => {
      const dataSource = await createDataSourceByObject(
        db,
        await getDataSource(undefined, db),
      );
      const widget = await createWidgetByObject(db, getWidget([], []));
      await createTab(db, widget.id);
      await createQueryConfig(db, 'ngsi-v2', dataSource.id);

      const updateValues = {
        widget: {
          name: 'Sample Widget updated',
        },
        tab: {
          componentSubType: 'Parking',
        },
        queryConfig: {
          fiwareService: 'etteln-dataspace',
        },
      };

      await request(app.getHttpServer())
        .patch(`/widgets/with-children/${widget.id}`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(updateValues)
        .expect(400);
    });
  });
});
