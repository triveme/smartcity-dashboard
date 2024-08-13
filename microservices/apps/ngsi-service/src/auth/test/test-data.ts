import { QueryBatch } from '../../ngsi.service';
import { timeframeEnum } from '@app/postgres-db/schemas/enums.schema';
import { getAuthDataValue } from '../../../../dashboard-service/src/auth-data/test/test-data';
import { getDataSource } from '../../../../dashboard-service/src/data-source/test/test-data';
import { getNGSIQuery } from '../../../../dashboard-service/src/query/test/test-data';
import { getQueryConfig } from '../../../../dashboard-service/src/query-config/test/test-data';
import { EncryptionUtil } from '../../../../dashboard-service/src/util/encryption.util';

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
  const query = getNGSIQuery(queryConfig.id);

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
  };
}
