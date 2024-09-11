import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DashboardServiceModule } from '../../dashboard-service.module';
import { tabs } from '@app/postgres-db/schemas/dashboard.tab.schema';
import {
  runLocalDatabasePreparation,
  truncateTables,
} from '../../../../test/database-operations/prepare-database';
import { createTab, getTab } from './test-data';
import { createWidgetByObject, getWidget } from '../../widget/test/test-data';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { Client } from 'pg';
import { createQuery, getNGSILiveQuery } from '../../query/test/test-data';
import { createDataModel } from '../../data-model/test/test-data';

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

  beforeEach(async () => {
    await truncateTables(client);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Tabs', () => {
    // create
    it('/tabs (POST)', async () => {
      const widget = await createWidgetByObject(db, getWidget([], []));
      const tab = await getTab(db, widget.id, 'Diagramm', 'Balken Chart');

      const response = await request(app.getHttpServer())
        .post('/tabs')
        .send(tab)
        .expect(201);

      // delete uncomparable properties from tab
      delete tab.dataModelId;
      delete tab.queryId;

      expect(response.body).toMatchObject(tab);
    });

    // getAll
    it('/tabs (GET)', async () => {
      const widget = await createWidgetByObject(db, getWidget([], []));
      const tab = await createTab(db, await getTab(db, widget.id));

      const response = await request(app.getHttpServer()).get('/tabs');
      expect(response.body).toBeInstanceOf(Array);

      const attributeNames = Object.keys(tabs);

      for (const tab of response.body) {
        for (const attributeName of attributeNames) {
          expect(tab).toHaveProperty(attributeName);

          const columnDefinition = tabs[attributeName];
          if (columnDefinition.notNull) {
            expect(tabs[attributeName]).not.toBeNull();
          }
        }
      }

      const responseIds = response.body.map((tab) => tab.id);
      expect(responseIds).toContain(tab.id);
    });

    // getById
    it('/tabs/:id (GET)', async () => {
      const widget = await createWidgetByObject(db, getWidget([], []));
      const tab = await createTab(db, await getTab(db, widget.id));

      const response = await request(app.getHttpServer()).get(
        '/tabs/' + tab.id,
      );

      const attributeNames = Object.keys(tabs);

      for (const attributeName of attributeNames) {
        expect(response.body).toHaveProperty(attributeName);

        const columnDefinition = tabs[attributeName];
        if (columnDefinition.notNull) {
          expect(response.body[attributeName]).not.toBeNull();
        }
      }
    });

    // getByWidgetId
    it('/tabs/widget/:id (GET)', async () => {
      const widget = await createWidgetByObject(db, getWidget([], []));
      const tab = await createTab(db, await getTab(db, widget.id));

      const response = await request(app.getHttpServer()).get(
        '/tabs/widget/' + widget.id,
      );

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);

      const attributeNames = Object.keys(tabs);

      for (const tab of response.body) {
        for (const attributeName of attributeNames) {
          expect(tab).toHaveProperty(attributeName);

          const columnDefinition = tabs[attributeName];
          if (columnDefinition.notNull) {
            expect(tabs[attributeName]).not.toBeNull();
          }
        }
      }

      const responseIds = response.body.map((tab) => tab.id);
      expect(responseIds).toContain(tab.id);
    });

    // update
    it('/tabs/:id (PATCH)', async () => {
      const widget1 = await createWidgetByObject(db, getWidget([], []));
      const widget2 = await createWidgetByObject(db, getWidget([], []));
      const tab = await createTab(db, await getTab(db, widget1.id));
      const query = await createQuery(db, getNGSILiveQuery());
      const dataModel = await createDataModel(db);

      const updateTab = {
        widgetId: widget2.id,
        queryId: query.id,
        dataModelId: dataModel.id,
      };

      const response = await request(app.getHttpServer())
        .patch('/tabs/' + tab.id)
        .send(updateTab)
        .expect(200);

      expect(response.body).toMatchObject(updateTab);
    });

    // delete
    it('/tabs/:id (DELETE)', async () => {
      const widget = await createWidgetByObject(db, getWidget([], []));
      const tab = await createTab(db, await getTab(db, widget.id));

      await request(app.getHttpServer())
        .delete('/tabs/' + tab.id)
        .expect(200);

      await request(app.getHttpServer())
        .get('/tabs' + tab.id)
        .expect(404);
    });
  });
});
