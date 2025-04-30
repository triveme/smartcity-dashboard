import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { runLocalDatabasePreparation } from '../../../../test/database-operations/prepare-database';
import { Client } from 'pg';
import { systemUsers } from '@app/postgres-db/schemas/tenant.system-user.schema';
import { EncryptionUtil } from '../../../../dashboard-service/src/util/encryption.util';
import { createSystemUser, getSystemUser } from './test-data';
import { OrchideoConnectModule } from '../../api.module';

describe('ApiServiceControllers (e2e)', () => {
  let app: INestApplication;
  let client: Client;
  let db: DbType;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [OrchideoConnectModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    client = await runLocalDatabasePreparation();

    db = module.get<DbType>(POSTGRES_DB);
  });

  beforeEach(async () => {
    // I get an unusual syntax error when I add 'system_user' to the truncateTables method, so I hardcode it here
    await client.query(`TRUNCATE TABLE public."system_user" CASCADE`);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('SystemUsers', () => {
    // create system user
    it('/systemUsers (POST)', async () => {
      const systemUser = getSystemUser();

      const response = await request(app.getHttpServer())
        .post('/systemUsers')
        .set('password', `${systemUser.password}`)
        .send(systemUser)
        .expect(201);

      // Decrypt the password from the response
      const responsePassword = response.body.password;
      const decryptedPassword = EncryptionUtil.decryptPassword(
        responsePassword as any,
      );

      // Create the expected user object without the password field
      const expectedUser = {
        id: expect.any(String), // Allow any string for the id
        tenantAbbreviation: systemUser.tenantAbbreviation,
        username: systemUser.username,
        password: decryptedPassword, // Update the expected password to match decrypted one
      };

      // Remove password field from the actual response for comparison
      const actualResponse = { ...response.body };
      delete actualResponse.password;

      // Create a new expected object without the password field
      const expectedWithoutPassword = { ...expectedUser };
      delete expectedWithoutPassword.password;

      // Check if the response matches the expected object without password
      expect(actualResponse).toMatchObject(expectedWithoutPassword);
    });

    // getAll
    it('/systemUsers (GET)', async () => {
      const systemUser = await createSystemUser(db, getSystemUser());

      const response = await request(app.getHttpServer()).get('/systemUsers');

      expect(response.body).toBeInstanceOf(Array);

      const attributeNames = Object.keys(systemUsers);

      for (const systemUser1 of response.body) {
        for (const attributeName of attributeNames) {
          expect(systemUser1).toHaveProperty(attributeName);

          const columnDefinition = systemUser1[attributeName];
          if (columnDefinition.notNull) {
            expect(systemUser1[attributeName]).not.toBeNull();
          }
        }
      }

      const responseIds = response.body.map((systemUser1) => systemUser1.id);
      expect(responseIds).toContain(systemUser.id);
    });

    // getById
    it('/systemUsers/:id (GET)', async () => {
      const systemUser = await createSystemUser(db, getSystemUser());

      const response = await request(app.getHttpServer()).get(
        '/systemUsers/' + systemUser.id,
      );

      const attributeNames = Object.keys(systemUsers);

      for (const attributeName of attributeNames) {
        expect(response.body).toHaveProperty(attributeName);

        const columnDefinition = systemUsers[attributeName];
        if (columnDefinition.notNull) {
          expect(response.body[attributeName]).not.toBeNull();
        }
      }
    });

    // get by tenant
    it('/systemUsers/tenant/:tenantAbbreviation (GET)', async () => {
      const systemUser = await createSystemUser(db, getSystemUser());

      const response = await request(app.getHttpServer()).get(
        '/systemUsers/tenant/' + systemUser.tenantAbbreviation,
      );

      const attributeNames = Object.keys(systemUsers);

      for (const attributeName of attributeNames) {
        expect(response.body).toHaveProperty(attributeName);

        const columnDefinition = systemUsers[attributeName];
        if (columnDefinition.notNull) {
          expect(response.body[attributeName]).not.toBeNull();
        }
      }
    });

    // delete
    it('/systemUsers/:username (DELETE)', async () => {
      const systemUser = await createSystemUser(db, getSystemUser());

      await request(app.getHttpServer())
        .delete('/systemUsers/' + systemUser.username)
        .expect(200);

      await request(app.getHttpServer())
        .get('/systemUsers' + systemUser.username)
        .expect(404);
    });

    // deleteAll
    it('/systemUsers (DELETE)', async () => {
      await createSystemUser(db, getSystemUser());

      await request(app.getHttpServer()).delete('/systemUsers').expect(200);
    });
  });
});
