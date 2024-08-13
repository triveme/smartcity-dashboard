import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import {
  runJenkinsDatabasePreparation,
  runLocalDatabasePreparation,
} from './prepare-database';
import { Client } from 'pg';

describe('Database', () => {
  let client: Client;
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({}).compile();

    app = module.createNestApplication();
    await app.init();

    process.env.NODE_ENV !== 'test'
      ? (client = await runLocalDatabasePreparation())
      : (client = await runJenkinsDatabasePreparation());
  }, 300000); // max timeout set to 5 minutes

  afterAll(async () => {
    await app.close();
  });

  it('connection should be established', () => {
    expect(client).toBeDefined();
  });

  it.each([
    ['data_source'],
    ['corporate_info'],
    ['query'],
    ['query_config'],
    ['auth_data'],
    ['dashboard'],
    ['panel'],
    ['widget'],
    ['tab'],
    ['data_model'],
    ['widget_to_panel'],
    ['grouping_element'],
    ['dashboard_to_tenant'],
    ['tenant'],
  ])('should have created schema %s', async (schemaName) => {
    const result = await client.query(
      `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${schemaName}'`,
    );
    expect(result.rows[0].count).toEqual('1');
  });
});
