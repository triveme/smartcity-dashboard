import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom } from 'rxjs';
import { AxiosError, isAxiosError } from 'axios';
import { TokenData } from './token-data';
import { QueryBatch } from '../ngsi.service';
import { EncryptionUtil } from '../../../dashboard-service/src/util/encryption.util';

@Injectable()
export class AuthService {
  constructor(private readonly httpService: HttpService) {}

  private readonly logger = new Logger(AuthService.name);
  // Dictionary or Object for storing a list of TokenData, made identifiable with key dataSourceId.
  private tokenDataDictionary: { [dataSourceId: string]: TokenData } = {};

  // Update the access token using the refresh token.
  async getUpdatedTokenData(
    queryBatch: QueryBatch,
    refreshToken: string,
  ): Promise<TokenData> {
    try {
      const tokenData =
        this.tokenDataDictionary[queryBatch.query_config.dataSourceId];

      // Check if the token needs to be updated
      if (tokenData && this.doesTokenNeedToUpdate(tokenData)) {
        this.logger.log('Token needs to be updated, refreshing token...');
      }

      if (!refreshToken) {
        // Directly fetch the initial token if refresh token is unavailable
        return await this.getInitialTokenData(queryBatch);
      }

      const { data } = await lastValueFrom(
        this.httpService
          .post(
            queryBatch.auth_data.authUrl,
            {
              grant_type: 'refresh_token',
              client_id: queryBatch.auth_data.clientId,
              client_secret: queryBatch.auth_data.clientSecret,
              refresh_token: refreshToken,
            },
            {
              headers: { 'content-type': 'application/x-www-form-urlencoded' },
            },
          )
          .pipe(
            catchError((error: AxiosError) => {
              this.logger.error(
                'Error during token refresh:',
                error.response?.data,
              );
              throw error;
            }),
          ),
      );

      if (data && data.access_token && data.expires_in) {
        const mappedToken = this.mapExternalTokenData(data);
        this.tokenDataDictionary[queryBatch.query_config.dataSourceId] =
          mappedToken;
        return mappedToken;
      } else {
        this.logger.error('Failed to map auth data for updated token response');
        throw new Error('Token refresh response missing required fields');
      }
    } catch (error) {
      this.logger.warn(
        'Token refresh failed. Falling back to fetching a new token.',
      );
      return await this.getInitialTokenData(queryBatch);
    }
  }

