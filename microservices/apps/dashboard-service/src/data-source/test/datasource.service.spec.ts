import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DashboardServiceModule } from '../../dashboard-service.module';
import { dataSources } from '@app/postgres-db/schemas/data-source.schema';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { authData } from '@app/postgres-db/schemas/auth-data.schema';
import {
  runLocalDatabasePreparation,
  truncateTables,
} from '../../../../test/database-operations/prepare-database';
import { createDataSourceByObject, getDataSource } from './test-data';
import {
  createAuthDataByObject,
  getAuthDataValue,
} from '../../auth-data/test/test-data';
import { Client } from 'pg';
import { v4 as uuid } from 'uuid';
import { createTenantByObject, getTenant } from '../../tenant/test/test-data';

describe('DashboardServiceControllers (e2e)', () => {
  let app: INestApplication;
  let client: Client;
  let db: DbType;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DashboardServiceModule],
      providers: [
        {
          provide: POSTGRES_DB,
          useValue: POSTGRES_DB,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    client = await runLocalDatabasePreparation();
    db = module.get<DbType>(POSTGRES_DB);

    if ((await db.select().from(authData)).length === 0) {
      await db.insert(authData).values(getAuthDataValue()).returning();
    }
  });

  beforeEach(async () => {
    await truncateTables(client);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('DataSources', () => {
    // create
    it('/data-sources (POST)', async () => {
      const dataSource = await getDataSource(undefined, db);

      const response = await request(app.getHttpServer())
        .post('/data-sources')
        .send(dataSource)
        .expect(201);

      expect(response.body).toMatchObject(dataSource);
    });

    it('/data-sources (POST) with non existing auth data id', async () => {
      const dataSource = await getDataSource(uuid(), db);

      await request(app.getHttpServer())
        .post('/data-sources')
        .send(dataSource)
        .expect(404);
    });

    // getAll
    it('/data-sources (GET)', async () => {
      const dataSource = await createDataSourceByObject(
        db,
        await getDataSource(undefined, db, 'api'),
      );

      const response = await request(app.getHttpServer()).get('/data-sources');
      expect(response.body).toBeInstanceOf(Array);

      const attributeNames = Object.keys(dataSources);

      for (const dataSource of response.body) {
        for (const attributeName of attributeNames) {
          expect(dataSource).toHaveProperty(attributeName);

          const columnDefinition = dataSources[attributeName];
          if (columnDefinition.notNull) {
            expect(dataSource[attributeName]).not.toBeNull();
          }
        }
      }

      const responseIds = response.body.map((dataSource) => dataSource.id);
      expect(responseIds).toContain(dataSource.id);
    });

    // getById
    it('/data-sources/:id (GET)', async () => {
      const dataSource = await createDataSourceByObject(
        db,
        await getDataSource(undefined, db, 'api'),
      );

      const response = await request(app.getHttpServer()).get(
        '/data-sources/' + dataSource.id,
      );

      const attributeNames = Object.keys(dataSources);

      for (const attributeName of attributeNames) {
        expect(response.body).toHaveProperty(attributeName);

        const columnDefinition = dataSources[attributeName];
        if (columnDefinition.notNull) {
          expect(response.body[attributeName]).not.toBeNull();
        }
      }
    });

    it('/data-sources/tenant/:tenant (GET)', async () => {
      const tenant = await createTenantByObject(db, getTenant());
      const authDataValue = getAuthDataValue();
      authDataValue.tenantAbbreviation = tenant.abbreviation;
      const authDataObject = await createAuthDataByObject(db, authDataValue);
      const dataSource = await createDataSourceByObject(
        db,
        await getDataSource(authDataObject.id, db, 'api'),
      );

      const response = await request(app.getHttpServer()).get(
        `/data-sources/tenant/${tenant.abbreviation}`,
      );

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toEqual(dataSource.id);
    });

    it('/data-sources/tenant/:tenant (GET) without existing data source to tenant', async () => {
      const tenant = await createTenantByObject(db, getTenant());
      const authDataValue = getAuthDataValue();
      authDataValue.tenantAbbreviation = tenant.abbreviation;
      const authDataObject = await createAuthDataByObject(db, authDataValue);
      await createDataSourceByObject(
        db,
        await getDataSource(authDataObject.id, db, 'api'),
      );

      const response = await request(app.getHttpServer()).get(
        `/data-sources/tenant/test`,
      );

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    // update
    it('/data-sources/:id (PATCH)', async () => {
      const dataSource = await createDataSourceByObject(
        db,
        await getDataSource(undefined, db, 'api'),
      );
      const updateDataSource = {
        name: 'Updated DataSource',
      };

      const response = await request(app.getHttpServer())
        .patch('/data-sources/' + dataSource.id)
        .send(updateDataSource)
        .expect(200);

      expect(response.body).toMatchObject(updateDataSource);
    });

    it('/data-sources/:id (PATCH) with non existing datasource', async () => {
      const updateDataSource = {
        name: 'Updated DataSource',
      };

      await request(app.getHttpServer())
        .patch(`/data-sources/${uuid()}`)
        .send(updateDataSource)
        .expect(404);
    });

    // delete
    it('/data-sources/:id (DELETE)', async () => {
      const dataSource = await createDataSourceByObject(
        db,
        await getDataSource(undefined, db, 'api'),
      );

      await request(app.getHttpServer())
        .delete('/data-sources/' + dataSource.id)
        .expect(200);

      await request(app.getHttpServer())
        .get('/data-sources' + dataSource.id)
        .expect(404);
    });
  });
});
