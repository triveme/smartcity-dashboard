import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool, PoolClient } from 'pg';

config(); // Load environment variables from .env file

const host = process.env.POSTGRES_HOST;
const port = process.env.POSTGRES_PORT;
const user = process.env.POSTGRES_USER;
const password = process.env.POSTGRES_PASSWORD;
const database =
  process.env.NODE_ENV !== 'test'
    ? process.env.POSTGRES_DB
    : process.env.POSTGRES_DB_TEST;

if (!host || !port || !user || !password || !database) {
  throw new Error('Missing database environment variable(s)');
}

const pool = new Pool({
  host: host,
  port: parseInt(port),
  user: user,
  password: password,
  database: database,
  max: 10, // Adjust the maximum number of connections in the pool as needed
  idleTimeoutMillis: 0, // Connections will never be closed due to idleness
  keepAlive: true, // Enable TCP keep-alive to prevent idle connections from being closed
  keepAliveInitialDelayMillis: 1000, // Start sending keep-alive packets after 1 second of inactivity
});

async function migrateDatabase(): Promise<void> {
  const client: PoolClient = await pool.connect();

  try {
    console.log(`Migrating ${process.env.NODE_ENV} database on port: ${port}`);

    const db = drizzle(client);

    await migrate(db, { migrationsFolder: './database/migrations/generated' });
    console.log('Database migrated successfully\n');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Database migration failed:', error.message);
    } else {
      console.error('Database migration failed with unknown error:', error);
    }
    throw error;
  } finally {
    client.release();
  }
}

// Calling the migrateDatabase() function asyncronously
// Allowing the Dockerfile.migrations container to finish the migrations before exiting
(async (): Promise<void> => {
  try {
    await migrateDatabase(); // Wait for the migration to complete
    process.exit(0); // Exit with success status code
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error during migration:', error.message);
      console.error('Error stack trace:', error.stack);
    } else {
      console.error('Unknown error during migration:', error);
    }
    process.exit(1); // Exit with error status code
  }
})();