  // Post request for token using appUser specific parameters
  async getAuthTokenRequestWithUserName(
    queryBatch: QueryBatch,
  ): Promise<TokenData> {
    let authCredentials = {};
    if (queryBatch.auth_data.type === 'ngsi-ld') {
      authCredentials = {
        client_id: queryBatch.auth_data.clientId,
        client_secret: queryBatch.auth_data.clientSecret,
        grant_type: 'client_credentials',
      };
    } else {
      authCredentials = {
        grant_type: 'password',
        client_id: queryBatch.auth_data.clientId,
        client_secret: queryBatch.auth_data.clientSecret,
        username: queryBatch.auth_data.appUser,
        password: queryBatch.auth_data.appUserPassword,
        scope: 'api:read api:write api:delete',
      };
    }
    const { data } = await lastValueFrom(
      this.httpService
        .post(queryBatch.auth_data.authUrl, authCredentials, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            if (error.response) {
              this.logger.error('Error Response Data:', error.response.data);
            } else {
              this.logger.error('Error Response is undefined');
            }
            throw error;
          }),
        ),
    );

    if (data && data.access_token && data.expires_in) {
      // if (data && data.access_token && data.expires_in && data.refresh_token) {
      return this.mapExternalTokenData(data);
    } else {
      this.logger.error(
        'Failed to map auth data for token response using appUser request params',
      );
    }
  }

  // Post request for token using api specific parameters
  async getAuthTokenRequestWithApiToken(
    queryBatch: QueryBatch,
  ): Promise<TokenData> {
    const { data } = await lastValueFrom(
      this.httpService
        .post(
          queryBatch.auth_data.authUrl,
          {
            grant_type: 'password',
            client_id: queryBatch.auth_data.clientId,
            client_secret: queryBatch.auth_data.clientSecret,
            username: queryBatch.auth_data.apiToken,
            scope: 'api:read api:write api:delete',
          },
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            if (error.response) {
              this.logger.error('Error Response Data:', error.response.data);
            } else {
              this.logger.error('Error Response is undefined');
            }
            throw error;
          }),
        ),
    );
    if (data && data.access_token && data.expires_in && data.refresh_token) {
      return this.mapExternalTokenData(data);
    } else {
      this.logger.error(
        'Failed to map auth data for updated token response using apiToken request params',
      );
    }
  }

  // Initialize the access token by making a grant request using app-username/password or apiToken.
  async getInitialTokenData(queryBatch: QueryBatch): Promise<TokenData> {
    try {
      let tokenData: TokenData | PromiseLike<TokenData>;

      if (queryBatch.auth_data.appUserPassword) {
        queryBatch.auth_data.appUserPassword = EncryptionUtil.decryptPassword(
          queryBatch.auth_data.appUserPassword as object,
        );
      }

      if (queryBatch.auth_data.clientSecret) {
        queryBatch.auth_data.clientSecret = EncryptionUtil.decryptPassword(
          queryBatch.auth_data.clientSecret as object,
        );
      }

      if (queryBatch.auth_data.apiToken) {
        tokenData = await this.getAuthTokenRequestWithApiToken(queryBatch);
      } else {
        tokenData = await this.getAuthTokenRequestWithUserName(queryBatch);
      }
      // Add tokenData instance to dictionary
      this.tokenDataDictionary[queryBatch.query_config.dataSourceId] =
        tokenData;
      return tokenData;
    } catch (error) {
      if (isAxiosError(error)) {
        // Handle network errors
        this.logger.error(
          'Initial authentication request failed:',
          error.message,
        );
      } else {
        // Handle application-level errors
        this.logger.error(
          'An error occurred during authentication:',
          error.message,
        );
      }
      throw error; // Rethrow the error for higher-level handling if needed
    }
  }

  mapExternalTokenData(externalTokenData): TokenData {
    const currentTimestamp = new Date().getTime();
    const expirationTimestamp = new Date(
      currentTimestamp + externalTokenData.expires_in * 1000,
    );

    return {
      accessToken: externalTokenData.access_token,
      refreshToken: externalTokenData.refresh_token || '',
      expiresIn: expirationTimestamp,
    };
  }

  /**
   * Check if the access token needs to be updated based on its expiration time.
   * @returns true if the token needs to be updated, false otherwise.
   */
  doesTokenNeedToUpdate(tokenData: TokenData): boolean {
    const currentTime = new Date();
    this.logger.log('Current Time: ', currentTime);
    // Both expiresIn and currentTime are in timestamp formatting: e.g. 2023-10-24T12:44:40.497Z
    this.logger.log('Authentication token expires in: ', tokenData.expiresIn);

    return tokenData.expiresIn <= currentTime;
  }

  /**
   * Get the access token by dataSourceId, updating it if necessary.
   * @returns Current access token.
   */
  async getAccessTokenByQuery(queryBatch: QueryBatch): Promise<string> {
    try {
      let tokenData =
        this.tokenDataDictionary[queryBatch.query_config.dataSourceId];

      if (tokenData == undefined || !tokenData.accessToken) {
        tokenData = await this.getInitialTokenData(queryBatch);
      }

      if (this.doesTokenNeedToUpdate(tokenData)) {
        tokenData = await this.getUpdatedTokenData(
          queryBatch,
          tokenData.refreshToken,
        );
      }
      return tokenData.accessToken;
    } catch (error) {
      // Handle return error.
      this.logger.error(
        `Could not get access token for data source with id: ${queryBatch.data_source.id}`,
      );
      this.logger.error(error.response);
      this.logger.error(error);
    }
  }
}
