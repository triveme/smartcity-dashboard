import { INestApplication } from '@nestjs/common';
import { Client } from 'pg';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { Test, TestingModule } from '@nestjs/testing';
import { InfopinServiceModule } from '../../infopin-service.module';
import {
  runLocalDatabasePreparation,
  truncateTables,
} from '../../../../test/database-operations/prepare-database';
import axios from 'axios';
import * as request from 'supertest';
import { v4 as uuid } from 'uuid';
import { createReportByObject, getReport, getReportFromDb } from './test-data';
import * as path from 'node:path';
import * as fs from 'node:fs';

describe('ReportService', () => {
  let app: INestApplication;
  let client: Client;
  let db: DbType;
  let JWTToken = null;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [InfopinServiceModule],
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

  it('should get all active reports', async () => {
    const report = await createReportByObject(db, getReport());
    const report2 = getReport();
    report2.visibility = 'protected';
    report2.readRoles = ['admin'];
    await createReportByObject(db, report2);

    const response = await request(app.getHttpServer())
      .get('/reports')
      .expect(200);

    expect(response.body.length).toBe(1);
    const responseReport = response.body[0];

    // deleting dates, since the types differ while comparing
    delete report.createdAt;
    delete report.updatedAt;

    expect(report.startAt.toISOString()).toMatch(responseReport.startAt);

    // deleting dates, since the types differ while comparing
    delete report.startAt;
    delete report.endAt;

    expect(responseReport).toMatchObject(report);
  });

  it('should get all active reports with category', async () => {
    const report = getReport();

    report.category = 'Klima';
    const klimaReport = await createReportByObject(db, report);

    report.category = 'Oeffentlichkeit';
    await createReportByObject(db, report);

    const response = await request(app.getHttpServer())
      .get('/reports')
      .query({
        category: 'Klima',
      })
      .expect(200);

    expect(response.body.length).toBe(1);
    const responseReport = response.body[0];

    // deleting dates, since the types differ while comparing
    delete klimaReport.createdAt;
    delete klimaReport.updatedAt;

    expect(klimaReport.startAt.toISOString()).toMatch(responseReport.startAt);

    // deleting dates, since the types differ while comparing
    delete klimaReport.startAt;
    delete klimaReport.endAt;

    expect(responseReport).toMatchObject(klimaReport);
  });

  it('should get all active reports with time horizon', async () => {
    const currentDate = new Date();
    const fiveDaysInMilliseconds = 5 * 24 * 60 * 60 * 1000;
    const threeDaysInMilliseconds = 3 * 24 * 60 * 60 * 1000;

    const report = getReport();

    report.startAt = new Date(currentDate.getTime() - fiveDaysInMilliseconds);
    report.endAt = new Date(currentDate.getTime() - threeDaysInMilliseconds);
    const archivedReport = await createReportByObject(db, report);

    report.startAt = new Date(currentDate.getTime() + fiveDaysInMilliseconds);
    report.endAt = new Date(currentDate.getTime() + threeDaysInMilliseconds);
    await createReportByObject(db, report);

    const response = await request(app.getHttpServer())
      .get('/reports')
      .query({
        status: 'archived',
      })
      .expect(200);

    expect(response.body.length).toBe(1);
    const responseReport = response.body[0];

    // deleting dates, since the types differ while comparing
    delete archivedReport.createdAt;
    delete archivedReport.updatedAt;

    expect(archivedReport.startAt.toISOString()).toMatch(
      responseReport.startAt,
    );

    // deleting dates, since the types differ while comparing
    delete archivedReport.startAt;
    delete archivedReport.endAt;

    expect(responseReport).toMatchObject(archivedReport);
  });

  it('should get all reports as admin', async () => {
    const report1 = await createReportByObject(db, getReport());
    const report2 = await createReportByObject(db, getReport());

    const response = await request(app.getHttpServer())
      .get('/reports')
      .set('Authorization', `Bearer ${JWTToken}`)
      .expect(200);

    expect(response.body.length).toBe(2);
    const responseReport1 = response.body[0];
    const responseReport2 = response.body[1];

    // deleting dates, since the types differ while comparing
    delete report1.createdAt;
    delete report1.updatedAt;

    expect(report1.startAt.toISOString()).toMatch(responseReport2.startAt);
    expect(report2.startAt.toISOString()).toMatch(responseReport1.startAt);

    // deleting dates, since the types differ while comparing
    delete report2.startAt;
    delete report2.endAt;
    delete report2.createdAt;
    delete report2.updatedAt;
    delete report1.startAt;
    delete report1.endAt;
    delete report1.createdAt;
    delete report1.updatedAt;

    expect(responseReport1).toMatchObject(report2);
    expect(responseReport2).toMatchObject(report1);
  });

  it('should get active report by id', async () => {
    const report = await createReportByObject(db, getReport());

    const response = await request(app.getHttpServer())
      .get(`/reports/${report.id}`)
      .expect(200);

    const responseReport = response.body;

    // deleting dates, since the types differ while comparing
    delete report.createdAt;
    delete report.updatedAt;

    expect(report.startAt.toISOString()).toMatch(responseReport.startAt);

    // deleting dates, since the types differ while comparing
    delete report.startAt;
    delete report.endAt;

    expect(responseReport).toMatchObject(report);
  });

  it('should get hidden report by id as admin', async () => {
    const report = await createReportByObject(db, getReport());

    const response = await request(app.getHttpServer())
      .get(`/reports/${report.id}`)
      .set('Authorization', `Bearer ${JWTToken}`)
      .expect(200);

    const responseReport = response.body;

    // deleting dates, since the types differ while comparing
    delete report.createdAt;
    delete report.updatedAt;

    expect(report.startAt.toISOString()).toMatch(responseReport.startAt);

    // deleting dates, since the types differ while comparing
    delete report.startAt;
    delete report.endAt;

    expect(responseReport).toMatchObject(report);
  });

  it('should not find hidden report by id', async () => {
    const report = getReport();
    report.visibility = 'protected';
    report.readRoles = ['admin'];
    const reportDb = await createReportByObject(db, report);

    await request(app.getHttpServer())
      .get(`/reports/${reportDb.id}`)
      .expect(403);
  });

  it('should not find not existing report', async () => {
    await request(app.getHttpServer()).get(`/reports/${uuid()}`).expect(404);
  });

  it('should create report', async () => {
    const report = getReport();
    report.id = uuid();

    delete report.createdAt;
    delete report.updatedAt;

    const response = await request(app.getHttpServer())
      .post('/reports')
      .send(report)
      .expect(201);

    const responseValue = response.body;

    expect(responseValue.startAt).toMatch(report.startAt.toISOString());
    expect(responseValue.endAt).toMatch(report.endAt.toISOString());

    // deleting dates, since the types differ while comparing
    delete report.startAt;
    delete report.endAt;

    expect(responseValue).toMatchObject(report);
  });

  it('should create report with image upload', async () => {
    const report = getReport();
    report.id = uuid();

    delete report.createdAt;
    delete report.updatedAt;

    const response = await request(app.getHttpServer())
      .post('/reports')
      .set('Content-Type', 'multipart/form-data')
      .field('id', report.id)
      .field('title', report.title)
      .field('link', 'https://test.at')
      .field('costsInCents', 1000)
      .field('location', '{ "lat": 9.444,"lng": -9.444}')
      .field('category', report.category)
      .field('description', report.description)
      .field('startAt', report.startAt.toISOString())
      .field('endAt', report.endAt.toISOString())
      .field('contactPerson', report.contactPerson)
      .field('county', report.county)
      .field('comment', report.comment)
      .field('adminComment', report.adminComment)
      .field('lastModifiedBy', report.lastModifiedBy)
      .field('redirection', report.redirection)
      .field('address', report.address)
      .field('referenceNumber', report.referenceNumber)
      .field('email', report.email)
      .field('phone', report.phone)
      .field('readRoles', report.readRoles)
      .field('writeRoles', report.writeRoles)
      .field('visibility', report.visibility)
      .attach('file', path.join(__dirname, 'fulda-high-water.jpg'))
      .expect(201);

    const responseValue = response.body;

    expect(responseValue.startAt).toMatch(report.startAt.toISOString());
    expect(responseValue.endAt).toMatch(report.endAt.toISOString());
    expect(responseValue.imgPath).not.toBeNull();

    // deleting dates, since the types differ while comparing
    delete report.startAt;
    delete report.endAt;

    const createdImage = responseValue.imgPath;
    // delete img path, since it now is null
    delete report.imgPath;

    expect(responseValue).toMatchObject(report);

    fs.unlink(createdImage, (err) => {
      if (err) console.error();
    });
  });

  it('should update report', async () => {
    const report = await createReportByObject(db, getReport());

    const updateData = {
      adminComment: 'updated admin comment',
    };

    const response = await request(app.getHttpServer())
      .patch(`/reports/${report.id}`)
      .send(updateData)
      .expect(200);

    const responseValue = response.body;

    // deleting dates, since the types differ while comparing
    delete responseValue.startAt;
    delete responseValue.endAt;
    delete responseValue.createdAt;
    delete responseValue.updatedAt;

    expect(response.body).toMatchObject(updateData);
  });

  it('should not update report because missing rights', async () => {
    const report = getReport();
    report.visibility = 'protected';
    report.writeRoles = ['admin'];
    const reportDb = await createReportByObject(db, report);

    const updateData = {
      adminComment: 'updated admin comment',
    };

    await request(app.getHttpServer())
      .patch(`/reports/${reportDb.id}`)
      .send(updateData)
      .expect(403);
  });

  it('should update report with image upload', async () => {
    const report = await createReportByObject(db, getReport());

    const response = await request(app.getHttpServer())
      .patch(`/reports/${report.id}`)
      .set('Content-Type', 'multipart/form-data')
      .attach('file', path.join(__dirname, 'fulda-high-water.jpg'))
      .expect(200);

    const responseValue = response.body;

    expect(responseValue.imgPath).not.toBeNull();

    fs.unlink(responseValue.imgPath, (err) => {
      if (err) console.error();
    });
  });

  it('should not find report to update', async () => {
    const updateData = {
      adminComment: 'updated admin comment',
    };

    await request(app.getHttpServer())
      .patch(`/reports/${uuid()}`)
      .send(updateData)
      .expect(404);
  });

  it('should delete report', async () => {
    const report = await createReportByObject(db, getReport());

    const response = await request(app.getHttpServer())
      .delete(`/reports/${report.id}`)
      .set('Authorization', `Bearer ${JWTToken}`)
      .expect(200);

    const responseBody = response.body;

    expect(responseBody.startAt).toMatch(report.startAt.toISOString());
    expect(responseBody.endAt).toMatch(report.endAt.toISOString());

    delete report.createdAt;
    delete report.updatedAt;
    delete report.startAt;
    delete report.endAt;

    expect(responseBody).toMatchObject(report);

    const reportInDb = await getReportFromDb(db, report.id);
    expect(reportInDb).toBeNull();
  });

  it('should forbid report deletion', async () => {
    const report = await createReportByObject(db, getReport());

    await request(app.getHttpServer())
      .delete(`/reports/${report.id}`)
      .expect(403);
  });

  it('should not find report to delete', async () => {
    await request(app.getHttpServer())
      .delete(`/reports/${uuid()}`)
      .set('Authorization', `Bearer ${JWTToken}`)
      .expect(404);
  });
});
