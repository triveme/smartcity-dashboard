import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DashboardServiceModule } from '../../dashboard-service.module';
import { panels } from '@app/postgres-db/schemas/dashboard.panel.schema';
import {
  runLocalDatabasePreparation,
  truncateTables,
} from '../../../../test/database-operations/prepare-database';
import { createPanelByObject, getPanel } from './test-data';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { Client } from 'pg';
import {
  createDashboardByObject,
  getDashboard,
} from '../../dashboard/test/test-data';
import { v4 as uuid } from 'uuid';

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

  describe('Panels', () => {
    // create
    it('/panels (POST)', async () => {
      const dashboard = await createDashboardByObject(db, getDashboard());
      const panel = getPanel(dashboard.id);

      const response = await request(app.getHttpServer())
        .post('/panels')
        .send(panel)
        .expect(201);

      expect(response.body).toMatchObject(panel);
    });

    // getAll
    it('/panels (GET)', async () => {
      const panel = await createPanelByObject(db, getPanel());

      const response = await request(app.getHttpServer()).get('/panels');
      expect(response.body).toBeInstanceOf(Array);

      const attributeNames = Object.keys(panels);

      for (const panel of response.body) {
        for (const attributeName of attributeNames) {
          expect(panel).toHaveProperty(attributeName);

          const columnDefinition = panels[attributeName];
          if (columnDefinition.notNull) {
            expect(panels[attributeName]).not.toBeNull();
          }
        }
      }

      const responseIds = response.body.map((panel) => panel.id);
      expect(responseIds).toContain(panel.id);
    });

    // getById
    it('/panels/:id (GET)', async () => {
      const panel = await createPanelByObject(db, getPanel());

      const response = await request(app.getHttpServer()).get(
        '/panels/' + panel.id,
      );

      const attributeNames = Object.keys(panels);

      for (const attributeName of attributeNames) {
        expect(response.body).toHaveProperty(attributeName);

        const columnDefinition = panels[attributeName];
        if (columnDefinition.notNull) {
          expect(response.body[attributeName]).not.toBeNull();
        }
      }
    });

    // getByDashboardId
    it('/panels/dashboard/:id (GET)', async () => {
      const dashboard = await createDashboardByObject(db, getDashboard());
      const panel = await createPanelByObject(db, getPanel(dashboard.id));

      const response = await request(app.getHttpServer()).get(
        '/panels/dashboard/' + dashboard.id,
      );

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);

      const attributeNames = Object.keys(panels);

      for (const panel of response.body) {
        for (const attributeName of attributeNames) {
          expect(panel).toHaveProperty(attributeName);

          const columnDefinition = panels[attributeName];
          if (columnDefinition.notNull) {
            expect(panels[attributeName]).not.toBeNull();
          }
        }
      }

      const responseIds = response.body.map((panel) => panel.id);
      expect(responseIds).toContain(panel.id);
    });

    it('/panels/dashboard/:id (GET) no dashboard existing', async () => {
      const response = await request(app.getHttpServer()).get(
        `/panels/dashboard/${uuid()}`,
      );

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(0);
    });

    // update
    it('/panels/:id (PATCH)', async () => {
      const panel = await createPanelByObject(db, getPanel());
      const updatePanel = {
        name: 'Sample Panel updated',
        height: 150,
        width: 150,
      };

      const response = await request(app.getHttpServer())
        .patch('/panels/' + panel.id)
        .send(updatePanel)
        .expect(200);

      expect(response.body).toMatchObject(updatePanel);
    });

    // delete
    it('/panels/:id (DELETE)', async () => {
      const panel = await createPanelByObject(db, getPanel());

      await request(app.getHttpServer())
        .delete('/panels/' + panel.id)
        .expect(200);

      await request(app.getHttpServer())
        .get('/panels' + panel.id)
        .expect(404);
    });
  });
});
