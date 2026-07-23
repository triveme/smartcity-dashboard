import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { HttpModule } from '@nestjs/axios';
import { getQueryBatch } from './test-data';
import axios, { AxiosError } from 'axios';
import { runLocalDatabasePreparation } from '../../../../test/database-operations/prepare-database';

describe('AuthService (e2e)', () => {
  let authService: AuthService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [AuthService],
    }).compile();

    await runLocalDatabasePreparation();

    authService = module.get<AuthService>(AuthService);
  });

  it('authService should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('getUpdatedTokenData', () => {
    it('should update and return valid AuthData for a given refreshToken', async () => {
      const refreshToken = 'validRefreshToken';

      const queryBatch = await getQueryBatch();
      queryBatch.auth_data.authUrl = `localhost:8080/token`;

      const spyInstance = jest.spyOn(axios, 'post').mockReturnValue(
        Promise.resolve({
          data: {
            access_token: 'validAccessToken',
            expires_in: 3600,
            refresh_token: 'validRefreshToken',
          },
        }),
      );

      const authData = await authService.getUpdatedTokenData(
        queryBatch,
        refreshToken,
      );

      expect(authData.accessToken).toEqual('validAccessToken');
      expect(authData.expiresIn.toISOString()).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
      );
      expect(authData.refreshToken).toEqual('validRefreshToken');
      expect(spyInstance).toHaveBeenCalledWith(
        queryBatch.auth_data.authUrl,
        expect.objectContaining({
          grant_type: 'refresh_token',
          client_id: queryBatch.auth_data.clientId,
          client_secret: queryBatch.auth_data.clientSecret,
          refresh_token: refreshToken,
        }),
        expect.any(Object),
      );
    });

    it('should throw on update for a given refreshToken', async () => {
      const refreshToken = 'validRefreshToken';

      const queryBatch = await getQueryBatch();
      queryBatch.auth_data.authUrl = `localhost:8080/token`;

      jest.spyOn(axios, 'post').mockImplementation(() => {
        throw new AxiosError('Test');
      });

      expect(
        authService.getUpdatedTokenData(queryBatch, refreshToken),
      ).rejects.toThrow();
    });
  });

  describe('getInitialTokenData', () => {
    it('should authenticate and return valid AuthData for initial request and with API-Token', async () => {
      const queryBatch = await getQueryBatch();
      queryBatch.auth_data.authUrl = `localhost:8080/token`;

      const spyInstance = jest.spyOn(axios, 'post').mockReturnValue(
        Promise.resolve({
          data: {
            access_token: 'validAccessToken',
            expires_in: 3600,
            refresh_token: 'validRefreshToken',
          },
        }),
      );
      const authData = await authService.getInitialTokenData(queryBatch);

      expect(authData.accessToken).toEqual('validAccessToken');
      expect(authData.expiresIn.toISOString()).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
      );
      expect(authData.refreshToken).toEqual('validRefreshToken');
      expect(spyInstance).toHaveBeenCalledWith(
        queryBatch.auth_data.authUrl,
        expect.objectContaining({
          grant_type: 'password',
          client_id: queryBatch.auth_data.clientId,
          client_secret: queryBatch.auth_data.clientSecret,
          username: queryBatch.auth_data.apiToken,
          scope: 'api:read api:write api:delete',
        }),
        expect.objectContaining({
          headers: expect.any(Object),
        }),
      );
    });

    it('should authenticate and return valid AuthData for initial request and without API-Token', async () => {
      const queryBatch = await getQueryBatch();
      queryBatch.auth_data.authUrl = `localhost:8080/token`;

      delete queryBatch.auth_data.apiToken;

      const spyInstance = jest.spyOn(axios, 'post').mockReturnValue(
        Promise.resolve({
          data: {
            access_token: 'validAccessToken',
            expires_in: 3600,
            refresh_token: 'validRefreshToken',
          },
        }),
      );
      const authData = await authService.getInitialTokenData(queryBatch);

      expect(authData.accessToken).toEqual('validAccessToken');
      expect(authData.expiresIn.toISOString()).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/,
      );
      expect(authData.refreshToken).toEqual('validRefreshToken');
      expect(spyInstance).toHaveBeenCalledWith(
        queryBatch.auth_data.authUrl,
        expect.objectContaining({
          grant_type: 'password',
          client_id: queryBatch.auth_data.clientId,
          client_secret: queryBatch.auth_data.clientSecret,
          username: queryBatch.auth_data.appUser,
          password: queryBatch.auth_data.appUserPassword,
          scope: 'api:read api:write api:delete',
        }),
        expect.objectContaining({
          headers: expect.any(Object),
        }),
      );
    });

    it('should authenticate and return valid AuthData for initial request and with Error', async () => {
      const queryBatch = await getQueryBatch();
      queryBatch.auth_data.authUrl = `localhost:8080/token`;

      delete queryBatch.auth_data.apiToken;

      jest.spyOn(axios, 'post').mockImplementation(() => {
        throw new AxiosError('Not working');
      });

      expect(authService.getInitialTokenData(queryBatch)).rejects.toThrow();
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
      queryBatch.auth_data.authUrl = `localhost:8080/token`;

      const spyInstance = jest.spyOn(axios, 'post').mockReturnValue(
        Promise.resolve({
          data: {
            access_token: 'validAccessToken',
            expires_in: 3600,
            refresh_token: 'validRefreshToken',
          },
        }),
      );
      const accessToken = await authService.getAccessTokenByQuery(queryBatch);

      expect(accessToken).toEqual('validAccessToken');
      expect(spyInstance).toHaveBeenCalledWith(
        queryBatch.auth_data.authUrl,
        expect.objectContaining({
          grant_type: 'password',
          client_id: queryBatch.auth_data.clientId,
          client_secret: queryBatch.auth_data.clientSecret,
          username: queryBatch.auth_data.apiToken,
          scope: 'api:read api:write api:delete',
        }),
        expect.objectContaining({
          headers: expect.any(Object),
        }),
      );
    });

    it('should throw an error when fetching a valid access token for a given dataSourceId with an expired token', async () => {
      const dataSourceId = 'exampleDataSourceId';
      const tokenDataDictionary = authService['tokenDataDictionary'];

      tokenDataDictionary[dataSourceId] = {
        accessToken: 'expiredAccessToken',
        refreshToken: 'validRefreshToken',
        expiresIn: new Date(),
      };

      authService['authDataDictionary'] = tokenDataDictionary;

      const queryBatch = await getQueryBatch();
      queryBatch.auth_data.authUrl = `localhost:8080/token`;

      jest.spyOn(axios, 'post').mockImplementation(() => {
        throw new AxiosError('Not working');
      });

      const refreshedToken =
        await authService.getAccessTokenByQuery(queryBatch);
      expect(refreshedToken).toBeUndefined();
    });
  });
});
