import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule, HttpService } from '@nestjs/axios';
import { AxiosResponse, AxiosHeaders } from 'axios';
import { of } from 'rxjs';
import { AuthService, KeycloakResponse } from '../auth/auth.service';

describe('AuthService', () => {
  let authService: AuthService;
  let httpService: HttpService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [AuthService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('authService should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('getTokenData', () => {
    it('should return valid token data when provided with valid input', async () => {
      const toSend = {
        username: 'testUser',
        password: 'testPassword',
      };

      const mockResponse: AxiosResponse<KeycloakResponse> = {
        data: {
          access_token: 'validAccessToken',
          expires_in: 3600,
        },
        status: 200,
        statusText: 'OK',
        headers: new AxiosHeaders(),
        config: {
          headers: new AxiosHeaders(),
        },
      };

      jest.spyOn(httpService, 'post').mockReturnValue(of(mockResponse));

      const result = await authService.getTokenData(toSend);

      expect(result.access_token).toEqual('validAccessToken');
      expect(result.expires_in).toEqual(3600);
    });

    it('should throw an error when the response is an error', async () => {
      const toSend = {
        username: 'testUser',
        password: 'testPassword',
      };

      jest.spyOn(httpService, 'post').mockImplementation(() => {
        throw new Error('Test Error');
      });

      await expect(authService.getTokenData(toSend)).rejects.toThrow(
        'Test Error',
      );
    });

    it('should log an error and throw when no data is provided', async () => {
      jest.spyOn(authService['logger'], 'error').mockImplementation(() => {});

      await expect(authService.getTokenData()).rejects.toThrow(
        'Using old authentication method',
      );
      expect(authService['logger'].error).toHaveBeenCalledWith(
        'Using old authentication method',
      );
    });

    it('should handle errors returned from the HTTP request', async () => {
      const toSend = {
        username: 'testUser',
        password: 'testPassword',
      };

      jest.spyOn(httpService, 'post').mockImplementation(() => {
        throw new Error('Internal Server Error');
      });

      await expect(authService.getTokenData(toSend)).rejects.toThrow(
        'Internal Server Error',
      );
    });
  });
});
