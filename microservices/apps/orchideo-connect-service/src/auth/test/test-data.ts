import { getAuthDataValue } from 'apps/dashboard-service/src/auth-data/test/test-data';
import { QueryBatch } from '../../api.service';
import { timeframeEnum } from '@app/postgres-db/schemas/enums.schema';
import { EncryptionUtil } from 'apps/dashboard-service/src/util/encryption.util';
import { getDataSource } from 'apps/dashboard-service/src/data-source/test/test-data';
import { getQueryConfig } from 'apps/dashboard-service/src/query-config/test/test-data';
import { getNGSILiveQuery } from 'apps/dashboard-service/src/query/test/test-data';
import { getSystemUser } from '../../system-user/test/test-data';

export async function getQueryBatch(): Promise<QueryBatch> {
  const authData = getAuthDataValue();
  authData.appUserPassword = EncryptionUtil.encryptPassword(
    authData.appUserPassword as string,
  );
  authData.clientSecret = EncryptionUtil.encryptPassword(
    authData.clientSecret as string,
  );

  const dataSource = await getDataSource(authData.id);
  const queryConfig = getQueryConfig(dataSource.id);
  const query = getNGSILiveQuery();
  const systemUser = getSystemUser();

  return {
    queryIds: [query.id],
    query_config: {
      ...queryConfig,
      updatedAt: new Date(),
      createdAt: new Date(),
      timeframe: timeframeEnum('timeframe')[0],
      hash: null,
    },
    data_source: {
      ...dataSource,
      authDataId: authData.id,
    },
    auth_data: authData,
    system_user: systemUser,
  };
}
