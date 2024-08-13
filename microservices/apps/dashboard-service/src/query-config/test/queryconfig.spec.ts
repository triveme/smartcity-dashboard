import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DashboardServiceModule } from '../../dashboard-service.module';
import { queryConfigs } from '@app/postgres-db/schemas/query-config.schema';
import {
  runLocalDatabasePreparation,
  truncateTables,
} from '../../../../test/database-operations/prepare-database';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { Client } from 'pg';
import {
  createDataSourceByObject,
  getDataSource,
} from '../../data-source/test/test-data';
import { createQueryConfig, getQueryConfig } from './test-data';

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

  describe('QueryConfigs', () => {
    // create
    it('/query-configs (POST)', async () => {
      const dataSource = await createDataSourceByObject(
        db,
        await getDataSource(undefined, db, 'api'),
      );
      const queryConfig = getQueryConfig(dataSource.id);

      const response = await request(app.getHttpServer())
        .post('/query-configs')
        .send(queryConfig)
        .expect(201);

      // ignore timestamps and hash for matchers
      delete queryConfig.createdAt;
      delete queryConfig.updatedAt;
      delete queryConfig.hash;

      expect(response.body).toMatchObject(queryConfig);
    });

    // getAll
    it('/query-configs (GET)', async () => {
      const queryConfig = await createQueryConfig(db);

      const response = await request(app.getHttpServer()).get('/query-configs');
      expect(response.body).toBeInstanceOf(Array);

      const attributeNames = Object.keys(queryConfigs);

      for (const queryConfig of response.body) {
        for (const attributeName of attributeNames) {
          expect(queryConfig).toHaveProperty(attributeName);

          const columnDefinition = queryConfigs[attributeName];
          if (columnDefinition.notNull) {
            expect(queryConfigs[attributeName]).not.toBeNull();
          }
        }
      }

      const responseIds = response.body.map((queryConfig) => queryConfig.id);
      expect(responseIds).toContain(queryConfig.id);
    });

    // getById
    it('/query-configs/:id (GET)', async () => {
      const queryConfig = await createQueryConfig(db);

      const response = await request(app.getHttpServer()).get(
        '/query-configs/' + queryConfig.id,
      );

      const attributeNames = Object.keys(queryConfigs);

      for (const attributeName of attributeNames) {
        expect(response.body).toHaveProperty(attributeName);

        const columnDefinition = queryConfigs[attributeName];
        if (columnDefinition.notNull) {
          expect(response.body[attributeName]).not.toBeNull();
        }
      }
    });

    // update
    it('/query-configs/:id (PATCH)', async () => {
      const queryConfig = await createQueryConfig(db);

      const updatedQueryConfig = {
        interval: 20,
        fiwareService: 'smartcity-updated',
        fiwareServicePath: '/smartcity/path-updated',
        fiwareType: 'ngsi-updated',
        entityIds: ['entity1-updated', 'entity2-updated'],
        attributes: ['attribute1-updated', 'attribute2-updated'],
        aggrMode: 'max',
        timeframe: 'day',
      };

      const response = await request(app.getHttpServer())
        .patch('/query-configs/' + queryConfig.id)
        .send(updatedQueryConfig)
        .expect(200);

      expect(response.body).toMatchObject(updatedQueryConfig);
    });

    // delete
    it('/query-configs/:id (DELETE)', async () => {
      const queryConfig = await createQueryConfig(db);

      await request(app.getHttpServer())
        .delete('/query-configs/' + queryConfig.id)
        .expect(200);

      await request(app.getHttpServer())
        .get('/data-sources' + queryConfig.id)
        .expect(404);
    });
  });
});
