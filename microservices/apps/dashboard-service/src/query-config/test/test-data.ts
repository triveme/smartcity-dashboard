import { FiwareDataModels } from '../../data-model/fiware-models/fiware-models.enum';
import { DbType } from '@app/postgres-db';
import {
  QueryConfig,
  queryConfigs,
} from '@app/postgres-db/schemas/query-config.schema';
import {
  createDataSourceByObject,
  getDataSource,
} from '../../data-source/test/test-data';
import { v4 as uuid } from 'uuid';

export function getQueryConfig(dataSourceId: string): QueryConfig {
  return {
    id: uuid(),
    dataSourceId: dataSourceId,
    interval: 2,
    fiwareService: 'smartcity',
    fiwareServicePath: '/smartcity/path',
    fiwareType: FiwareDataModels.POINT_OF_INTEREST,
    entityIds: ['entity1', 'entity2'],
    attributes: ['attribute1', 'attribute2'],
    aggrMode: 'none',
    timeframe: 'live',
    isReporting: false,
    hash: '',
    createdAt: undefined,
    updatedAt: undefined,
    aggrPeriod: null,
    tenantId: null,
  };
}

export async function createQueryConfig(
  db: DbType,
  type?: 'ngsi-v2' | 'ngsi-ld' | 'api',
  dataSourceId?: string,
): Promise<QueryConfig> {
  if (dataSourceId === undefined) {
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
