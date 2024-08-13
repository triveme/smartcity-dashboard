import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DashboardServiceModule } from '../../dashboard-service.module';
import { queries } from '@app/postgres-db/schemas/query.schema';
import {
  runLocalDatabasePreparation,
  truncateTables,
} from '../../../../test/database-operations/prepare-database';
import { createQuery, getNGSIQuery } from './test-data';
import { Client } from 'pg';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { createQueryConfig } from '../../query-config/test/test-data';

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

  describe('Queries', () => {
    // create
    it('/queries (POST)', async () => {
      const queryConfig = await createQueryConfig(db);
      const query = getNGSIQuery(queryConfig.id);

      const response = await request(app.getHttpServer())
        .post('/queries')
        .send(query)
        .expect(201);

      // ignore timestamps for matchers
      delete query.createdAt;
      delete query.updatedAt;

      expect(response.body).toMatchObject(query);
    });

    // getAll
    it('/queries (GET)', async () => {
      const query = await createQuery(db);

      const response = await request(app.getHttpServer()).get('/queries');
      expect(response.body).toBeInstanceOf(Array);

      const attributeNames = Object.keys(queries);

      for (const query of response.body) {
        for (const attributeName of attributeNames) {
          expect(query).toHaveProperty(attributeName);

          const columnDefinition = queries[attributeName];
          if (columnDefinition.notNull) {
            expect(queries[attributeName]).not.toBeNull();
          }
        }
      }

      const responseIds = response.body.map((query) => query.id);
      expect(responseIds).toContain(query.id);
    });

    // getById
    it('/queries/:id (GET)', async () => {
      const query = await createQuery(db);

      const response = await request(app.getHttpServer()).get(
        '/queries/' + query.id,
      );

      const attributeNames = Object.keys(queries);

      for (const attributeName of attributeNames) {
        expect(response.body).toHaveProperty(attributeName);

        const columnDefinition = queries[attributeName];
        if (columnDefinition.notNull) {
          expect(response.body[attributeName]).not.toBeNull();
        }
      }
    });

    // update
    it('/queries/:id (PATCH)', async () => {
      const query = await createQuery(db);

      const updatedQuery = {
        queryData: {
          key1: 'value1-updated',
          key2: 'value2-updated',
        },
        updateMessage: ['message1-updated', 'message2-updated'],
      };

      const response = await request(app.getHttpServer())
        .patch('/queries/' + query.id)
        .send(updatedQuery)
        .expect(200);

      expect(response.body).toMatchObject(updatedQuery);
    });

    // delete
    it('/queries/:id (DELETE)', async () => {
      const query = await createQuery(db);

      await request(app.getHttpServer())
        .delete('/queries/' + query.id)
        .expect(200);

      await request(app.getHttpServer())
        .get('/data-sources' + query.id)
        .expect(404);
    });
  });
});
