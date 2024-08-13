import { config } from 'dotenv';
import { FactoryProvider, Logger } from '@nestjs/common';
import { NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';
import { DefaultLogger, LogWriter } from 'drizzle-orm';
import { Pool } from 'pg';
import * as path from 'path';

export const POSTGRES_DB = Symbol('POSTGRES_DB');
export type DbType = NodePgDatabase;

const rootDir = path.resolve(__dirname, '../../../../');
const envPath = path.join(rootDir, '.env');

config({ path: envPath }); // Load environment variables from .env file in root directory

export const PostgresDbProvider: FactoryProvider = {
  provide: POSTGRES_DB,
  useFactory: async () => {
    const logger = new Logger('POSTGRES_DB');

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

    logger.log(
      `Connecting to ${process.env.NODE_ENV} database on port: ${port}`,
    );

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

    const client = await pool.connect();

    logger.log(
      `Connected to ${process.env.NODE_ENV} database on port: ${port}`,
    );

    class DBLogWriter implements LogWriter {
      write(message: string): void {
        logger.verbose(message);
      }
    }

    return drizzle(client, {
      logger: new DefaultLogger({ writer: new DBLogWriter() }),
    });
  },
};
