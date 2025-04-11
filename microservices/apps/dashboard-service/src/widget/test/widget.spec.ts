import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DashboardServiceModule } from '../../dashboard-service.module';
import { widgets } from '@app/postgres-db/schemas/dashboard.widget.schema';
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
import { generateJWTToken } from '../../../../test/jwt-token-util';

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
    JWTToken = await generateJWTToken(
      process.env.KEYCLOAK_CLIENT_ID,
      process.env.KEYCLOAK_CLIENT_SECRET,
    );

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
      await createTab(db, await getTab(db, widget.id));

      await request(app.getHttpServer())
        .delete('/widgets/' + widget.id)
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(200);
    });

    it('/widgets/:id (DELETE) with tenant', async () => {
      const tenant = await createTenantByObject(db, getTenant());
      const widget = await createWidgetByObject(db, getWidget([], []));
      await createTab(db, await getTab(db, widget.id));
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
      await createTab(db, await getTab(db, widget.id));

      await request(app.getHttpServer())
        .delete('/widgets/' + widget.id)
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(200);
    });

    it('/widgets/:id (DELETE) protected with no authorization', async () => {
      const widgetObject = getWidget([], []);
      widgetObject.visibility = 'protected';
      const widget = await createWidgetByObject(db, widgetObject);
      await createTab(db, await getTab(db, widget.id));

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
      const tab = await getTab(db, widget.id, 'Karte', 'Parking');
      const queryConfig = getQueryConfig(dataSource.id);

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
      const tab = await getTab(db, widget.id, 'Bild', null);

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
      const tenant = await createTenantByObject(db, getTenant());
      const widget = await createWidgetByObject(db, getWidget([], []));
      const tab = await createTab(db, await getTab(db, widget.id));
      await createWidgetToTenantRelation(db, widget.id, tenant.id);
      await createQueryConfig(db, 'ngsi-v2', dataSource.id);

      const response = await request(app.getHttpServer())
        .get(`/widgets/with-children?tenant=${tenant.abbreviation}`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(200);

      expect(response.body.length).toBe(1);
      expect(response.body[0].widget).toMatchObject(widget);
      expect(response.body[0].tab).toMatchObject(tab);
    });

    it('/widgets/with-children/:id (GET)', async () => {
      const dataSource = await createDataSourceByObject(
        db,
        await getDataSource(undefined, db),
      );
      const widget = await createWidgetByObject(db, getWidget([], []));
      const tab = await createTab(db, await getTab(db, widget.id));
      await createQueryConfig(db, 'ngsi-v2', dataSource.id);

      const response = await request(app.getHttpServer())
        .get(`/widgets/with-children/${widget.id}`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(200);

      expect(response.body.widget).toMatchObject(widget);
      expect(response.body.tab).toMatchObject(tab);
    });

    it('/widgets/with-children/:id (GET) without token', async () => {
      const dataSource = await createDataSourceByObject(
        db,
        await getDataSource(undefined, db),
      );
      const widget = await createWidgetByObject(db, getWidget([], []));
      const tab = await createTab(db, await getTab(db, widget.id));
      await createQueryConfig(db, 'ngsi-v2', dataSource.id);

      const response = await request(app.getHttpServer())
        .get(`/widgets/with-children/${widget.id}`)
        .expect(200);

      const resultPayload = response.body;

      expect(widget).toMatchObject(resultPayload.widget);
      expect(tab).toMatchObject(resultPayload.tab);
    });

    it('/widgets/with-children/:id (PATCH) without Query Config', async () => {
      const widget = await createWidgetByObject(db, getWidget([], []));
      const tab = await createTab(db, await getTab(db, widget.id));

      const updateValues = {
        widget: {
          name: 'Sample Widget updated',
        },
        tab: {
          id: tab.id,
          componentType: 'Informationen',
        },
      };

      const response = await request(app.getHttpServer())
        .patch(`/widgets/with-children/${widget.id}`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(updateValues)
        .expect(200);

      expect(response.body.widget).toMatchObject(updateValues.widget);
      expect(response.body.tab).toMatchObject(updateValues.tab);
    });

    it('/widgets/with-children/:id (PATCH) with image', async () => {
      await createDataSourceByObject(db, await getDataSource(undefined, db));
      const widget = await createWidgetByObject(db, getWidget([], []));
      const tab = await createTab(db, await getTab(db, widget.id));

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
      const tab = await createTab(db, await getTab(db, widget.id));
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
      await createTab(db, await getTab(db, widget.id));
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
      await createTab(db, await getTab(db, widget.id));
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
    // duplicate
    it('/widget/duplicate/:id (Post) duplicate', async () => {
      const widget = await createWidgetByObject(db, getWidget([], []));
      const tab = await getTab(db, widget.id);
      await createTab(db, tab);
      const responseAllWidgets = await request(app.getHttpServer())
        .get('/widgets')
        .set('Authorization', `Bearer ${JWTToken}`);
      expect(responseAllWidgets.body).toBeInstanceOf(Array);
      expect(responseAllWidgets.body).toHaveLength(1);

      const responseAllQueryConfigs = await request(app.getHttpServer())
        .get('/queries')
        .set('Authorization', `Bearer ${JWTToken}`);
      expect(responseAllQueryConfigs.body).toBeInstanceOf(Array);
      expect(responseAllQueryConfigs.body).toHaveLength(1);
      await request(app.getHttpServer())
        .post(`/widgets/duplicate/${widget.id}`)
        .set('Authorization', `Bearer ${JWTToken}`);
      const responseAllWidgetsAfterDuplicate = await request(
        app.getHttpServer(),
      )
        .get('/widgets')
        .set('Authorization', `Bearer ${JWTToken}`);
      expect(responseAllWidgetsAfterDuplicate.body).toBeInstanceOf(Array);
      expect(responseAllWidgetsAfterDuplicate.body).toHaveLength(2);

      const responseAllQueryConfigsAfterDuplicate = await request(
        app.getHttpServer(),
      )
        .get('/queries')
        .set('Authorization', `Bearer ${JWTToken}`);
      expect(responseAllQueryConfigsAfterDuplicate.body).toBeInstanceOf(Array);
      expect(responseAllQueryConfigsAfterDuplicate.body).toHaveLength(2);
    });

    it('/widget/duplicate/:id (Post) duplicate combined component and two childs', async () => {
      const combinedWid = getWidget([], []);
      combinedWid.name = 'combinedWidget';
      const combinedWidget = await createWidgetByObject(db, combinedWid);
      const combinedTab = await getTab(
        db,
        combinedWidget.id,
        'Kombinierte Komponente',
        undefined,
        undefined,
      );
      const childWid1 = getWidget([], []);
      const childWid2 = getWidget([], []);
      childWid1.name = 'child1';
      childWid2.name = 'child2';

      const childWidget1 = await createWidgetByObject(db, childWid1);
      const childWidget2 = await createWidgetByObject(db, childWid2);

      const childTab1 = await getTab(db, childWidget1.id);
      const childTab2 = await getTab(db, childWidget2.id);

      childTab1.componentType = 'Diagramm';
      childTab1.componentSubType = 'Balken Chart';
      childTab2.componentType = 'Wert';
      await createTab(db, childTab1);
      await createTab(db, childTab2);
      combinedTab.childWidgets = [childWidget1.id, childWidget2.id];
      await createTab(db, combinedTab);
      const responseAllWidgets = await request(app.getHttpServer())
        .get('/widgets')
        .set('Authorization', `Bearer ${JWTToken}`);
      expect(responseAllWidgets.body).toBeInstanceOf(Array);
      expect(responseAllWidgets.body).toHaveLength(3);

      const responseAllQueryConfigs = await request(app.getHttpServer())
        .get('/query-configs')
        .set('Authorization', `Bearer ${JWTToken}`);
      console.log('queries');
      for (const queries of responseAllQueryConfigs.body) {
        console.log(queries.id);
      }
      expect(responseAllQueryConfigs.body).toBeInstanceOf(Array);
      expect(responseAllQueryConfigs.body).toHaveLength(3);
      await request(app.getHttpServer())
        .post(`/widgets/duplicate/${combinedWidget.id}`)
        .set('Authorization', `Bearer ${JWTToken}`);
      const responseAllWidgetsAfterDuplicate = await request(
        app.getHttpServer(),
      )
        .get('/widgets')
        .set('Authorization', `Bearer ${JWTToken}`);
      expect(responseAllWidgetsAfterDuplicate.body).toBeInstanceOf(Array);
      expect(responseAllWidgetsAfterDuplicate.body).toHaveLength(6);
      const responseAllQueryConfigsAfterDuplicate = await request(
        app.getHttpServer(),
      )
        .get('/query-configs')
        .set('Authorization', `Bearer ${JWTToken}`);
      expect(responseAllQueryConfigsAfterDuplicate.body).toBeInstanceOf(Array);
      // Only expects 5 queries, because Test Environment always creates a query config for a new Tab,
      // but getWidgetWithChildrenById at the '/duplicate' endpoint filters the query config for tabs, which doesnt normally have a query config.
      // So the query config of the combined component wont be duplicated
      expect(responseAllQueryConfigsAfterDuplicate.body).toHaveLength(5);
    });

    it('/widget/duplicate/:id (Post) duplicate combined component and three childs', async () => {
      const combinedWid = getWidget([], []);
      combinedWid.name = 'combinedWidget';
      const combinedWidget = await createWidgetByObject(db, combinedWid);
      const combinedTab = await getTab(
        db,
        combinedWidget.id,
        'Kombinierte Komponente',
        undefined,
        undefined,
      );

      const childWidget1 = await createWidgetByObject(db, getWidget([], []));
      const childWidget2 = await createWidgetByObject(db, getWidget([], []));
      const childWidget3 = await createWidgetByObject(db, getWidget([], []));

      const childTab1 = await getTab(db, childWidget1.id);
      const childTab2 = await getTab(db, childWidget2.id);
      const childTab3 = await getTab(db, childWidget3.id);

      childTab1.componentType = 'Diagramm';
      childTab1.componentSubType = 'Balken Chart';
      childTab2.componentType = 'Wert';
      childTab3.componentType = 'Diagramm';
      childTab3.componentSubType = 'Linien Chart';

      await createTab(db, childTab1);
      await createTab(db, childTab2);
      await createTab(db, childTab3);

      combinedTab.childWidgets = [
        childWidget1.id,
        childWidget2.id,
        childWidget3.id,
      ];
      await createTab(db, combinedTab);
      const responseAllWidgets = await request(app.getHttpServer())
        .get('/widgets')
        .set('Authorization', `Bearer ${JWTToken}`);
      expect(responseAllWidgets.body).toBeInstanceOf(Array);
      expect(responseAllWidgets.body).toHaveLength(4);

      const responseAllQueryConfigs = await request(app.getHttpServer())
        .get('/query-configs')
        .set('Authorization', `Bearer ${JWTToken}`);
      expect(responseAllQueryConfigs.body).toBeInstanceOf(Array);
      expect(responseAllQueryConfigs.body).toHaveLength(4);
      await request(app.getHttpServer())
        .post(`/widgets/duplicate/${combinedWidget.id}`)
        .set('Authorization', `Bearer ${JWTToken}`);
      const responseAllWidgetsAfterDuplicate = await request(
        app.getHttpServer(),
      )
        .get('/widgets')
        .set('Authorization', `Bearer ${JWTToken}`);
      expect(responseAllWidgetsAfterDuplicate.body).toBeInstanceOf(Array);
      expect(responseAllWidgetsAfterDuplicate.body).toHaveLength(8);

      const responseAllQueryConfigsAfterDuplicate = await request(
        app.getHttpServer(),
      )
        .get('/query-configs')
        .set('Authorization', `Bearer ${JWTToken}`);
      expect(responseAllQueryConfigsAfterDuplicate.body).toBeInstanceOf(Array);
      // Only expects 7 queries, because Test Environment always creates a query config for a new Tab,
      // but getWidgetWithChildrenById at the '/duplicate' endpoint filters the query config for tabs, which doesnt normally have a query config.
      // So the query config of the combined component wont be duplicated
      expect(responseAllQueryConfigsAfterDuplicate.body).toHaveLength(7);
    });
    it('/widget/duplicate/:id (Post) duplicate combined component and two childs, one tab without queryconfig', async () => {
      const combinedWid = getWidget([], []);
      combinedWid.name = 'combinedWidget';
      const combinedWidget = await createWidgetByObject(db, combinedWid);
      const combinedTab = await getTab(
        db,
        combinedWidget.id,
        'Kombinierte Komponente',
        undefined,
        undefined,
      );
      const childWid1 = getWidget([], []);
      const childWid2 = getWidget([], []);
      childWid1.name = 'child1';
      childWid2.name = 'child2';

      const childWidget1 = await createWidgetByObject(db, childWid1);
      const childWidget2 = await createWidgetByObject(db, childWid2);

      const childTab1 = await getTab(db, childWidget1.id);
      const childTab2 = await getTab(db, childWidget2.id);

      childTab1.componentType = 'Diagramm';
      childTab1.componentSubType = 'Balken Chart';
      childTab2.componentType = 'Informationen';
      await createTab(db, childTab1);
      await createTab(db, childTab2);
      combinedTab.childWidgets = [childWidget1.id, childWidget2.id];
      await createTab(db, combinedTab);
      const responseAllWidgets = await request(app.getHttpServer())
        .get('/widgets')
        .set('Authorization', `Bearer ${JWTToken}`);
      expect(responseAllWidgets.body).toBeInstanceOf(Array);
      expect(responseAllWidgets.body).toHaveLength(3);

      const responseAllQueryConfigs = await request(app.getHttpServer())
        .get('/query-configs')
        .set('Authorization', `Bearer ${JWTToken}`);
      console.log('queries');
      for (const queries of responseAllQueryConfigs.body) {
        console.log(queries.id);
      }
      expect(responseAllQueryConfigs.body).toBeInstanceOf(Array);
      expect(responseAllQueryConfigs.body).toHaveLength(3);
      await request(app.getHttpServer())
        .post(`/widgets/duplicate/${combinedWidget.id}`)
        .set('Authorization', `Bearer ${JWTToken}`);
      const responseAllWidgetsAfterDuplicate = await request(
        app.getHttpServer(),
      )
        .get('/widgets')
        .set('Authorization', `Bearer ${JWTToken}`);
      expect(responseAllWidgetsAfterDuplicate.body).toBeInstanceOf(Array);
      expect(responseAllWidgetsAfterDuplicate.body).toHaveLength(6);
      const responseAllQueryConfigsAfterDuplicate = await request(
        app.getHttpServer(),
      )
        .get('/query-configs')
        .set('Authorization', `Bearer ${JWTToken}`);
      expect(responseAllQueryConfigsAfterDuplicate.body).toBeInstanceOf(Array);
      // Only expects 4 queries, because Test Environment always creates a query config for a new Tab,
      // but getWidgetWithChildrenById at the '/duplicate' endpoint filters the query config for tabs, which doesnt normally have a query config.
      // So the query configs of the combined component and the information tab wont be duplicated
      expect(responseAllQueryConfigsAfterDuplicate.body).toHaveLength(4);
    });

    it('/widget/duplicate/:id (Post) duplicate combined component with nested combined component', async () => {
      const combinedWid = getWidget([], []);
      combinedWid.name = 'combinedWidget';
      const combinedWidget = await createWidgetByObject(db, combinedWid);
      const combinedTab = await getTab(
        db,
        combinedWidget.id,
        'Kombinierte Komponente',
        undefined,
        undefined,
      );
      const nestedCombinedWid = getWidget([], []);
      nestedCombinedWid.name = 'nestedCombinedWidget';
      const nestedCombinedWidget = await createWidgetByObject(
        db,
        nestedCombinedWid,
      );
      const nestedCombinedTab = await getTab(
        db,
        nestedCombinedWidget.id,
        'Kombinierte Komponente',
        undefined,
        undefined,
      );

      const childWidget1 = await createWidgetByObject(db, getWidget([], []));
      const childWidget2 = await createWidgetByObject(db, getWidget([], []));
      const childWidget3 = await createWidgetByObject(db, getWidget([], []));

      const childTab1 = await getTab(db, childWidget1.id);
      const childTab2 = await getTab(db, childWidget2.id);
      const childTab3 = await getTab(db, childWidget3.id);

      childTab1.componentType = 'Diagramm';
      childTab1.componentSubType = 'Balken Chart';
      childTab2.componentType = 'Wert';
      childTab3.componentType = 'Diagramm';
      childTab3.componentSubType = 'Linien Chart';

      await createTab(db, childTab1);
      await createTab(db, childTab2);
      await createTab(db, childTab3);

      nestedCombinedTab.childWidgets = [childWidget1.id, childWidget2.id];
      await createTab(db, nestedCombinedTab);
      combinedTab.childWidgets = [nestedCombinedWidget.id, childWidget3.id];
      await createTab(db, combinedTab);
      const responseAllWidgets = await request(app.getHttpServer())
        .get('/widgets')
        .set('Authorization', `Bearer ${JWTToken}`);
      expect(responseAllWidgets.body).toBeInstanceOf(Array);
      expect(responseAllWidgets.body).toHaveLength(5);

      const responseAllQueryConfigs = await request(app.getHttpServer())
        .get('/query-configs')
        .set('Authorization', `Bearer ${JWTToken}`);
      expect(responseAllQueryConfigs.body).toBeInstanceOf(Array);
      expect(responseAllQueryConfigs.body).toHaveLength(5);
      await request(app.getHttpServer())
        .post(`/widgets/duplicate/${combinedWidget.id}`)
        .set('Authorization', `Bearer ${JWTToken}`);
      const responseAllWidgetsAfterDuplicate = await request(
        app.getHttpServer(),
      )
        .get('/widgets')
        .set('Authorization', `Bearer ${JWTToken}`);
      expect(responseAllWidgetsAfterDuplicate.body).toBeInstanceOf(Array);
      expect(responseAllWidgetsAfterDuplicate.body).toHaveLength(10);

      const responseAllQueryConfigsAfterDuplicate = await request(
        app.getHttpServer(),
      )
        .get('/query-configs')
        .set('Authorization', `Bearer ${JWTToken}`);
      expect(responseAllQueryConfigsAfterDuplicate.body).toBeInstanceOf(Array);
      // Only expects 8 queries, because Test Environment always creates a query config for a new Tab,
      // but getWidgetWithChildrenById at the '/duplicate' endpoint filters the query config for tabs, which doesnt normally have a query config.
      // So the query configs of the two combined component wont be duplicated
      expect(responseAllQueryConfigsAfterDuplicate.body).toHaveLength(8);
    });
  });
});
