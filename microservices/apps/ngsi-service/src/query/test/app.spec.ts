import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { NgsiModule } from '../../ngsi.module';
import { NgsiService } from '../../ngsi.service';
import { AuthService } from '../../auth/auth.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { dataSources } from '@app/postgres-db/schemas/data-source.schema';
import { queries, Query } from '@app/postgres-db/schemas/query.schema';
import { queryConfigs } from '@app/postgres-db/schemas/query-config.schema';
import { v4 as uuid } from 'uuid';
import {
  runLocalDatabasePreparation,
  truncateTables,
} from '../../../../test/database-operations/prepare-database';
import { QueryService } from '../query.service';
import { ReportModule } from '../../report/report.module';
import { DataModule } from '../../data/data.module';
import { QueryModule } from '../query.module';
import { Client } from 'pg';
import {
  createQuery,
  getNGSILiveQuery,
} from '../../../../dashboard-service/src/query/test/test-data';
import {
  createTab,
  getTab,
} from '../../../../dashboard-service/src/tab/test/test-data';
import {
  createWidgetByObject,
  getWidget,
} from '../../../../dashboard-service/src/widget/test/test-data';
import { createQueryConfig } from '../../../../dashboard-service/src/query-config/test/test-data';

// Currently skipping, since it's not really understandable how this should be running
describe('QueryService (e2e)', () => {
  let app: INestApplication;
  let ngsiService: NgsiService;
  let queryService: QueryService;
  let httpService: HttpService;
  let db: DbType;
  let client: Client;

  const queriedQuerys = [];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [NgsiModule, HttpModule, ReportModule, DataModule, QueryModule],
      providers: [
        NgsiService,
        {
          provide: POSTGRES_DB,
          useValue: POSTGRES_DB,
        },
        {
          provide: AuthService,
          useValue: new AuthService(httpService),
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    client = await runLocalDatabasePreparation();

    httpService = module.get<HttpService>(HttpService);
    queryService = module.get<QueryService>(QueryService);
    ngsiService = module.get<NgsiService>(NgsiService);

    db = module.get<DbType>(POSTGRES_DB);
  });

  beforeEach(async () => {
    await truncateTables(client);
  });

  it('ngsiService should be defined', () => {
    expect(ngsiService).toBeDefined();
  });

  it('httpService should be defined', () => {
    expect(httpService).toBeDefined();
  });

  it('db should be definend', () => {
    expect(db).toBeDefined();
  });

  describe('Query Service Test', () => {
    it('should return all queries from database with with the objects query, query_config and data_source', async () => {
      const response = await queryService.getAllQueriesWithAllInfos();

      const dataSourceAttributeNames = Object.keys(dataSources);
      const queryConfigAttributeNames = Object.keys(queryConfigs);
      const queryAttributeNames = Object.keys(queries);

      for (const queryItem of response) {
        expect(queryItem).toHaveProperty('query');
        expect(queryItem).toHaveProperty('query_config');
        expect(queryItem).toHaveProperty('data_source');

        for (const attributeName of dataSourceAttributeNames) {
          expect(queryItem.data_source).toHaveProperty(attributeName);

          const columnDefinition = dataSources[attributeName];
          if (columnDefinition.notNull) {
            expect(queryItem.data_source[attributeName]).not.toBeNull();
          }
        }

        for (const attributeName of queryConfigAttributeNames) {
          expect(queryItem.query_config).toHaveProperty(attributeName);

          const columnDefinition = queryConfigs[attributeName];
          if (columnDefinition.notNull) {
            expect(queryItem.query_config[attributeName]).not.toBeNull();
          }
        }

        for (const attributeName of queryAttributeNames) {
          expect(queryItem.query).toHaveProperty(attributeName);

          const columnDefinition = queries[attributeName];
          if (columnDefinition.notNull) {
            expect(queryItem.query[attributeName]).not.toBeNull();
          }
        }

        queriedQuerys.push(queryItem);
      }
    });

    it('should return all queries that need update', async () => {
      const queryConfig1 = await createQueryConfig(db);
      const ngsiLiveQuery1 = getNGSILiveQuery();
      ngsiLiveQuery1.queryConfigId = queryConfig1.id;
      ngsiLiveQuery1.createdAt = new Date(
        new Date().getTime() - 70 * 60 * 1000,
      );
      ngsiLiveQuery1.updatedAt = new Date(
        new Date().getTime() - 65 * 60 * 1000,
      );
      const query1 = await createQuery(db, ngsiLiveQuery1);
      const widget1 = await createWidgetByObject(db, getWidget([], []));
      await createTab(
        db,
        await getTab(db, widget1.id, 'Bild', null, null, query1.id),
      );

      const queryConfig2 = await createQueryConfig(db);
      const ngsiLiveQuery2 = getNGSILiveQuery();
      ngsiLiveQuery1.queryConfigId = queryConfig2.id;
      ngsiLiveQuery2.createdAt = new Date(Date.now());
      ngsiLiveQuery2.updatedAt = new Date(Date.now());
      const query2 = await createQuery(db, ngsiLiveQuery2);
      const widget2 = await createWidgetByObject(db, getWidget([], []));
      await createTab(
        db,
        await getTab(db, widget2.id, 'Bild', null, null, query2.id),
      );

      const queriesToUpdate = await queryService.getQueriesToUpdate();
      expect(Array.of(queriesToUpdate.values())).toHaveLength(1);
    });

    it('should return all queries that need update with duplicate hash', async () => {
      const queryConfig1 = await createQueryConfig(db, 'ngsi-v2', null);
      const ngsiLiveQuery1 = getNGSILiveQuery();
      ngsiLiveQuery1.queryConfigId = queryConfig1.id;
      ngsiLiveQuery1.createdAt = new Date(
        new Date().getTime() - 70 * 60 * 1000,
      );
      ngsiLiveQuery1.updatedAt = new Date(
        new Date().getTime() - 65 * 60 * 1000,
      );
      const query1 = await createQuery(db, ngsiLiveQuery1, queryConfig1.id);
      const widget1 = await createWidgetByObject(db, getWidget([], []));
      await createTab(
        db,
        await getTab(db, widget1.id, 'Bild', null, null, query1.id),
      );

      const queryConfig2 = await createQueryConfig(
        db,
        'ngsi-v2',
        queryConfig1.dataSourceId,
      );
      const ngsiLiveQuery2 = getNGSILiveQuery();
      ngsiLiveQuery2.queryConfigId = queryConfig2.id;
      ngsiLiveQuery2.createdAt = new Date(
        new Date().getTime() - 70 * 60 * 1000,
      );
      ngsiLiveQuery2.updatedAt = new Date(
        new Date().getTime() - 65 * 60 * 1000,
      );
      const query2 = await createQuery(db, ngsiLiveQuery2, queryConfig2.id);
      const widget2 = await createWidgetByObject(db, getWidget([], []));
      await createTab(
        db,
        await getTab(db, widget2.id, 'Bild', null, null, query2.id),
      );

      const queryConfig3 = await createQueryConfig(db);
      const ngsiLiveQuery3 = getNGSILiveQuery();
      ngsiLiveQuery3.queryConfigId = queryConfig3.id;
      ngsiLiveQuery3.createdAt = new Date(Date.now());
      ngsiLiveQuery3.updatedAt = new Date(Date.now());
      const query3 = await createQuery(db, ngsiLiveQuery3, queryConfig3.id);
      const widget3 = await createWidgetByObject(db, getWidget([], []));
      await createTab(
        db,
        await getTab(db, widget3.id, 'Bild', null, null, query3.id),
      );

      const queriesToUpdate = await queryService.getQueriesToUpdate();
      expect(Array.of(queriesToUpdate.values())).toHaveLength(1);
    });

    it('should return query hashmap', async () => {
      const queryConfig = await createQueryConfig(db);
      const query = await createQuery(db, getNGSILiveQuery(), queryConfig.id);

      const queryHashMap = await queryService.getQueryHashMap(query.id);

      expect(queryHashMap.get(queryConfig.hash)).toBeDefined();
    });

    it('should return true if query need to update', async () => {
      const currentTime = new Date();
      const testQuery: Query = {
        id: uuid(),
        queryData: {},
        reportData: {},
        queryConfigId: null,
        updatedAt: new Date(currentTime.getTime() - 5000),
        createdAt: new Date(currentTime.getTime() - 5000),
        updateMessage: [],
      };

      const needsToUpdate = queryService.queryNeedsUpdate(testQuery, 2);

      expect(needsToUpdate).toBe(true);
    });

    it('should return false if query does not need to update', async () => {
      const currentTime = new Date();
      const testQuery: Query = {
        id: uuid(),
        queryData: {},
        reportData: {},
        queryConfigId: null,
        updatedAt: new Date(currentTime.getTime() - 5000),
        createdAt: new Date(currentTime.getTime() - 5000),
        updateMessage: [],
      };

      const needsToUpdate = queryService.queryNeedsUpdate(testQuery, 11);

      expect(needsToUpdate).toBe(false);
    });
  });
});
