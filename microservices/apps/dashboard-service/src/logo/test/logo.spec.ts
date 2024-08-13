import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DashboardServiceModule } from '../../dashboard-service.module';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { logos } from '@app/postgres-db/schemas/logo.schema';
import {
  runLocalDatabasePreparation,
  truncateTables,
} from '../../../../test/database-operations/prepare-database';
import { Client } from 'pg';
import { createLogoByObject, getLogo } from './test-data';
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

  beforeEach(async () => {
    await truncateTables(client);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Logos', () => {
    // create
    it('/logos (POST)', async () => {
      const logo = getLogo();
      createTenantByObject(db, getTenant());
      const response = await request(app.getHttpServer())
        .post('/logos')
        .send(logo)
        .expect(201);

      // ignore timestamps and hash for matchers

      expect(response.body).toMatchObject(logo);
    });

    // getAll
    it('/logos (GET)', async () => {
      const logo = await createLogoByObject(db, getLogo(), true);

      const response = await request(app.getHttpServer()).get(
        '/logos?tenant=edag',
      );
      expect(response.body).toBeInstanceOf(Array);

      const attributeNames = Object.keys(logos);

      for (const logo of response.body) {
        for (const attributeName of attributeNames) {
          expect(logo).toHaveProperty(attributeName);

          const columnDefinition = logos[attributeName];
          if (columnDefinition.notNull) {
            expect(logos[attributeName]).not.toBeNull();
          }
        }
      }

      const responseIds = response.body.map((logo) => logo.id);
      expect(responseIds).toContain(logo.id);
    });

    // getById
    it('/logos/:id (GET)', async () => {
      const logo = await createLogoByObject(db, getLogo(), true);

      const response = await request(app.getHttpServer()).get(
        '/logos/' + logo.id,
      );

      const attributeNames = Object.keys(logos);

      for (const attributeName of attributeNames) {
        expect(response.body).toHaveProperty(attributeName);

        const columnDefinition = logos[attributeName];
        if (columnDefinition.notNull) {
          expect(response.body[attributeName]).not.toBeNull();
        }
      }
    });

    // update
    it('/logos/:id (PATCH)', async () => {
      const logo = await createLogoByObject(db, getLogo(), true);

      const updatedLogo = {
        id: logo.id,
        tenantId: 'edag',
        logo: '7',
        logoHeight: 53,
        logoWidth: 63,
        logoName: 'hsgd',
        format: 'dq',
        size: '432f',
      };

      const response = await request(app.getHttpServer())
        .patch('/logos/' + logo.id)
        .send(updatedLogo)
        .expect(200);

      expect(response.body).toMatchObject(updatedLogo);
    });

    // delete
    it('/logos/:id (DELETE)', async () => {
      const logo = await createLogoByObject(db, getLogo(), true);

      await request(app.getHttpServer())
        .delete('/logos/' + logo.id)
        .expect(200);
    });
  });
});
