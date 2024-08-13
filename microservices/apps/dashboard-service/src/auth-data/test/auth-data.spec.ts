import { INestApplication } from '@nestjs/common';
import { Client } from 'pg';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { Test, TestingModule } from '@nestjs/testing';
import { DashboardServiceModule } from '../../dashboard-service.module';
import {
  runLocalDatabasePreparation,
  truncateTables,
} from '../../../../test/database-operations/prepare-database';
import { createAuthDataByObject, getAuthDataValue } from './test-data';
import * as request from 'supertest';
import {
  createDataSourceByObject,
  getDataSource,
} from '../../data-source/test/test-data';
import axios from 'axios';
import { EncryptionUtil } from '../../util/encryption.util';
import { AuthData } from '@app/postgres-db/schemas/auth-data.schema';

describe('AuthDatas (e2e)', () => {
  let app: INestApplication;
  let client: Client;
  let db: DbType;
  let JWTToken = null;

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

  describe('Auth Datas', () => {
    it('/auth-datas (POST)', async () => {
      const authData = getAuthDataValue();

      const response = await request(app.getHttpServer())
        .post('/auth-datas')
        .send(authData)
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(201);

      delete response.body.createdAt;
      delete response.body.updatedAt;

      const responseAuthData = response.body;
      assertAuthDataMatches(authData, responseAuthData);
    });

    it('/auth-datas (GET)', async () => {
      const authDataValue = getAuthDataValue();
      authDataValue.clientSecret = EncryptionUtil.encryptPassword(
        authDataValue.clientSecret as string,
      );
      authDataValue.appUserPassword = EncryptionUtil.encryptPassword(
        authDataValue.appUserPassword as string,
      );

      const authDataObject = await createAuthDataByObject(db, authDataValue);

      const response = await request(app.getHttpServer())
        .get('/auth-datas')
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(200);

      const resultBody = response.body;

      delete resultBody[0].createdAt;
      delete resultBody[0].updatedAt;

      expect(resultBody.length).toBe(1);
      assertAuthDataMatches(authDataObject, resultBody[0]);
    });

    it('/auth-datas/:id (GET)', async () => {
      const authDataValue = getAuthDataValue();
      authDataValue.clientSecret = EncryptionUtil.encryptPassword(
        authDataValue.clientSecret as string,
      );
      authDataValue.appUserPassword = EncryptionUtil.encryptPassword(
        authDataValue.appUserPassword as string,
      );

      const authDataObject = await createAuthDataByObject(db, authDataValue);

      const response = await request(app.getHttpServer())
        .get(`/auth-datas/${authDataObject.id}`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(200);

      const resultBody = response.body;

      delete resultBody.createdAt;
      delete resultBody.updatedAt;

      assertAuthDataMatches(authDataObject, resultBody);
    });

    it('/auth-datas (PATCH)', async () => {
      const authDataValue = getAuthDataValue();
      authDataValue.clientSecret = EncryptionUtil.encryptPassword(
        authDataValue.clientSecret as string,
      );
      authDataValue.appUserPassword = EncryptionUtil.encryptPassword(
        authDataValue.appUserPassword as string,
      );

      const authDataObject = await createAuthDataByObject(db, authDataValue);
      await createDataSourceByObject(
        db,
        await getDataSource(authDataObject.id, db, 'ngsi-v2'),
      );

      const updateValues = {
        name: 'Updated Auth Data Name',
      };

      const response = await request(app.getHttpServer())
        .patch(`/auth-datas/${authDataObject.id}`)
        .send(updateValues)
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(200);

      expect(response.body['name']).toEqual(updateValues.name);
    });

    it('/auth-datas (DELETE)', async () => {
      const authDataValue = getAuthDataValue();
      authDataValue.clientSecret = EncryptionUtil.encryptPassword(
        authDataValue.clientSecret as string,
      );
      authDataValue.appUserPassword = EncryptionUtil.encryptPassword(
        authDataValue.appUserPassword as string,
      );

      const authDataObject = await createAuthDataByObject(db, authDataValue);

      // Create a related DataSource
      await createDataSourceByObject(
        db,
        await getDataSource(authDataObject.id, db, 'ngsi-v2'),
      );

      const response = await request(app.getHttpServer())
        .delete(`/auth-datas/${authDataObject.id}`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(200);

      delete response.body.createdAt;
      delete response.body.updatedAt;

      assertAuthDataMatches(authDataObject, response.body);
    });
  });
});

function assertAuthDataMatches(
  authData: AuthData,
  responseAuthData: object,
): void {
  expect(authData.id).toEqual(responseAuthData['id']);
  expect(authData.appUser).toEqual(responseAuthData['appUser']);
  expect(authData.tenantAbbreviation).toEqual(
    responseAuthData['tenantAbbreviation'],
  );
  expect(authData.apiUrl).toEqual(responseAuthData['apiUrl']);
  expect(authData.authUrl).toEqual(responseAuthData['authUrl']);
  expect(authData.clientId).toEqual(responseAuthData['clientId']);
  expect(authData.liveUrl).toEqual(responseAuthData['liveUrl']);
  expect(authData.timeSeriesUrl).toEqual(responseAuthData['timeSeriesUrl']);
  expect(authData.name).toEqual(responseAuthData['name']);
}
