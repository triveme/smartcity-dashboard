import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DashboardServiceModule } from '../../dashboard-service.module';
import { widgetsToPanels } from '@app/postgres-db/schemas/dashboard.widget-to-panel.schema';
import { widgets } from '@app/postgres-db/schemas/dashboard.widget.schema';
import {
  runLocalDatabasePreparation,
  truncateTables,
} from '../../../../test/database-operations/prepare-database';
import {
  createWidgetByObject,
  createWidgetToPanelRelation,
  getWidget,
} from '../../widget/test/test-data';
import { Client } from 'pg';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { createPanelByObject, getPanel } from '../../panel/test/test-data';
import { v4 as uuid } from 'uuid';
import { generateJWTToken } from '../../../../test/jwt-token-util';

describe('WidgetToPanelService (e2e)', () => {
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

  describe('Widgets to panels', () => {
    // create
    it('/widgets-to-panels (POST)', async () => {
      const panel = await createPanelByObject(db, getPanel());
      const widget = await createWidgetByObject(db, getWidget([], []));

      const widgetToPanel = {
        widgetId: widget.id,
        panelId: panel.id,
        position: 12345,
      };

      const result = await request(app.getHttpServer())
        .post('/widgets-to-panels')
        .send(widgetToPanel)
        .expect(201);

      expect(result.body).toEqual(widgetToPanel);
    });

    // getAll
    it('/widgets-to-panels (GET)', async () => {
      const panel = await createPanelByObject(db, getPanel());
      await createWidgetByObject(db, getWidget([], []), panel.id);

      const response = await request(app.getHttpServer())
        .get('/widgets-to-panels')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(1);

      const attributeNames = Object.keys(widgetsToPanels);

      for (const widgetToPanel of response.body) {
        for (const attributeName of attributeNames) {
          expect(widgetToPanel).toHaveProperty(attributeName);

          const columnDefinition = widgetsToPanels[attributeName];
          if (columnDefinition.notNull) {
            expect(widgetToPanel[attributeName]).not.toBeNull();
          }
        }
      }
    });

    // getWidgetByPanelId
    it('/widgets/panel:id (GET)', async () => {
      const panel = await createPanelByObject(db, getPanel());
      await createWidgetByObject(db, getWidget([], []), panel.id);
      await createWidgetByObject(db, getWidget([], []), panel.id);
      await createWidgetByObject(db, getWidget([], []), panel.id);

      const response = await request(app.getHttpServer())
        .get('/widgets/panel/' + panel.id) // was panelIds[i]
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(200);

      const attributeNames = Object.keys(widgets);

      for (const attributeName of attributeNames) {
        expect(response.body[0]).toHaveProperty(attributeName);

        const columnDefinition = widgets[attributeName];
        if (columnDefinition.notNull) {
          expect(response.body[0][attributeName]).not.toBeNull();
        }
      }
    });

    it('/widgets/panel:id (GET) without widgets to find', async () => {
      const panel = await createPanelByObject(db, getPanel());

      await request(app.getHttpServer())
        .get('/widgets/panel/' + panel.id) // was panelIds[i]
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(200);
    });

    it('/widgets-to-panels (PATCH)', async () => {
      const panel = await createPanelByObject(db, getPanel());
      const updatePanel = await createPanelByObject(db, getPanel());
      const widget = await createWidgetByObject(db, getWidget([], []));
      createWidgetToPanelRelation(db, widget.id, panel.id);

      const widgetToPanel = {
        widgetId: widget.id,
        panelId: updatePanel.id,
        position: 12345,
      };

      const result = await request(app.getHttpServer())
        .patch(`/widgets-to-panels/${widget.id}/${panel.id}`)
        .send(widgetToPanel)
        .expect(200);

      expect(result.body).toEqual(widgetToPanel);
    });

    it('/widgets-to-panels (PATCH) but not found', async () => {
      const widgetToPanel = {
        widgetId: uuid(),
        panelId: uuid(),
        position: 12345,
      };

      await request(app.getHttpServer())
        .patch(`/widgets-to-panels/${uuid()}/${uuid()}`)
        .send(widgetToPanel)
        .expect(404);
    });

    it('/widgets-to-panels (BULK PATCH)', async () => {
      const panel1 = await createPanelByObject(db, getPanel());
      const widget1 = await createWidgetByObject(db, getWidget([], []));
      createWidgetToPanelRelation(db, widget1.id, panel1.id);

      const panel2 = await createPanelByObject(db, getPanel());
      const widget2 = await createWidgetByObject(db, getWidget([], []));
      createWidgetToPanelRelation(db, widget2.id, panel2.id);

      const widgetToPanel = [
        {
          widgetId: widget1.id,
          panelId: panel1.id,
          position: 1234,
        },
        {
          widgetId: widget2.id,
          panelId: panel2.id,
          position: 1235,
        },
      ];

      const result = await request(app.getHttpServer())
        .patch(`/widgets-to-panels/bulk-update`)
        .send(widgetToPanel)
        .expect(200);

      expect(result.body).toEqual(widgetToPanel);
    });

    it('/widgets-to-panels (BULK PATCH) but not found', async () => {
      const widgetToPanel = [
        {
          widgetId: uuid(),
          panelId: uuid(),
          position: 1234,
        },
      ];

      await request(app.getHttpServer())
        .patch(`/widgets-to-panels/bulk-update`)
        .send(widgetToPanel)
        .expect(404);
    });

    it('/widgets-to-panels (DELETE)', async () => {
      const panel = await createPanelByObject(db, getPanel());
      const widget = await createWidgetByObject(db, getWidget([], []));
      await createWidgetToPanelRelation(db, widget.id, panel.id);

      const result = await request(app.getHttpServer())
        .delete(`/widgets-to-panels/${widget.id}/${panel.id}`)
        .expect(200);

      expect(result.body).toEqual({
        widgetId: widget.id,
        panelId: panel.id,
        position: null,
      });
    });

    it('/widgets-to-panels (DELETE) but not found', async () => {
      await request(app.getHttpServer())
        .delete(`/widgets-to-panels/${uuid()}/${uuid()}`)
        .expect(404);
    });
  });
});
