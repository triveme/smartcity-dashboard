import { Test, TestingModule } from '@nestjs/testing';
import { DataService } from '../data.service';
import { HttpModule } from '@nestjs/axios';
import { getQueryBatch, getTabQueryWithAllInfos } from './test-data';
import { config } from 'dotenv';
import {
  getNGSIHistoricSingleEntityQuery,
  getNGSILiveQuery,
} from '../../../../dashboard-service/src/query/test/test-data';
import { AuthService } from '../../auth/auth.service';
import axios, { AxiosError } from 'axios';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { NgsiModule } from '../../ngsi.module';
import { INestApplication } from '@nestjs/common';
import {
  runLocalDatabasePreparation,
  truncateTables,
} from '../../../../test/database-operations/prepare-database';
import { Client } from 'pg';

describe('DataService (e2e)', () => {
  let app: INestApplication;
  let client: Client;
  let db: DbType;
  let dataService: DataService;
  let authService: AuthService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, NgsiModule],
      providers: [DataService, AuthService],
    }).compile();

    dataService = module.get<DataService>(DataService);
    authService = module.get<AuthService>(AuthService);

    app = module.createNestApplication();
    await app.init();

    client = await runLocalDatabasePreparation();

    db = module.get<DbType>(POSTGRES_DB);
  });

  beforeEach(async () => {
    await truncateTables(client);
  });

  afterAll(async () => {
    await app.close();
  });

  it('dataService should be defined', () => {
    expect(dataService).toBeDefined();
  });

  describe('fetch data', () => {
    beforeAll(() => {
      config({
        path: '.env.testing',
      });
    });

    it('should fetch live data from data source', async () => {
      const queryBatch = await getQueryBatch();
      const query = getNGSILiveQuery();
      query.id = queryBatch.queryIds[0];

      jest
        .spyOn(authService, 'getAccessTokenByQuery')
        .mockReturnValue(Promise.resolve('token'));
      const spyInstance = jest
        .spyOn(axios, 'get')
        .mockImplementation(async () => {
          return {
            data: query,
          };
        });

      const data = await dataService.getDataFromDataSource(queryBatch);

      expect(data).toMatchObject(query);
      expect(spyInstance).toHaveBeenCalledWith(queryBatch.auth_data.liveUrl, {
        headers: {
          'Fiware-Service': queryBatch.query_config.fiwareService,
          'Fiware-ServicePath': queryBatch.query_config.fiwareServicePath,
          Authorization: `Bearer token`,
        },
        params: {
          id: queryBatch.query_config.entityIds.join(','),
          attrs: queryBatch.query_config.attributes.join(','),
          type: queryBatch.query_config.fiwareType,
        },
      });
    });

    // it('should fetch image data from data source', async () => {
    //   const tabQuery = await getTabQueryWithAllInfos(db);

    //   jest
    //     .spyOn(authService, 'getAccessTokenByQuery')
    //     .mockReturnValue(Promise.resolve('token'));
    //   const spyInstance = jest
    //     .spyOn(axios, 'get')
    //     .mockImplementation(async () => {
    //       return {
    //         status: 200,
    //         data: Buffer.from(getBase64ImageBuffer(), 'base64'),
    //       };
    //     });

    //   const data = await dataService.getImageFromSource(tabQuery);

    //   expect(data).toMatch(tabQuery.query.queryData['imageData']);
    //   expect(spyInstance).toHaveBeenCalledWith(tabQuery.tab.imageUrl, {
    //     headers: {
    //       'User-Agent': 'Smart City Dashboard Service',
    //     },
    //     responseType: 'arraybuffer',
    //     timeout: 5000,
    //   });
    // });

    it("should fetch image data from data source but doesn't get 200", async () => {
      const tabQuery = await getTabQueryWithAllInfos(db);

      jest
        .spyOn(authService, 'getAccessTokenByQuery')
        .mockReturnValue(Promise.resolve('token'));
      const spyInstance = jest
        .spyOn(axios, 'get')
        .mockImplementation(async () => {
          return {
            status: 404,
          };
        });

      const data = await dataService.getImageFromSource(tabQuery);

      expect(data).toMatch('404');
      expect(spyInstance).toHaveBeenCalledWith(tabQuery.tab.imageUrl, {
        headers: {
          'User-Agent': 'Smart City Dashboard Service',
        },
        responseType: 'arraybuffer',
        timeout: 5000,
      });
    });

    it('should fetch image data from data source but does get error', async () => {
      const tabQuery = await getTabQueryWithAllInfos(db);

      jest
        .spyOn(authService, 'getAccessTokenByQuery')
        .mockReturnValue(Promise.resolve('token'));
      const spyInstance = jest
        .spyOn(axios, 'get')
        .mockImplementation(async () => {
          throw new AxiosError('Error');
        });

      const data = await dataService.getImageFromSource(tabQuery);

      expect(data).toBeUndefined();
      expect(spyInstance).toHaveBeenCalledWith(tabQuery.tab.imageUrl, {
        headers: {
          'User-Agent': 'Smart City Dashboard Service',
        },
        responseType: 'arraybuffer',
        timeout: 5000,
      });
    });

    it.each(['day', 'hour', 'week', 'month', 'year'])(
      'should fetch historical data from data source',
      async (timeframe: 'live' | 'hour' | 'day' | 'week' | 'month') => {
        const queryBatch = await getQueryBatch();
        queryBatch.query_config.timeframe = timeframe;

        const query = getNGSIHistoricSingleEntityQuery();
        query.id = queryBatch.queryIds[0];

        const now = Date.now();
        jest.spyOn(Date, 'now').mockReturnValue(now);
        jest
          .spyOn(authService, 'getAccessTokenByQuery')
          .mockReturnValue(Promise.resolve('token'));
        const spyInstance = jest
          .spyOn(axios, 'get')
          .mockImplementation(async () => {
            return {
              data: query,
            };
          });

        const data = await dataService.getDataFromDataSource(queryBatch);

        expect(data).toMatchObject(query);
        expect(spyInstance).toHaveBeenCalledWith(
          queryBatch.auth_data.timeSeriesUrl,
          {
            headers: {
              'Fiware-Service': queryBatch.query_config.fiwareService,
              'Fiware-ServicePath': queryBatch.query_config.fiwareServicePath,
              Authorization: `Bearer token`,
            },
            params: {
              id: queryBatch.query_config.entityIds.join(','),
              fromDate: getFromDate(timeframe),
              attrs: queryBatch.query_config.attributes.join(','),
              type: queryBatch.query_config.fiwareType,
              toDate: new Date(now),
            },
          },
        );
      },
    );

    it('should handle an error while fetching data', async () => {
      const queryBatch = await getQueryBatch();
      queryBatch.query_config.timeframe = 'hour';

      const query = getNGSILiveQuery();
      query.id = queryBatch.queryIds[0];

      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);
      jest
        .spyOn(authService, 'getAccessTokenByQuery')
        .mockReturnValue(Promise.resolve('token'));
      const spyInstance = jest
        .spyOn(axios, 'get')
        .mockImplementation(async () => {
          throw new AxiosError('Test');
        });

      const data = await dataService.getDataFromDataSource(queryBatch);

      expect(data).toBeUndefined();
      expect(spyInstance).toHaveBeenCalledWith(
        queryBatch.auth_data.timeSeriesUrl,
        {
          headers: {
            'Fiware-Service': queryBatch.query_config.fiwareService,
            'Fiware-ServicePath': queryBatch.query_config.fiwareServicePath,
            Authorization: `Bearer token`,
          },
          params: {
            id: queryBatch.query_config.entityIds.join(','),
            fromDate: getFromDate('hour'),
            attrs: queryBatch.query_config.attributes.join(','),
            type: queryBatch.query_config.fiwareType,
            toDate: new Date(now),
          },
        },
      );
    });

    it('should handle an undefined token', async () => {
      const queryBatch = await getQueryBatch();
      queryBatch.query_config.timeframe = 'hour';

      const query = getNGSILiveQuery();
      query.id = queryBatch.queryIds[0];

      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);
      jest
        .spyOn(authService, 'getAccessTokenByQuery')
        .mockReturnValue(Promise.resolve(undefined));
      const spyInstance = jest
        .spyOn(axios, 'get')
        .mockImplementation(async () => {
          throw new AxiosError('Test');
        });

      const data = await dataService.getDataFromDataSource(queryBatch);

      expect(data).toBeUndefined();
      expect(spyInstance).toHaveBeenCalledWith(
        queryBatch.auth_data.timeSeriesUrl,
        {
          headers: {
            'Fiware-Service': queryBatch.query_config.fiwareService,
            'Fiware-ServicePath': queryBatch.query_config.fiwareServicePath,
            Authorization: `Bearer undefined`,
          },
          params: {
            id: queryBatch.query_config.entityIds.join(','),
            fromDate: getFromDate('hour'),
            attrs: queryBatch.query_config.attributes.join(','),
            type: queryBatch.query_config.fiwareType,
            toDate: new Date(now),
          },
        },
      );
    });

    it('should handle an error while fetching token', async () => {
      const queryBatch = await getQueryBatch();
      queryBatch.query_config.timeframe = 'hour';

      const query = getNGSILiveQuery();
      query.id = queryBatch.queryIds[0];

      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now);
      jest
        .spyOn(authService, 'getAccessTokenByQuery')
        .mockReturnValue(Promise.reject());
      jest.spyOn(axios, 'get').mockImplementation(async () => {
        throw new AxiosError('Test');
      });

      const data = await dataService.getDataFromDataSource(queryBatch);

      expect(data).toBeUndefined();
    });
  });

  function getFromDate(
    timeframe: 'live' | 'hour' | 'day' | 'week' | 'month' | 'year',
  ): string {
    const now = new Date();
    let fromDate: Date;

    if (timeframe === 'hour') {
      fromDate = new Date(now.getTime() - 60 * 60 * 1000);
    } else if (timeframe === 'day') {
      fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (timeframe === 'week') {
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (timeframe === 'month') {
      fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (timeframe === 'year') {
      fromDate = new Date(now.getTime() - 12 * 30 * 24 * 60 * 60 * 1000);
    }

    return formatToIso(fromDate);
  }

  function formatToIso(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  }
});
