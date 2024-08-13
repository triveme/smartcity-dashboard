import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DashboardServiceModule } from '../../dashboard-service.module';
import {
  GroupingElement,
  groupingElements,
} from '@app/postgres-db/schemas/dashboard.grouping-element.schema';
import {
  runLocalDatabasePreparation,
  truncateTables,
} from '../../../../test/database-operations/prepare-database';
import { createGroupingElementByObject, getGroupingElement } from './test-data';
import { Client } from 'pg';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  createDashboardByObject,
  getDashboard,
} from '../../dashboard/test/test-data';
import {
  createDashboardToTenant,
  createTenantByObject,
  getTenant,
} from '../../tenant/test/test-data';
import axios from 'axios';

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

  let JWTToken = null;

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

  describe('Grouping-elements', () => {
    // create
    it('/groupingElements (POST)', async () => {
      const groupingElement = await getGroupingElement();

      const result = await request(app.getHttpServer())
        .post('/groupingElements')
        .send(groupingElement)
        .expect(201);

      expect(result.body).toEqual(groupingElement);
    });

    // create
    it('/groupingElements (POST with Tenant Abbreviation)', async () => {
      const tenant = await createTenantByObject(db, getTenant());
      const groupingElement = await getGroupingElement();
      groupingElement.tenantAbbreviation = tenant.abbreviation;

      const result = await request(app.getHttpServer())
        .post('/groupingElements')
        .send(groupingElement)
        .expect(201);

      expect(result.body).toEqual(groupingElement);
    });

    // create
    it('/groupingElements (POST with non-existing Tenant Abbreviation)', async () => {
      const groupingElement = await getGroupingElement();
      groupingElement.tenantAbbreviation = 'edag2';

      await request(app.getHttpServer())
        .post('/groupingElements')
        .send(groupingElement)
        .expect(400);
    });

    // getAll
    it('/groupingElements (GET)', async () => {
      const groupingElement = await createGroupingElementByObject(
        db,
        getGroupingElement(),
      );

      const response = await request(app.getHttpServer())
        .get('/groupingElements')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);

      const attributeNames = Object.keys(groupingElements);

      for (const groupingElement of response.body) {
        for (const attributeName of attributeNames) {
          expect(groupingElement).toHaveProperty(attributeName);

          const columnDefinition = groupingElements[attributeName];
          if (columnDefinition.notNull) {
            expect(groupingElements[attributeName]).not.toBeNull();
          }
        }
      }

      const responseIds = response.body.map(
        (groupingElement) => groupingElement.id,
      );
      expect(responseIds).toContain(groupingElement.id);
    });

    // getById
    it('/groupingElements/:id (GET) regular grouping element', async () => {
      const groupingElement = await createGroupingElementByObject(
        db,
        getGroupingElement(),
      );

      const response = await request(app.getHttpServer())
        .get('/groupingElements/' + groupingElement.id)
        .expect(200);

      const attributeNames = Object.keys(groupingElements);

      for (const attributeName of attributeNames) {
        expect(response.body).toHaveProperty(attributeName);

        const columnDefinition = groupingElements[attributeName];
        if (columnDefinition.notNull) {
          expect(response.body[attributeName]).not.toBeNull();
        }
      }
    });

    // getById
    it('/groupingElements/:id (GET) dashboard grouping element with rights', async () => {
      const dashboard = await createDashboardByObject(
        db,
        getDashboard('test1'),
      );
      const groupingElement = await createGroupingElementByObject(
        db,
        getGroupingElement(true, dashboard.url, null, 0),
      );

      const response = await request(app.getHttpServer())
        .get('/groupingElements/' + groupingElement.id)
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(200);

      const attributeNames = Object.keys(groupingElements);

      for (const attributeName of attributeNames) {
        expect(response.body).toHaveProperty(attributeName);

        const columnDefinition = groupingElements[attributeName];
        if (columnDefinition.notNull) {
          expect(response.body[attributeName]).not.toBeNull();
        }
      }
    });

    // getById
    it('/groupingElements/:id (GET) dashboard grouping element with wrong rights', async () => {
      const dashboardObject = getDashboard('test1');
      dashboardObject.visibility = 'protected';
      dashboardObject.readRoles = ['role-that-not-exists'];
      dashboardObject.writeRoles = ['role-that-not-exists'];
      const dashboard = await createDashboardByObject(db, dashboardObject);
      const groupingElement = await createGroupingElementByObject(
        db,
        getGroupingElement(true, dashboard.url, null, 0),
      );

      await request(app.getHttpServer())
        .get('/groupingElements/' + groupingElement.id)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    // getById
    it('/groupingElements/:id (GET) dashboard grouping element with missing rights', async () => {
      const dashboardObject = getDashboard('test1');
      dashboardObject.visibility = 'protected';
      const dashboard = await createDashboardByObject(db, dashboardObject);
      const groupingElement = await createGroupingElementByObject(
        db,
        getGroupingElement(true, dashboard.url, null, 0),
      );

      await request(app.getHttpServer())
        .get('/groupingElements/' + groupingElement.id)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    // getById
    it('/groupingElements/tenant/:abbreviation (GET) with appropriate rights', async () => {
      const tenant = await createTenantByObject(db, getTenant());
      const dashboard1 = await createDashboardByObject(
        db,
        getDashboard('test1'),
      );
      const dashboardObject2 = getDashboard('test2');
      dashboardObject2.visibility = 'protected';
      dashboardObject2.readRoles = ['role-that-not-exists'];
      dashboardObject2.writeRoles = ['role-that-not-exists'];
      const dashboard2 = await createDashboardByObject(db, dashboardObject2);

      await createDashboardToTenant(db, dashboard1.id, tenant.id);
      await createDashboardToTenant(db, dashboard2.id, tenant.id);

      const groupingElement1 = await createGroupingElementByObject(
        db,
        getGroupingElement(false, null, null, 0, tenant.abbreviation),
      );
      const groupingElement2 = await createGroupingElementByObject(
        db,
        getGroupingElement(
          true,
          dashboard1.url,
          groupingElement1.id,
          0,
          tenant.abbreviation,
        ),
      );
      await createGroupingElementByObject(
        db,
        getGroupingElement(
          true,
          dashboard2.url,
          groupingElement1.id,
          1,
          tenant.abbreviation,
        ),
      );

      const response = await request(app.getHttpServer())
        .get('/groupingElements/tenant/' + groupingElement1.tenantAbbreviation)
        .set('Authorization', `Bearer ${JWTToken}`)
        .expect(200);

      expect(response.body.length).toEqual(1);

      const bodyElement = response.body[0];
      expect(bodyElement.id).toEqual(groupingElement1.id);
      expect(bodyElement.children.length).toEqual(1);
      expect(bodyElement.children[0].id).toEqual(groupingElement2.id);
      expect(bodyElement.children[0].url).toEqual(dashboard1.url);
    });

    // getById
    it('/groupingElements/tenant/:abbreviation (GET) with no result', async () => {
      const response = await request(app.getHttpServer())
        .get('/groupingElements/tenant/not-existing')
        .expect(200);

      expect(response.body.length).toEqual(0);
    });

    // update
    it('/groupingElements/:id (PATCH)', async () => {
      const groupingElement = await createGroupingElementByObject(
        db,
        getGroupingElement(),
      );
      const updateGroupingElement = {
        name: 'Updated Group1',
        color: '#000001',
        gradient: true,
        icon: '/icon',
      };

      const response = await request(app.getHttpServer())
        .patch('/groupingElements/' + groupingElement.id)
        .send(updateGroupingElement)
        .expect(200);

      expect(response.body).toMatchObject(updateGroupingElement);
    });

    // update
    it('/groupingElements/:id (PATCH with Tenant Abbreviation)', async () => {
      const groupingElement = await createGroupingElementByObject(
        db,
        getGroupingElement(),
      );
      const tenant = await createTenantByObject(db, getTenant());

      groupingElement.tenantAbbreviation = tenant.abbreviation;

      const updateGroupingElement = {
        name: 'Updated Group1',
        color: '#000001',
        gradient: true,
        icon: '/icon',
      };

      const response = await request(app.getHttpServer())
        .patch('/groupingElements/' + groupingElement.id)
        .send(updateGroupingElement)
        .expect(200);

      expect(response.body).toMatchObject(updateGroupingElement);
    });

    // update
    it('/groupingElements/:id (PATCH with non-existing Tenant Abbreviation)', async () => {
      const groupingElement = await createGroupingElementByObject(
        db,
        getGroupingElement(),
      );

      const updateGroupingElement = {
        name: 'Updated Group1',
        color: '#000001',
        gradient: true,
        icon: '/icon',
        tenantAbbreviation: 'edag2',
      };

      await request(app.getHttpServer())
        .patch('/groupingElements/' + groupingElement.id)
        .send(updateGroupingElement)
        .expect(400);
    });

    // delete
    it('/groupingElements/:id (DELETE)', async () => {
      const groupingElement = await createGroupingElementByObject(
        db,
        getGroupingElement(),
      );

      await request(app.getHttpServer())
        .delete('/groupingElements/' + groupingElement.id)
        .expect(200);

      await request(app.getHttpServer())
        .get('/groupingElements' + groupingElement.id)
        .expect(404);
    });
  });

  it('/groupingElements/:id (DELETE) with children', async () => {
    const groupingElement = await createGroupingElementByObject(
      db,
      getGroupingElement(),
    );
    await createGroupingElementByObject(
      db,
      getGroupingElement(false, 'url2', groupingElement.id),
    );

    await request(app.getHttpServer())
      .delete('/groupingElements/' + groupingElement.id)
      .expect(200);

    await request(app.getHttpServer())
      .get('/groupingElements' + groupingElement.id)
      .expect(404);
  });

  it('rearranges children when converting grouping element to dashboard', async () => {
    const groupingElement1 = await createGroupingElementByObject(
      db,
      getGroupingElement(),
    );
    const groupingElement2 = await createGroupingElementByObject(
      db,
      getGroupingElement(false, 'test1', groupingElement1.id, 0),
    );
    const groupingElement3 = await createGroupingElementByObject(
      db,
      getGroupingElement(true, 'test2', groupingElement2.id, 0),
    );

    const dashboard = await createDashboardByObject(
      db,
      getDashboard(groupingElement3.url),
    );

    const updateGroupingElement: GroupingElement = {
      name: 'Updated Group1',
      color: '#000001',
      gradient: true,
      icon: '/icon',
      isDashboard: true,
      url: 'test2',
    };

    await request(app.getHttpServer())
      .patch('/groupingElements/' + groupingElement2.id)
      .set('Authorization', `Bearer ${JWTToken}`)
      .send(updateGroupingElement)
      .expect(200);

    const response = await request(app.getHttpServer())
      .get('/groupingElements')
      .set('Authorization', `Bearer ${JWTToken}`)
      .expect(200);

    expect(response.body[0].children[1].url).toEqual(`${dashboard.url}`);
    expect(response.body[0].children[1].position).toEqual(1);
    expect(response.body[0].children[0].url).toEqual(`${dashboard.url}`);
    expect(response.body[0].children[0].position).toEqual(0);
  });

  it('gets only the grouping elements with appropriate rights', async () => {
    const dashboard1 = await createDashboardByObject(db, getDashboard('test1'));
    const dashboardObject2 = getDashboard('test2');
    dashboardObject2.visibility = 'protected';
    dashboardObject2.readRoles = ['role-that-not-exists'];
    dashboardObject2.writeRoles = ['role-that-not-exists'];
    const dashboard2 = await createDashboardByObject(db, dashboardObject2);
    const groupingElement1 = await createGroupingElementByObject(
      db,
      getGroupingElement(),
    );
    const groupingElement2 = await createGroupingElementByObject(
      db,
      getGroupingElement(true, dashboard1.url, groupingElement1.id, 0),
    );
    await createGroupingElementByObject(
      db,
      getGroupingElement(true, dashboard2.url, groupingElement1.id, 1),
    );

    const response = await request(app.getHttpServer())
      .get('/groupingElements')
      .set('Authorization', `Bearer ${JWTToken}`)
      .expect(200);

    expect(response.body.length).toBe(1);
    expect(response.body[0].children.length).toBe(1);
    expect(response.body[0].children[0].id).toBe(groupingElement2.id);
    expect(response.body[0].children[0].url).toBe(dashboard1.url);
  });
});
