import { config } from 'dotenv';
import type { Config } from 'drizzle-kit';

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

export default {
  // This will find all schemas in the microservices directory as long
  // as we adhere to the folder structure and naming conventions
  schema: './microservices/libs/postgres-db/src/schemas/*.schema.ts',
  out: './database/migrations/generated',
  driver: 'pg',
  dbCredentials: {
    host: host,
    port: parseInt(port),
    user: user,
    password: password,
    database: database,
  },
} satisfies Config;
