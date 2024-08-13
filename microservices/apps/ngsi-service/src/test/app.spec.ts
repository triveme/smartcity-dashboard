import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { NgsiModule } from '../ngsi.module';
import { NgsiService } from '../ngsi.service';
import { AuthService } from '../auth/auth.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { dataSources } from '@app/postgres-db/schemas/data-source.schema';
import { queries, Query } from '@app/postgres-db/schemas/query.schema';
import { queryConfigs } from '@app/postgres-db/schemas/query-config.schema';
import { authData } from '@app/postgres-db/schemas/auth-data.schema';
import { dashboards } from '@app/postgres-db/schemas/dashboard.schema';
import { panels } from '@app/postgres-db/schemas/dashboard.panel.schema';
import { widgets } from '@app/postgres-db/schemas/dashboard.widget.schema';
import { tabs } from '@app/postgres-db/schemas/dashboard.tab.schema';
import { dataModels } from '@app/postgres-db/schemas/data-model.schema';
import { widgetsToPanels } from '@app/postgres-db/schemas/dashboard.widget-to-panel.schema';
import { groupingElements } from '@app/postgres-db/schemas/dashboard.grouping-element.schema';
import { dashboardsToTenants } from '@app/postgres-db/schemas/dashboard-to-tenant.schema';
import { corporateInfos } from '@app/postgres-db/schemas/corporate-info.schema';
import { tenants } from '@app/postgres-db/schemas/tenant.schema';
import { v4 as uuid } from 'uuid';
import { runLocalDatabasePreparation } from '../../../test/database-operations/prepare-database';
import { QueryService } from '../query/query.service';
import { ReportModule } from '../report/report.module';
import { DataModule } from '../data/data.module';
import { QueryModule } from '../query/query.module';

// Currently skipping, since it's not really understandable how this should be running
describe('NgsiService (e2e)', () => {
  let app: INestApplication;
  let ngsiService: NgsiService;
  let queryService: QueryService;
  let httpService: HttpService;
  let db: DbType;

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

    await runLocalDatabasePreparation();

    httpService = module.get<HttpService>(HttpService);
    queryService = module.get<QueryService>(QueryService);
    ngsiService = module.get<NgsiService>(NgsiService);
    db = module.get<DbType>(POSTGRES_DB);
  });

  afterAll(async () => {
    // clear the database
    await db.delete(corporateInfos);
    await db.delete(widgetsToPanels);
    await db.delete(tabs);
    await db.delete(widgets);
    await db.delete(panels);
    await db.delete(dashboardsToTenants);
    await db.delete(tenants);
    await db.delete(dashboards);
    await db.delete(queries);
    await db.delete(queryConfigs);
    await db.delete(dataSources);
    await db.delete(authData);
    await db.delete(dataModels);
    await db.delete(groupingElements);

    await app.close();
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

  describe('getAllQueriesWithAllInfos', () => {
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
  });

  describe('queryNeedsUpdate', () => {
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
