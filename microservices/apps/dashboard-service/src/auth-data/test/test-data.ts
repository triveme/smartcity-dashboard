import { authData, AuthData } from '@app/postgres-db/schemas/auth-data.schema';
import { v4 as uuid } from 'uuid';
import { DbType } from '@app/postgres-db';

export function getAuthDataValue(
  type?: 'ngsi-v2' | 'ngsi-ld' | 'api',
): AuthData {
  type = type ? type : 'ngsi-v2';

  return {
    id: uuid(),
    tenantAbbreviation: null,
    name: 'Test Auth Data',
    type: type,
    clientId: 'test-client',
    clientSecret: 'test1234',
    appUser: 'test-user',
    appUserPassword: 'test-user-password',
    apiToken: 'test-token',
    authUrl: 'https://localhost/test-auth',
    liveUrl: 'https://localhost/live',
    ngsildTenant: 'test-tenant',
    ngsildContextUrl: 'https://localhost/context',
    timeSeriesUrl: 'https://localhost/timeSeries',
    fiwareServices: ['etteln_dataspace', 'edag'],
    apiUrl: 'https://localhost/api',
    grantType: 'password',
    createdAt: undefined,
    updatedAt: undefined,
    readRoles: ['scs-admin'],
    writeRoles: ['scs-admin'],
    visibility: 'protected',
    collections: ['edag'],
  };
}

export async function createAuthDataByObject(
  dbClient: DbType,
  authDataValue: AuthData,
): Promise<AuthData> {
  const authDatas = await dbClient
    .insert(authData)
    .values(authDataValue)
    .returning();

  return authDatas.length > 0 ? authDatas[0] : null;
}
