import { Global, Module } from '@nestjs/common';
import { POSTGRES_DB, PostgresDbProvider } from './providers/db.provider';

@Global()
@Module({
  providers: [PostgresDbProvider],
  exports: [POSTGRES_DB],
})
export class PostgresDbModule {}
