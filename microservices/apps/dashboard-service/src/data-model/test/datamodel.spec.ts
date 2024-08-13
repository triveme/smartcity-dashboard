import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { DashboardServiceModule } from '../../dashboard-service.module';
import { createDataModel, getDataModel } from './test-data';
import { dataModels } from '@app/postgres-db/schemas/data-model.schema';
import {
  runLocalDatabasePreparation,
  truncateTables,
} from '../../../../test/database-operations/prepare-database';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { Client } from 'pg';

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

  describe('DataModels', () => {
    // create
    it('/data-models (POST)', async () => {
      const dataModel = getDataModel();

      const response = await request(app.getHttpServer())
        .post('/data-models')
        .send(dataModel)
        .expect(201);

      expect(response.body).toMatchObject(dataModel);
    });

    // getAll
    it('/data-models (GET)', async () => {
      const dataModel = await createDataModel(db);

      const response = await request(app.getHttpServer()).get('/data-models');
      expect(response.body).toBeInstanceOf(Array);

      const attributeNames = Object.keys(dataModels);

      for (const dataModel of response.body) {
        for (const attributeName of attributeNames) {
          expect(dataModel).toHaveProperty(attributeName);

          const columnDefinition = dataModel[attributeName];
          if (columnDefinition.notNull) {
            expect(dataModel[attributeName]).not.toBeNull();
          }
        }
      }

      const responseIds = response.body.map((dataModel) => dataModel.id);
      expect(responseIds).toContain(dataModel.id);
    });

    // getById
    it('/data-models/:id (GET)', async () => {
      const dataModel = await createDataModel(db);

      const response = await request(app.getHttpServer()).get(
        '/data-models/' + dataModel.id,
      );

      const attributeNames = Object.keys(dataModels);

      for (const attributeName of attributeNames) {
        expect(response.body).toHaveProperty(attributeName);

        const columnDefinition = dataModels[attributeName];
        if (columnDefinition.notNull) {
          expect(response.body[attributeName]).not.toBeNull();
        }
      }
    });

    // update
    it('/data-models/:id (PATCH)', async () => {
      const dataModel = await createDataModel(db);

      const updateDataModel = {
        model: {
          name: 'Dummy interesting place updated',
          types: ['Art', 'History'],
          address: {
            addressLocality: 'City',
            postalCode: '12345',
            streetAddress: 'Examplestreet 123',
          },
          image: 'https://example.com/image.jpg',
          imagePreview: 'https://example.com/image-preview.jpg',
          creator: 'John Doe',
          location: {
            type: 'Point',
            coordinates: [50.1234, 7.5678],
          },
          info: 'Ein Beispieltext mit Informationen über den Ort.',
          zoomprio: 'High',
        },
      };

      const response = await request(app.getHttpServer())
        .patch('/data-models/' + dataModel.id)
        .send(updateDataModel)
        .expect(200);

      expect(response.body).toMatchObject(updateDataModel);
    });

    // delete
    it('/data-models/:id (DELETE)', async () => {
      const dataModel = await createDataModel(db);

      await request(app.getHttpServer())
        .delete('/data-models/' + dataModel.id)
        .expect(200);

      await request(app.getHttpServer())
        .get('/data-models' + dataModel.id)
        .expect(404);
    });
  });
});
