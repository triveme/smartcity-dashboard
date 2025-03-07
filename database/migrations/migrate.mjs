/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pg from 'pg';

config(); // Load environment variables from .env file

const host = process.env.POSTGRES_HOST;
const port = process.env.POSTGRES_PORT;
const user = process.env.POSTGRES_USER;
const password = process.env.POSTGRES_PASSWORD;
const rejectSelfSigned =
  process.env.POSTGRES_REJECT_UNAUTHORIZED === 'false' ? false : true;
const database =
  process.env.NODE_ENV !== 'test'
    ? process.env.POSTGRES_DB
    : process.env.POSTGRES_DB_TEST;

if (!host || !port || !user || !password || !database) {
  throw new Error('Missing database environment variable(s)');
}

console.log(
  'process.env.POSTGRES_REJECT_UNAUTHORIZED: ',
  process.env.POSTGRES_REJECT_UNAUTHORIZED,
);
console.log('REJECT SELF SIGNED: ', rejectSelfSigned);

const poolConfig = {
  host: host,
  port: parseInt(port),
  user: user,
  password: password,
  database: database,
  max: 10,
  idleTimeoutMillis: 0,
  keepAlive: true,
  keepAliveInitialDelayMillis: 1000,
  ssl: rejectSelfSigned ? false : { rejectUnauthorized: rejectSelfSigned },
};

// Create a Pool instance
const pool = new pg.Pool(poolConfig);

async function migrateDatabase() {
  const client = await pool.connect();

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
    await client.release();
    await pool.end(); // Properly close the pool
  }
}

// Calling the migrateDatabase() function asyncronously
// Allowing the Dockerfile.migrations container to finish the migrations before exiting
(async () => {
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
