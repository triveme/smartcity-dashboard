import { INestApplication } from '@nestjs/common';
import { Client } from 'pg';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { Test, TestingModule } from '@nestjs/testing';
import { DashboardServiceModule } from '../../dashboard-service.module';
import {
  runLocalDatabasePreparation,
  truncateTables,
} from '../../../../test/database-operations/prepare-database';
import { createGeneralSettingsByObject, getGeneralSetting } from './test-data';
import * as request from 'supertest';
import { createTenantByObject, getTenant } from '../../tenant/test/test-data';
import { GeneralSettings } from '@app/postgres-db/schemas/general-settings.schema';
// import { AuthHelperUtility } from '@app/auth-helper';
import { generateJWTToken } from '../../../../test/jwt-token-util';

describe('GeneralSettingsController (e2e)', () => {
  let app: INestApplication;
  let client: Client;
  let db: DbType;
  let JWTToken = null;
  // let authHelperUtility: AuthHelperUtility;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DashboardServiceModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    client = await runLocalDatabasePreparation();
    db = module.get<DbType>(POSTGRES_DB);
    // authHelperUtility = module.get<AuthHelperUtility>(AuthHelperUtility);
  });

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

  describe('GeneralSettings', () => {
    it('/general-settings (POST)', async () => {
      const tenant = getTenant();
      await createTenantByObject(db, tenant);
      const generalSetting = getGeneralSetting(tenant.abbreviation);

      const response = await request(app.getHttpServer())
        .post('/general-settings')
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(generalSetting)
        .expect(201);

      const responseGeneralSettings = response.body as GeneralSettings;
      assertGeneralSettings(responseGeneralSettings, generalSetting);
    });

    it('/general-settings with missing roles (POST)', async () => {
      // jest.spyOn(authHelperUtility, 'isAdmin').mockReturnValue(false);
      const tenant = getTenant();
      await createTenantByObject(db, tenant);
      const generalSetting = getGeneralSetting(tenant.abbreviation);

      await request(app.getHttpServer())
        .post('/general-settings')
        .send(generalSetting)
        .expect(401);
    });

    it('/general-settings with tenant not existing (POST)', async () => {
      const generalSetting = getGeneralSetting('edag');

      await request(app.getHttpServer())
        .post('/general-settings')
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(generalSetting)
        .expect(404);
    });

    it('/general-settings (GET)', async () => {
      const tenant = getTenant();
      await createTenantByObject(db, tenant);
      const generalSettingValue = getGeneralSetting(tenant.abbreviation);
      const generalSettingObject = await createGeneralSettingsByObject(
        db,
        generalSettingValue,
      );

      const response = await request(app.getHttpServer())
        .get('/general-settings')
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(200);

      const resultBody = response.body;

      expect(resultBody.length).toBe(1);
      assertGeneralSettings(resultBody[0], generalSettingObject);
    });

    it('/general-settings with missing roles (GET)', async () => {
      // jest.spyOn(authHelperUtility, 'isAdmin').mockReturnValue(false);
      const tenant = getTenant();
      await createTenantByObject(db, tenant);
      const generalSettingValue = getGeneralSetting(tenant.abbreviation);
      await createGeneralSettingsByObject(db, generalSettingValue);

      await request(app.getHttpServer()).get('/general-settings').expect(401);
    });

    it('/general-settings/:id (GET)', async () => {
      const tenant = getTenant();
      await createTenantByObject(db, tenant);
      const generalSettingValue = getGeneralSetting(tenant.abbreviation);
      const generalSettingObject = await createGeneralSettingsByObject(
        db,
        generalSettingValue,
      );

      const response = await request(app.getHttpServer())
        .get(`/general-settings/${generalSettingObject.id}`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(200);

      assertGeneralSettings(response.body, generalSettingObject);
    });

    it('/general-settings/:id with missing roles (GET)', async () => {
      // jest.spyOn(authHelperUtility, 'isAdmin').mockReturnValue(false);
      const tenant = getTenant();
      await createTenantByObject(db, tenant);
      const generalSettingValue = getGeneralSetting(tenant.abbreviation);
      await createGeneralSettingsByObject(db, generalSettingValue);

      await request(app.getHttpServer())
        .get(`/general-settings/${generalSettingValue.id}`)
        .expect(401);
    });

    it('/general-settings/:abbreviation (GET)', async () => {
      const tenant = getTenant();
      await createTenantByObject(db, tenant);
      const generalSettingValue = getGeneralSetting(tenant.abbreviation);
      const generalSettingObject = await createGeneralSettingsByObject(
        db,
        generalSettingValue,
      );

      const response = await request(app.getHttpServer())
        .get(`/general-settings/tenant/${generalSettingObject.tenant}`)
        .expect(200);

      const resultBody = response.body;

      assertGeneralSettings(resultBody, generalSettingObject);
    });

    it('/general-settings/:abbreviation Tenant not existing (GET)', async () => {
      const tenant = getTenant();
      await createTenantByObject(db, tenant);
      const generalSettingValue = getGeneralSetting(tenant.abbreviation);
      await createGeneralSettingsByObject(db, generalSettingValue);

      await request(app.getHttpServer())
        .get(`/general-settings/tenant/edag-test`)
        .expect(404);
    });

    it('/general-settings (PATCH)', async () => {
      const tenant = getTenant();
      await createTenantByObject(db, tenant);
      const generalSettingValue = getGeneralSetting(tenant.abbreviation);
      const generalSettingObject = await createGeneralSettingsByObject(
        db,
        generalSettingValue,
      );

      const updateValues = {
        information: 'https://updated.de/imprint-url.html',
      };

      const response = await request(app.getHttpServer())
        .patch(`/general-settings/${generalSettingObject.id}`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .send(updateValues)
        .expect(200);

      expect(response.body['information']).toEqual(updateValues.information);
    });

    it('/general-settings with missing roles (PATCH)', async () => {
      // jest.spyOn(authHelperUtility, 'isAdmin').mockReturnValue(false);
      const tenant = getTenant();
      await createTenantByObject(db, tenant);
      const generalSettingValue = getGeneralSetting(tenant.abbreviation);
      const generalSettingObject = await createGeneralSettingsByObject(
        db,
        generalSettingValue,
      );

      const updateValues = {
        information: 'https://updated.de/imprint-url.html',
      };

      await request(app.getHttpServer())
        .patch(`/general-settings/${generalSettingObject.id}`)
        .send(updateValues)
        .expect(403);
    });

    it('/general-settings (DELETE)', async () => {
      const tenant = getTenant();
      await createTenantByObject(db, tenant);
      const generalSettingValue = getGeneralSetting(tenant.abbreviation);
      const generalSettingObject = await createGeneralSettingsByObject(
        db,
        generalSettingValue,
      );

      const response = await request(app.getHttpServer())
        .delete(`/general-settings/${generalSettingObject.id}`)
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(200);

      assertGeneralSettings(response.body, generalSettingObject);
    });

    it('/general-settings with missing roles (DELETE)', async () => {
      // jest.spyOn(authHelperUtility, 'isAdmin').mockReturnValue(false);
      const tenant = getTenant();
      await createTenantByObject(db, tenant);
      const generalSettingValue = getGeneralSetting(tenant.abbreviation);
      const generalSettingObject = await createGeneralSettingsByObject(
        db,
        generalSettingValue,
      );

      await request(app.getHttpServer())
        .delete(`/general-settings/${generalSettingObject.id}`)
        .expect(401);
    });

    function assertGeneralSettings(
      responseGeneralSettings: GeneralSettings,
      generalSetting: GeneralSettings,
    ): void {
      expect(responseGeneralSettings.id).toBe(generalSetting.id);
      expect(responseGeneralSettings.tenant).toBe(generalSetting.tenant);
      expect(responseGeneralSettings.information).toBe(
        generalSetting.information,
      );
      expect(responseGeneralSettings.imprint).toBe(generalSetting.imprint);
      expect(responseGeneralSettings.privacy).toBe(generalSetting.privacy);
    }
  });
});
