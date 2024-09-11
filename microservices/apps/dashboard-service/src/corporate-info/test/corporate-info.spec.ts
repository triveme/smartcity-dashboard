import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DashboardServiceModule } from '../../dashboard-service.module';
import {
  createCorporateInfoByObject,
  createCorporateInfoSidebarLogoRelationsByObject,
  getCorporateInfo,
  getCorporateInfoSidebarLogoRelationsByCorporateInfoId,
  getCorporateInfoWithLogos,
} from './test-data';
import { corporateInfos } from '@app/postgres-db/schemas/corporate-info.schema';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { createTenantByObject, getTenant } from '../../tenant/test/test-data';
import {
  runLocalDatabasePreparation,
  truncateTables,
} from '../../../../test/database-operations/prepare-database';
import { Client } from 'pg';
import { createLogoByObject, getLogo } from '../../logo/test/test-data';

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

  describe('CorporateInfos', () => {
    // create
    it('/corporate-infos (POST)', async () => {
      const logo = await createLogoByObject(db, getLogo(), true);
      const corporateInfo = getCorporateInfo(logo.id);

      const response = await request(app.getHttpServer())
        .post('/corporate-infos')
        .send(corporateInfo)
        .expect(201);

      expect(response.body).toMatchObject(corporateInfo);
    });

    // create
    it('/corporate-infos (POST) with empty sidebar logos', async () => {
      await createTenantByObject(db, getTenant());
      await createLogoByObject(db, getLogo());
      const corporateInfo = getCorporateInfoWithLogos();
      corporateInfo.sidebarLogos = [];

      const response = await request(app.getHttpServer())
        .post('/corporate-infos')
        .send(corporateInfo)
        .expect(201);

      const attributeNames = Object.keys(corporateInfos);

      for (const attributeName of attributeNames) {
        expect(response.body).toHaveProperty(attributeName);

        const columnDefinition = corporateInfos[attributeName];
        if (columnDefinition.notNull) {
          expect(corporateInfos[attributeName]).not.toBeNull();
        }
      }
    });

    // create
    it('/corporate-infos (POST) with sidebar logos', async () => {
      await createTenantByObject(db, getTenant());
      await createLogoByObject(db, getLogo());
      const corporateInfo = getCorporateInfoWithLogos();

      const response = await request(app.getHttpServer())
        .post('/corporate-infos')
        .send(corporateInfo)
        .expect(201);

      const attributeNames = Object.keys(corporateInfos);

      for (const attributeName of attributeNames) {
        expect(response.body).toHaveProperty(attributeName);

        const columnDefinition = corporateInfos[attributeName];
        if (columnDefinition.notNull) {
          expect(corporateInfos[attributeName]).not.toBeNull();
        }
      }
    });

    // getAll
    it('/corporate-infos (GET)', async () => {
      const corporateInfo = await createCorporateInfoByObject(
        db,
        getCorporateInfo(),
      );

      const response = await request(app.getHttpServer()).get(
        '/corporate-infos',
      );

      expect(response.body).toBeInstanceOf(Array);

      const attributeNames = Object.keys(corporateInfos);

      for (const coporateInfo of response.body) {
        for (const attributeName of attributeNames) {
          expect(coporateInfo).toHaveProperty(attributeName);

          const columnDefinition = coporateInfo[attributeName];
          if (columnDefinition && columnDefinition.notNull) {
            expect(coporateInfo[attributeName]).not.toBeNull();
          }
        }
      }

      const responseIds = response.body.map((coporateInfo) => coporateInfo.id);
      expect(responseIds).toContain(corporateInfo.id);
    });

    it('/corporate-infos (GET) with logos', async () => {
      const corporateInfo = await createCorporateInfoByObject(
        db,
        getCorporateInfo(),
      );

      const response = await request(app.getHttpServer()).get(
        '/corporate-infos?includeLogos=true',
      );

      expect(response.body).toBeInstanceOf(Array);

      const attributeNames = Object.keys(corporateInfos);

      for (const coporateInfo of response.body) {
        for (const attributeName of attributeNames) {
          expect(coporateInfo).toHaveProperty(attributeName);

          const columnDefinition = coporateInfo[attributeName];
          if (columnDefinition && columnDefinition.notNull) {
            expect(coporateInfo[attributeName]).not.toBeNull();
          }
        }
      }

      const responseIds = response.body.map((coporateInfo) => coporateInfo.id);
      expect(responseIds).toContain(corporateInfo.id);
    });

    // getById
    it('/corporate-infos/:id (GET)', async () => {
      const corporateInfo = await createCorporateInfoByObject(
        db,
        getCorporateInfo(),
      );

      const response = await request(app.getHttpServer()).get(
        '/corporate-infos/' + corporateInfo.id,
      );

      const attributeNames = Object.keys(corporateInfos);

      for (const attributeName of attributeNames) {
        expect(response.body).toHaveProperty(attributeName);

        const columnDefinition = corporateInfos[attributeName];
        if (columnDefinition.notNull) {
          expect(response.body[attributeName]).not.toBeNull();
        }
      }
    });

    // update
    it('/corporate-infos/:id (PATCH)', async () => {
      const corporateInfo = await createCorporateInfoByObject(
        db,
        getCorporateInfo(),
      );
      const updateCoporateInfo = {
        logo: 'https://example-updated.com/logo.png',
        dashboardPrimaryColor: 'https://example-updated.com/dashboard_bg.jpg',
        widgetPrimaryColor: 'https://example-updated.com/widget_bg.jpg',
        panelPrimaryColor: 'https://example-updated.com/panel_bg.jpg',
        fontColor: '#222',
        titleBar: 'Dark',
      };

      const response = await request(app.getHttpServer())
        .patch('/corporate-infos/' + corporateInfo.id)
        .send(updateCoporateInfo)
        .expect(200);

      expect(response.body).toMatchObject(updateCoporateInfo);
    });

    it('/corporate-infos/:id (PATCH) add sidebar logo to corporate info', async () => {
      const corporateInfo = await createCorporateInfoByObject(
        db,
        getCorporateInfo(),
      );
      const logo = await createLogoByObject(db, getLogo());

      const updateCorporateInfo = {
        sidebarLogos: [
          {
            ...logo,
            order: 1,
          },
        ],
      };

      await request(app.getHttpServer())
        .patch('/corporate-infos/' + corporateInfo.id)
        .send(updateCorporateInfo)
        .expect(200);

      const corporateInfoRelations =
        await getCorporateInfoSidebarLogoRelationsByCorporateInfoId(
          db,
          corporateInfo.id,
        );
      expect(corporateInfoRelations).toHaveLength(1);
      expect(corporateInfoRelations[0]).toEqual({
        corporateInfoId: corporateInfo.id,
        logoId: logo.id,
        order: 1,
      });
    });

    it('/corporate-infos/:id (PATCH) add sidebar logo to existing logos', async () => {
      const corporateInfo = await createCorporateInfoByObject(
        db,
        getCorporateInfo(),
      );
      const logoValue = getLogo();
      logoValue.logoName = 'test logo 2';
      const logo1 = await createLogoByObject(db, logoValue);
      const logo2 = await createLogoByObject(db, getLogo());

      await createCorporateInfoSidebarLogoRelationsByObject(db, {
        corporateInfoId: corporateInfo.id,
        logoId: logo1.id,
        order: 1,
      });

      const updateCorporateInfo = {
        sidebarLogos: [
          {
            ...logo1,
            order: 1,
          },
          {
            ...logo2,
            order: 2,
          },
        ],
      };

      await request(app.getHttpServer())
        .patch('/corporate-infos/' + corporateInfo.id)
        .send(updateCorporateInfo)
        .expect(200);

      const corporateInfoRelations =
        await getCorporateInfoSidebarLogoRelationsByCorporateInfoId(
          db,
          corporateInfo.id,
        );
      expect(corporateInfoRelations).toHaveLength(2);
      expect(corporateInfoRelations[0]).toEqual({
        corporateInfoId: corporateInfo.id,
        logoId: logo1.id,
        order: 1,
      });
      expect(corporateInfoRelations[1]).toEqual({
        corporateInfoId: corporateInfo.id,
        logoId: logo2.id,
        order: 2,
      });
    });

    it('/corporate-infos/:id (PATCH) remove sidebar logo from existing logos', async () => {
      const corporateInfo = await createCorporateInfoByObject(
        db,
        getCorporateInfo(),
      );
      const logoValue = getLogo();
      logoValue.logoName = 'test logo 2';
      const logo1 = await createLogoByObject(db, logoValue);
      const logo2 = await createLogoByObject(db, getLogo());

      await createCorporateInfoSidebarLogoRelationsByObject(db, {
        corporateInfoId: corporateInfo.id,
        logoId: logo1.id,
        order: 1,
      });
      await createCorporateInfoSidebarLogoRelationsByObject(db, {
        corporateInfoId: corporateInfo.id,
        logoId: logo2.id,
        order: 2,
      });

      const updateCorporateInfo = {
        sidebarLogos: [
          {
            ...logo2,
            order: 2,
          },
        ],
      };

      await request(app.getHttpServer())
        .patch('/corporate-infos/' + corporateInfo.id)
        .send(updateCorporateInfo)
        .expect(200);

      const corporateInfoRelations =
        await getCorporateInfoSidebarLogoRelationsByCorporateInfoId(
          db,
          corporateInfo.id,
        );
      expect(corporateInfoRelations).toHaveLength(1);
      expect(corporateInfoRelations[0]).toEqual({
        corporateInfoId: corporateInfo.id,
        logoId: logo2.id,
        order: 2,
      });
    });

    // delete
    it('/corporate-infos/:id (DELETE)', async () => {
      const corporateInfo = await createCorporateInfoByObject(
        db,
        getCorporateInfo(),
      );

      await request(app.getHttpServer())
        .delete('/corporate-infos/' + corporateInfo.id)
        .expect(200);

      await request(app.getHttpServer())
        .get('/corporate-infos' + corporateInfo.id)
        .expect(404);
    });

    it('/corporate-infos/:id (DELETE) with sidebar logos', async () => {
      const corporateInfo = await createCorporateInfoByObject(
        db,
        getCorporateInfo(),
      );
      await createLogoByObject(db, getLogo());

      await request(app.getHttpServer())
        .delete('/corporate-infos/' + corporateInfo.id)
        .expect(200);

      const corporateInfoRelations =
        await getCorporateInfoSidebarLogoRelationsByCorporateInfoId(
          db,
          corporateInfo.id,
        );
      expect(corporateInfoRelations).toHaveLength(0);
    });

    // it('/corporate-infos/:tenantAbbreviation (GET)', async () => {
    //   const tenant = await createTenantByObject(db, getTenant());

    //   const corporateInfoObject1 = getCorporateInfo();
    //   corporateInfoObject1.tenantId = tenant.abbreviation;
    //   const corporateInfo1 = await createCorporateInfoByObject(
    //     db,
    //     corporateInfoObject1,
    //   );

    //   const corporateInfoObject2 = getCorporateInfo();
    //   corporateInfoObject2.tenantId = tenant.abbreviation;
    //   const corporateInfo2 = await createCorporateInfoByObject(
    //     db,
    //     corporateInfoObject2,
    //   );

    //   const response = await request(app.getHttpServer()).get(
    //     `/corporate-infos/tenant/${tenant.abbreviation}`,
    //   );

    //   const responseIds = response.body.map(
    //     (corporateInfo) => corporateInfo.id,
    //   );
    //   expect(responseIds).toHaveLength(2);
    //   expect(responseIds).toContain(corporateInfo1.id);
    //   expect(responseIds).toContain(corporateInfo2.id);
    // });

    it('/corporate-infos/:tenantAbbreviation (GET) with tenant not existing', async () => {
      const response = await request(app.getHttpServer()).get(
        `/corporate-infos/tenant/edag`,
      );

      expect(!response.body);
    });
  });
});
