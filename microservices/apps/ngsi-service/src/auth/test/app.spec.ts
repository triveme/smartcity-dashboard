import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { HttpModule, HttpService } from '@nestjs/axios';
import * as http from 'http';
import { getQueryBatch } from './test-data';
import { config } from 'dotenv';

describe('AuthService (e2e)', () => {
  let authService: AuthService;
  let httpService: HttpService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [AuthService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    httpService = module.get<HttpService>(HttpService);
    httpService.axiosRef.defaults.baseURL = 'http://localhost:1234';
  });

  it('authService should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('httpService should be defined', () => {
    expect(httpService).toBeDefined();
  });

  let server;

  beforeAll((done) => {
    // create a dummy authentication server => http://localhost:1234
    server = http.createServer((req, res) => {
      if (req.url === '/token' && req.method === 'POST') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        let body = '';

        req.on('data', (chunk) => {
          body += chunk.toString();
        });

        req.on('end', () => {
          if (body.includes('grant_type=refresh_token')) {
            res.end(
              JSON.stringify({
                access_token: 'validAccessToken',
                expires_in: 3600,
                refresh_token: 'validRefreshToken',
              }),
            );
          } else {
            res.end(
              JSON.stringify({
                access_token: 'validAccessToken',
                expires_in: 3600,
                refresh_token: 'validRefreshToken',
              }),
            );
          }
        });
      } else {
        res.writeHead(404);
        res.end('Not Found');
      }
    });

    server.listen(1234, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('getUpdatedTokenData', () => {
    beforeAll(() => {
      config({
        path: '.env.testing',
      });
    });

    it('should update and return valid AuthData for a given refreshToken', async () => {
      const refreshToken = 'validRefreshToken';

      httpService.axiosRef.defaults.baseURL = 'http://localhost:1234';

      const queryBatch = await getQueryBatch();
      queryBatch.auth_data.authUrl = `${httpService.axiosRef.defaults.baseURL}/token`;

      const authData = await authService.getUpdatedTokenData(
        queryBatch,
        refreshToken,
      );

      expect(authData.accessToken).toEqual('validAccessToken');
      expect(authData.expiresIn.toISOString()).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
      );
      expect(authData.refreshToken).toEqual('validRefreshToken');
    });
  });

  describe('getInitialTokenData', () => {
    it('should authenticate and return valid AuthData for initial request and with API-Token', async () => {
      httpService.axiosRef.defaults.baseURL = 'http://localhost:1234';

      const queryBatch = await getQueryBatch();
      queryBatch.auth_data.authUrl = `${httpService.axiosRef.defaults.baseURL}/token`;

      const authData = await authService.getInitialTokenData(queryBatch);

      expect(authData.accessToken).toEqual('validAccessToken');
      expect(authData.expiresIn.toISOString()).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
      );
      expect(authData.refreshToken).toEqual('validRefreshToken');
    });

    it('should authenticate and return valid AuthData for initial request and without API-Token', async () => {
      httpService.axiosRef.defaults.baseURL = 'http://localhost:1234';

      const queryBatch = await getQueryBatch();
      queryBatch.auth_data.authUrl = `${httpService.axiosRef.defaults.baseURL}/token`;

      delete queryBatch.auth_data.apiToken;

      const authData = await authService.getInitialTokenData(queryBatch);

      expect(authData.accessToken).toEqual('validAccessToken');
      expect(authData.expiresIn.toISOString()).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
      );
      expect(authData.refreshToken).toEqual('validRefreshToken');
    });
  });

  describe('getAccessTokenByQuery', () => {
    it('should return a valid access token for a given dataSourceId with an expired token', async () => {
      const dataSourceId = 'exampleDataSourceId';
      const tokenDataDictionary = authService['tokenDataDictionary'];

      tokenDataDictionary[dataSourceId] = {
        accessToken: 'expiredAccessToken',
        refreshToken: 'validRefreshToken',
        expiresIn: new Date(),
      };

      authService['authDataDictionary'] = tokenDataDictionary;

      const queryBatch = await getQueryBatch();
      queryBatch.auth_data.authUrl = `${httpService.axiosRef.defaults.baseURL}/token`;

      const accessToken = await authService.getAccessTokenByQuery(queryBatch);

      expect(accessToken).toEqual('validAccessToken');
    });
  });
});
