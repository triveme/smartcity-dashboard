import { FiwareDataModels } from '../../data-model/fiware-models/fiware-models.enum';
import { DbType } from '@app/postgres-db';
import {
  NewQueryConfig,
  QueryConfig,
  queryConfigs,
} from '@app/postgres-db/schemas/query-config.schema';
import {
  createDataSourceByObject,
  getDataSource,
} from '../../data-source/test/test-data';
import { v4 as uuid } from 'uuid';
import { createHash } from 'crypto';

export function getQueryConfig(dataSourceId: string): QueryConfig {
  const queryConfig: QueryConfig = {
    id: uuid(),
    dataSourceId: dataSourceId,
    interval: 2,
    fiwareService: 'smartcity',
    fiwareServicePath: '/smartcity/path',
    fiwareType: FiwareDataModels.POINT_OF_INTEREST,
    entityIds: ['161726_DiDoZ_Ahle', '173865_DiDoZ_Luettig'],
    attributes: ['soilTemperature'],
    aggrMode: 'none',
    timeframe: 'live',
    isReporting: false,
    hash: '',
    createdAt: undefined,
    updatedAt: undefined,
    aggrPeriod: null,
    tenantId: null,
  };

  queryConfig.hash = generateHash(queryConfig);

  return queryConfig;
}

function generateHash(object: Partial<QueryConfig> | NewQueryConfig): string {
  const propertiesToInclude = [
    'dataSourceId',
    'interval',
    'fiwareService',
    'fiwareServicePath',
    'fiwareType',
    'entityIds',
    'attributes',
    'aggrMode',
    'timeframe',
  ];

  return createHash('sha256')
    .update(JSON.stringify(object, propertiesToInclude))
    .digest('hex');
}

export async function createQueryConfig(
  db: DbType,
  type?: 'ngsi-v2' | 'ngsi-ld' | 'api',
  dataSourceId?: string,
): Promise<QueryConfig> {
  if (!dataSourceId) {
    type = type ? type : 'ngsi-v2';

    const dataSource = await createDataSourceByObject(
      db,
      await getDataSource(undefined, db, type),
    );
    dataSourceId = dataSource.id;
  }

  const queryConfig = getQueryConfig(dataSourceId);

  const createdQueryConfigs = await db
    .insert(queryConfigs)
    .values(queryConfig)
    .returning();

  return createdQueryConfigs.length > 0 ? createdQueryConfigs[0] : null;
}
