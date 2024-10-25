import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DashboardServiceModule } from '../../dashboard-service.module';
import { tenants } from '@app/postgres-db/schemas/tenant.schema';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { dashboardsToTenants } from '@app/postgres-db/schemas/dashboard-to-tenant.schema';
import {
  runLocalDatabasePreparation,
  truncateTables,
} from '../../../../test/database-operations/prepare-database';
import {
  createDashboardByObject,
  getDashboard,
} from '../../dashboard/test/test-data';
import {
  createDashboardToTenant,
  createTenantByObject,
  getTenant,
} from './test-data';
import { Client } from 'pg';
import { edagTemplate } from '../../corporate-info/corporate-info.template';
import { getCorporateInfosByTenantAbbreviation } from '../../corporate-info/test/test-data';

describe('DashboardServiceControllers (e2e)', () => {
  let app: INestApplication;
  let db: DbType;
  let client: Client;

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
  });

  beforeEach(async () => {
    await truncateTables(client);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Tenants', () => {
    // create
    it('/tenants (POST)', async () => {
      const tenant = getTenant();

      const response = await request(app.getHttpServer())
        .post('/tenants')
        .send(tenant)
        .expect(201);

      expect(response.body).toMatchObject(tenant);

      const ciResponse = await request(app.getHttpServer())
        .get(`/corporate-infos/tenant/${response.body.abbreviation}`)
        .expect(200);
      expect(ciResponse.body[0]).toMatchObject({
        ...edagTemplate,
        tenantId: response.body.abbreviation,
      });

      const corporateInfosByTenant =
        await getCorporateInfosByTenantAbbreviation(db, tenant.abbreviation);
      expect(corporateInfosByTenant).toHaveLength(2);
    });

    // getAll
    it('/tenants (GET)', async () => {
      const tenant = await createTenantByObject(db, getTenant());

      const response = await request(app.getHttpServer()).get('/tenants');

      expect(response.body).toBeInstanceOf(Array);

      const attributeNames = Object.keys(tenants);

      for (const tenant of response.body) {
        for (const attributeName of attributeNames) {
          expect(tenant).toHaveProperty(attributeName);

          const columnDefinition = tenant[attributeName];

          if (columnDefinition.notNull) {
            expect(tenant[attributeName]).not.toBeNull();
          }
        }
      }

      const responseIds = response.body.map((tenant) => tenant.id);
      expect(responseIds).toContain(tenant.id);
    });

    // getById
    it('/tenants/:id (GET)', async () => {
      const tenant = await createTenantByObject(db, getTenant());

      const response = await request(app.getHttpServer()).get(
        '/tenants/' + tenant.id,
      );

      const attributeNames = Object.keys(tenants);

      for (const attributeName of attributeNames) {
        expect(response.body).toHaveProperty(attributeName);

        const columnDefinition = tenants[attributeName];
        if (columnDefinition.notNull) {
          expect(response.body[attributeName]).not.toBeNull();
        }
      }
    });

    it('should insert a dashboard_to_tenant relation', async () => {
      const tenant = await createTenantByObject(db, getTenant());
      const dashboard = await createDashboardByObject(db, getDashboard());

      const dashboardToTenant = {
        dashboardId: dashboard.id,
        tenantId: tenant.id,
      };

      await db
        .insert(dashboardsToTenants)
        .values(dashboardToTenant)
        .returning();

      expect(await db.select().from(dashboardsToTenants)).toEqual([
        dashboardToTenant,
      ]);
    });

    it('/tenants/:id?includeDashboards=true (GET)', async () => {
      const tenant = await createTenantByObject(db, getTenant());
      const dashboard = await createDashboardByObject(db, getDashboard());
      await createDashboardToTenant(db, dashboard.id, tenant.id);

      const response = await request(app.getHttpServer()).get(
        '/tenants/' + tenant.id + '?includeDashboards=true',
      );

      expect(response.body.dashboards).toBeInstanceOf(Array);
      expect(response.body.dashboards.length).toBeGreaterThan(0);
      expect(response.body.dashboards[0].id).toEqual(dashboard.id);
    });

    // delete
    it('/tenants/:id (DELETE)', async () => {
      const tenant = await createTenantByObject(db, getTenant());

      await request(app.getHttpServer())
        .delete('/tenants/' + tenant.id)
        .expect(200);

      await request(app.getHttpServer())
        .get('/tenants' + tenant.id)
        .expect(404);
    });

    // delete
    // it('/tenants/:id (DELETE) with corporate infos and logos', async () => {
    //   const tenant = await createTenantByObject(db, getTenant());

    //   const corporateInfo1 = getCorporateInfoWithLogos();
    //   corporateInfo1.tenantId = tenant.abbreviation;
    //   const corporateInfo2 = getCorporateInfoWithLogos();
    //   corporateInfo2.tenantId = tenant.abbreviation;

    //   await createCorporateInfoByObject(db, corporateInfo1);
    //   await createCorporateInfoByObject(db, corporateInfo2);

    //   const logoObject = getLogo();
    //   logoObject.tenantId = tenant.abbreviation;

    //   await createLogoByObject(db, logoObject);

    //   await request(app.getHttpServer())
    //     .delete('/tenants/' + tenant.id)
    //     .expect(200);

    //   await request(app.getHttpServer())
    //     .get('/tenants' + tenant.id)
    //     .expect(404);

    //   const corporateInfosByTenant =
    //     await getCorporateInfosByTenantAbbreviation(db, tenant.abbreviation);
    //   expect(corporateInfosByTenant).toHaveLength(0);

    //   const logoByTenant = await getLogosByTenant(db, tenant.abbreviation);
    //   expect(logoByTenant).toHaveLength(0);
    // });
  });
});
