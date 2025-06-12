import { config } from 'dotenv';
import { Client } from 'pg';
import * as path from 'path';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
// import { execSync } from 'child_process';

const TEST_DEPENDENT_CONNECTIONS = 120000; // only the own connection

config({
  path: '.env.testing',
}); // Load environment variables from .env file

const connectToDatabase = async (): Promise<Client> => {
  const database =
    process.env.NODE_ENV !== 'test'
      ? process.env.POSTGRES_DB
      : process.env.POSTGRES_DB_TEST;

  try {
    const client = new Client({
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT),
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: database,
    });

    await client.connect();

    return client;
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
    throw error;
  }
};

const waitingForDatabaseAvailability = async (
  client: Client,
): Promise<void> => {
  let connectionCount = 999;

  while (connectionCount > TEST_DEPENDENT_CONNECTIONS) {
    try {
      const result = await client.query(
        'SELECT COUNT(*) FROM pg_stat_activity WHERE datname = $1',
        [process.env.POSTGRES_DB],
      );
      connectionCount = result.rows[0].count;

      if (connectionCount > TEST_DEPENDENT_CONNECTIONS) {
        console.log('Database is busy, waiting 5 seconds and try again...');
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    } catch (error) {
      console.error('Error querying database connection count:', error.message);
      throw error;
    }
  }

  return;
};

const migrateDatabase = async (client: Client): Promise<void> => {
  const projectRoot = path.resolve(__dirname, '../../../../');

  try {
    const db = drizzle(client);

    console.log('Starting database migration...');

    await migrate(db, {
      migrationsFolder: projectRoot + '/database/migrations/generated',
    });

    console.log('Database migration finished!');
  } catch (error) {
    console.error('Error while migrating database:', error.message);
    throw error;
  }
};

export const truncateTables = async (client: Client): Promise<void> => {
  const databaseTableNames = [
    'corporate_info',
    'widget_to_panel',
    'tab',
    'widget',
    'panel',
    'dashboard_to_tenant',
    'tenant',
    'dashboard',
    'query',
    'query_config',
    'data_source',
    'auth_data',
    'data_model',
    'grouping_element',
    'climate_project',
    'report',
    'defect',
    'sensor_report',
    'general_settings',
  ];

  try {
    for (const tableName of databaseTableNames) {
      await client.query(`TRUNCATE TABLE ${tableName} CASCADE`);
    }
  } catch (error) {
    console.error('Error by truncate tables:', error.message);
    throw error;
  }
};

export const runJenkinsDatabasePreparation = async (): Promise<Client> => {
  const client = await connectToDatabase();
  await waitingForDatabaseAvailability(client);
  await migrateDatabase(client);
  await truncateTables(client);

  return client;
};

export const runLocalDatabasePreparation = async (): Promise<Client> => {
  const client = await connectToDatabase();
  await migrateDatabase(client);
  await truncateTables(client);

  return client;
};
