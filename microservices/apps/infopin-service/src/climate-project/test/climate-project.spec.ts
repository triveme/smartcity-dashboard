import { Test, TestingModule } from '@nestjs/testing';
import { Client } from 'pg';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  runLocalDatabasePreparation,
  truncateTables,
} from '../../../../test/database-operations/prepare-database';
import { INestApplication } from '@nestjs/common';
import { createClimateProjectByObject, getClimateProject } from './test-data';
import * as request from 'supertest';
import { InfopinServiceModule } from '../../infopin-service.module';
import axios from 'axios';
import { v4 as uuid } from 'uuid';
import * as path from 'node:path';
import * as fs from 'node:fs';

describe('ClimateProjectService', () => {
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

  it('should get all climate projects', async () => {
    const climateProject = await createClimateProjectByObject(
      db,
      getClimateProject(),
    );
    const climateProject2 = getClimateProject('Project 2');
    climateProject2.visibility = 'protected';
    climateProject2.readRoles = ['admin'];
    await createClimateProjectByObject(db, climateProject2);

    const response = await request(app.getHttpServer())
      .get('/climate-projects')
      .expect(200);

    expect(response.body.length).toBe(1);
    const responseProject1 = response.body[0];

    // deleting dates, since the types differ while comparing
    delete climateProject.createdAt;
    delete climateProject.updatedAt;

    expect(climateProject.startAt.toISOString()).toMatch(
      responseProject1.startAt,
    );

    // deleting dates, since the types differ while comparing
    delete climateProject.startAt;
    delete climateProject.endAt;

    expect(responseProject1).toMatchObject(climateProject);
  });

  it('should get all climate projects with category', async () => {
    const climateProject = getClimateProject();

    climateProject.category = 'Wasser';
    const waterClimateProject = await createClimateProjectByObject(
      db,
      climateProject,
    );

    climateProject.category = 'Verkehr';
    await createClimateProjectByObject(db, climateProject);

    const response = await request(app.getHttpServer())
      .get('/climate-projects')
      .query({
        category: 'Wasser',
      })
      .expect(200);

    expect(response.body.length).toBe(1);
    const responseProject = response.body[0];

    // deleting dates, since the types differ while comparing
    delete waterClimateProject.createdAt;
    delete waterClimateProject.updatedAt;

    expect(waterClimateProject.startAt.toISOString()).toMatch(
      responseProject.startAt,
    );

    // deleting dates, since the types differ while comparing
    delete waterClimateProject.startAt;
    delete waterClimateProject.endAt;

    expect(responseProject).toMatchObject(waterClimateProject);
  });

  it('should get all climate projects with timeHorizon', async () => {
    const climateProject = getClimateProject();

    climateProject.timeHorizon = 'shortterm';
    const shorttermClimateProject = await createClimateProjectByObject(
      db,
      climateProject,
    );

    climateProject.timeHorizon = 'archive';
    await createClimateProjectByObject(db, climateProject);

    const response = await request(app.getHttpServer())
      .get('/climate-projects')
      .query({
        timeHorizon: 'shortterm',
      })
      .expect(200);

    expect(response.body.length).toBe(1);
    const responseProject = response.body[0];

    // deleting dates, since the types differ while comparing
    delete shorttermClimateProject.createdAt;
    delete shorttermClimateProject.updatedAt;

    expect(shorttermClimateProject.startAt.toISOString()).toMatch(
      responseProject.startAt,
    );

    // deleting dates, since the types differ while comparing
    delete shorttermClimateProject.startAt;
    delete shorttermClimateProject.endAt;

    expect(responseProject).toMatchObject(shorttermClimateProject);
  });

  it('should get all climate projects as admin', async () => {
    const climateProject1 = await createClimateProjectByObject(
      db,
      getClimateProject(),
    );
    const climateProject2 = await createClimateProjectByObject(
      db,
      getClimateProject(),
    );

    const response = await request(app.getHttpServer())
      .get('/climate-projects')
      .set('Authorization', `Bearer ${JWTToken}`)
      .expect(200);

    expect(response.body.length).toBe(2);
    const responseProject1 = response.body[0];
    const responseProject2 = response.body[1];

    // deleting dates, since the types differ while comparing
    delete climateProject1.createdAt;
    delete climateProject1.updatedAt;
    delete climateProject2.createdAt;
    delete climateProject2.updatedAt;

    expect(climateProject1.startAt.toISOString()).toMatch(
      responseProject2.startAt,
    );
    expect(climateProject2.startAt.toISOString()).toMatch(
      responseProject1.startAt,
    );

    // deleting dates, since the types differ while comparing
    delete climateProject1.startAt;
    delete climateProject1.endAt;
    delete climateProject2.startAt;
    delete climateProject2.endAt;

    expect(responseProject1).toMatchObject(climateProject2);
    expect(responseProject2).toMatchObject(climateProject1);
  });

  it('should get climate project by id', async () => {
    const climateProject = await createClimateProjectByObject(
      db,
      getClimateProject(),
    );

    const response = await request(app.getHttpServer())
      .get(`/climate-projects/${climateProject.id}`)
      .expect(200);

    // deleting dates, since the types differ while comparing
    delete climateProject.startAt;
    delete climateProject.endAt;
    delete climateProject.updatedAt;
    delete climateProject.createdAt;

    expect(response.body).toMatchObject(climateProject);
  });

  it('should not find climate project by id', async () => {
    await request(app.getHttpServer())
      .get(`/climate-projects/${uuid()}`)
      .expect(404);
  });

  it('should get climate project by id as admin', async () => {
    const climateProject = await createClimateProjectByObject(
      db,
      getClimateProject(),
    );

    const response = await request(app.getHttpServer())
      .get(`/climate-projects/${climateProject.id}`)
      .set('Authorization', `Bearer ${JWTToken}`)
      .expect(200);

    // deleting dates, since the types differ while comparing
    delete climateProject.startAt;
    delete climateProject.endAt;
    delete climateProject.createdAt;
    delete climateProject.updatedAt;

    expect(response.body).toMatchObject(climateProject);
  });

  it('should not get climate project by id because no admin', async () => {
    const climateProject = getClimateProject();
    climateProject.readRoles = ['admin'];
    climateProject.visibility = 'protected';
    const climateProjectDb = await createClimateProjectByObject(
      db,
      climateProject,
    );

    await request(app.getHttpServer())
      .get(`/climate-projects/${climateProjectDb.id}`)
      .expect(403);
  });

  it('should create climate project', async () => {
    const climateProject = getClimateProject();
    climateProject.id = uuid();

    delete climateProject.createdAt;
    delete climateProject.updatedAt;

    const response = await request(app.getHttpServer())
      .post('/climate-projects')
      .send(climateProject)
      .expect(201);

    const responseValue = response.body;

    expect(responseValue.startAt).toMatch(climateProject.startAt.toISOString());
    expect(responseValue.endAt).toMatch(climateProject.endAt.toISOString());

    // deleting dates, since the types differ while comparing
    delete climateProject.startAt;
    delete climateProject.endAt;

    expect(response.body).toMatchObject(climateProject);
  });

  it('should create climate project with image upload', async () => {
    const climateProject = getClimateProject();
    climateProject.id = uuid();

    delete climateProject.createdAt;
    delete climateProject.updatedAt;

    const response = await request(app.getHttpServer())
      .post('/climate-projects')
      .set('Content-Type', 'multipart/form-data')
      .field('id', climateProject.id)
      .field('title', climateProject.title)
      .field('link', 'https://test.at')
      .field('costsInCents', 1000)
      .field('location', '{ "lat": 9.444,"lng": -9.444}')
      .field('category', 'test')
      .field('description', 'test description')
      .field('startAt', climateProject.startAt.toISOString())
      .field('endAt', climateProject.endAt.toISOString())
      .field('locationText', 'Hünfeld')
      .field('timeHorizon', 'shortterm')
      .field('responsible', 'Responsible User')
      .field('readRoles', climateProject.readRoles)
      .field('writeRoles', climateProject.writeRoles)
      .field('visibility', climateProject.visibility)
      .field('public', true)
      .attach('file', path.join(__dirname, 'fulda-high-water.jpg'))
      .expect(201);

    const responseValue = response.body;

    expect(responseValue.startAt).toMatch(climateProject.startAt.toISOString());
    expect(responseValue.endAt).toMatch(climateProject.endAt.toISOString());
    expect(responseValue.imgPath).not.toBeNull();

    // deleting dates, since the types differ while comparing
    delete climateProject.startAt;
    delete climateProject.endAt;

    const createdImage = responseValue.imgPath;
    // delete img path, since it now is null
    delete climateProject.imgPath;

    expect(responseValue).toMatchObject(climateProject);

    fs.unlink(createdImage, (err) => {
      if (err) console.error();
    });
  });

  it('should update properties of climate project', async () => {
    const climateProject = await createClimateProjectByObject(
      db,
      getClimateProject(),
    );

    const dataToUpdate = {
      locationText: 'updated location text',
    };

    const response = await request(app.getHttpServer())
      .patch(`/climate-projects/${climateProject.id}`)
      .send(dataToUpdate)
      .expect(200);

    const responseValue = response.body;

    // deleting dates, since the types differ while comparing
    delete responseValue.startAt;
    delete responseValue.endAt;
    delete responseValue.createdAt;
    delete responseValue.updatedAt;

    expect(response.body).toMatchObject(dataToUpdate);
  });

  it('should not update properties of climate project because missing rights', async () => {
    const climateProject = getClimateProject();
    climateProject.visibility = 'protected';
    climateProject.writeRoles = ['admin'];
    const climateProjectDb = await createClimateProjectByObject(
      db,
      climateProject,
    );

    const dataToUpdate = {
      locationText: 'updated location text',
    };

    await request(app.getHttpServer())
      .patch(`/climate-projects/${climateProjectDb.id}`)
      .send(dataToUpdate)
      .expect(403);
  });

  it('should update climate project with image upload', async () => {
    const climateProject = await createClimateProjectByObject(
      db,
      getClimateProject(),
    );

    const response = await request(app.getHttpServer())
      .patch(`/climate-projects/${climateProject.id}`)
      .set('Content-Type', 'multipart/form-data')
      .attach('file', path.join(__dirname, 'fulda-high-water.jpg'))
      .expect(200);

    const responseValue = response.body;

    expect(responseValue.imgPath).not.toBeNull();

    fs.unlink(responseValue.imgPath, (err) => {
      if (err) console.error();
    });
  });

  it('should not find climate project for update', async () => {
    const dataToUpdate = {
      title: 'updated title',
    };

    await request(app.getHttpServer())
      .patch(`/climate-projects/${uuid()}`)
      .send(dataToUpdate)
      .expect(404);
  });

  it('should delete climate project', async () => {
    const climateProject = await createClimateProjectByObject(
      db,
      getClimateProject(),
    );

    await request(app.getHttpServer())
      .delete(`/climate-projects/${climateProject.id}`)
      .set('Authorization', `Bearer ${JWTToken}`)
      .expect(200);
  });

  it('should not delete climate project because not admin', async () => {
    const climateProject = getClimateProject();
    climateProject.visibility = 'protected';
    climateProject.readRoles = ['admin'];
    const climateProjectDb = await createClimateProjectByObject(
      db,
      climateProject,
    );

    await request(app.getHttpServer())
      .delete(`/climate-projects/${climateProjectDb.id}`)
      .expect(403);
  });

  it('should not find climate project for deletion', async () => {
    await request(app.getHttpServer())
      .delete(`/climate-projects/${uuid()}`)
      .set('Authorization', `Bearer ${JWTToken}`)
      .expect(404);
  });
});
