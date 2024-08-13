import { DbType } from '@app/postgres-db';
import {
  DataSource,
  dataSources,
} from '@app/postgres-db/schemas/data-source.schema';
import { v4 as uuid } from 'uuid';
import {
  createAuthDataByObject,
  getAuthDataValue,
} from '../../auth-data/test/test-data';

export async function getDataSource(
  authDataId?: string,
  db?: DbType,
  type?: 'ngsi-v2' | 'ngsi-ld' | 'api',
): Promise<DataSource> {
  if (authDataId === undefined) {
    if (db === undefined)
      throw new Error('Db must be defined, when authDataId is undefined');

    type = type ? type : 'ngsi-v2';

    const authData = await createAuthDataByObject(db, getAuthDataValue());
    authDataId = authData.id;
  }

  return {
    id: uuid(),
    authDataId: authDataId,
    name: 'Sample DataSource',
    origin: type,
  };
}

export async function createDataSourceByObject(
  dbClient: DbType,
  dataSource: DataSource,
): Promise<DataSource> {
  const createdDatasources = await dbClient
    .insert(dataSources)
    .values(dataSource)
    .returning();

  return createdDatasources.length > 0 ? createdDatasources[0] : null;
}
