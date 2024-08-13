import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { Client } from 'pg';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { InfopinServiceModule } from '../../infopin-service.module';
import {
  runLocalDatabasePreparation,
  truncateTables,
} from '../../../../test/database-operations/prepare-database';
import * as request from 'supertest';
import { createDefectByObject, getDefect } from './test-data';
import { v4 as uuid } from 'uuid';
import * as path from 'node:path';
import * as fs from 'node:fs';
import axios from 'axios';

describe('DefectService', () => {
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

  it('should create defect', async () => {
    const defect = getDefect();
    defect.id = uuid();

    delete defect.createdAt;
    delete defect.updatedAt;

    const response = await request(app.getHttpServer())
      .post('/defects')
      .send(defect)
      .expect(201);

    expect(response.body).toMatchObject(defect);
  });

  it('should create defect with image upload', async () => {
    const defect = getDefect();
    defect.id = uuid();

    delete defect.createdAt;
    delete defect.updatedAt;

    const response = await request(app.getHttpServer())
      .post('/defects')
      .set('Content-Type', 'multipart/form-data')
      .field('id', defect.id)
      .field('location', '{ "lat": 9.444,"lng": -9.444}')
      .field('category', defect.category)
      .field('description', defect.description)
      .field('mail', defect.mail)
      .field('phone', defect.phone)
      .field('visibility', defect.visibility)
      .attach('file', path.join(__dirname, 'fulda-high-water.jpg'))
      .expect(201);

    const responseValue = response.body;

    expect(responseValue.imgPath).not.toBeNull();

    const createdImage = responseValue.imgPath;
    // delete img path, since it now is null
    delete defect.imgPath;

    expect(response.body).toMatchObject(defect);

    fs.unlink(createdImage, (err) => {
      if (err) console.error();
    });
  });

  it('should not get all defects because no token', async () => {
    await createDefectByObject(db, getDefect());
    await createDefectByObject(db, getDefect());

    const protectedDefectObject = getDefect();
    protectedDefectObject.visibility = 'protected';
    protectedDefectObject.readRoles = ['scs-admin'];
    await createDefectByObject(db, protectedDefectObject);

    const response = await request(app.getHttpServer())
      .get('/defects')
      .expect(200);

    expect(response.body.length).toBe(2);
  });

  it('should get all defects with token', async () => {
    await createDefectByObject(db, getDefect());
    await createDefectByObject(db, getDefect());

    const protectedDefectObject = getDefect();
    protectedDefectObject.visibility = 'protected';
    protectedDefectObject.readRoles = ['scs-admin'];
    await createDefectByObject(db, protectedDefectObject);

    const response = await request(app.getHttpServer())
      .get('/defects')
      .set('Authorization', `Bearer ${JWTToken}`)
      .expect(200);

    expect(response.body.length).toBe(3);
  });

  it('should get defect count without token', async () => {
    await createDefectByObject(db, getDefect());
    await createDefectByObject(db, getDefect());

    const protectedDefectObject = getDefect();
    protectedDefectObject.visibility = 'protected';
    protectedDefectObject.readRoles = ['scs-admin'];
    await createDefectByObject(db, protectedDefectObject);

    const response = await request(app.getHttpServer())
      .get('/defects/count')
      .expect(200);

    expect(response.body.count).toBe(2);
  });

  it('should get defect count with token', async () => {
    await createDefectByObject(db, getDefect());
    await createDefectByObject(db, getDefect());

    const protectedDefectObject = getDefect();
    protectedDefectObject.visibility = 'protected';
    protectedDefectObject.readRoles = ['scs-admin'];
    await createDefectByObject(db, protectedDefectObject);

    const response = await request(app.getHttpServer())
      .get('/defects/count')
      .set('Authorization', `Bearer ${JWTToken}`)
      .expect(200);

    expect(response.body.count).toBe(3);
  });
});
