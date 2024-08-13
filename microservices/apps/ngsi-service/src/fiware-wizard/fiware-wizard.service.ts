import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { Inject, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AuthData, authData } from '@app/postgres-db/schemas/auth-data.schema';
import { eq } from 'drizzle-orm';
import { lastValueFrom } from 'rxjs';
import { EncryptionUtil } from '../../../dashboard-service/src/util/encryption.util';
import {
  DataSource,
  dataSources,
} from '@app/postgres-db/schemas/data-source.schema';
import { checkAuthorizationToRead } from '@app/auth-helper/right-management/right-management.service';

type PreparedNgsiEntityRequest = {
  entitiesUrl: string;
  headers: {
    Authorization: string;
    'fiware-service': string;
  };
};

@Injectable()
export class FiwareWizardService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly httpService: HttpService,
  ) {}

  async getDataSourceById(dataSourceId: string): Promise<DataSource> {
    const result = await this.db
      .select()
      .from(dataSources)
      .where(eq(dataSources.id, dataSourceId));
    return result.length > 0 ? result[0] : null;
  }

  async getAuthDataById(
    authDataId: string,
    rolesFromRequest?: string[],
  ): Promise<AuthData> {
    const result = await this.db
      .select()
      .from(authData)
      .where(eq(authData.id, authDataId));

    checkAuthorizationToRead(result[0], rolesFromRequest);
    return result.length > 0 ? result[0] : null;
  }

  private async getToken(
    dataSourceId: string,
    rolesFromRequest: string[],
  ): Promise<string> {
    try {
      const selectedDataSource = await this.getDataSourceById(dataSourceId);

      const relatedAuthData = await this.getAuthDataById(
        selectedDataSource.authDataId,
        rolesFromRequest,
      );

      if (!relatedAuthData) {
        throw new HttpException('AuthData not found', HttpStatus.NOT_FOUND);
      }

      relatedAuthData.clientSecret = EncryptionUtil.decryptPassword(
        relatedAuthData.clientSecret as object,
      );
      relatedAuthData.appUserPassword = EncryptionUtil.decryptPassword(
        relatedAuthData.appUserPassword as object,
      );

      const authResponse = await lastValueFrom(
        this.httpService.post(
          relatedAuthData.authUrl,
          {
            grant_type: 'password',
            client_id: relatedAuthData.clientId,
            client_secret: relatedAuthData.clientSecret,
            username: relatedAuthData.appUser,
            password: relatedAuthData.appUserPassword,
            scope: 'api:read',
          },
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      return authResponse.data.access_token;
    } catch (error) {
      throw new HttpException(
        'Failed to get authentication token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  private async prepareRequest(
    fiwareService: string,
    dataSourceId: string,
    rolesFromRequest: string[],
  ): Promise<PreparedNgsiEntityRequest> {
    const selectedDataSource = await this.getDataSourceById(dataSourceId);

    if (!selectedDataSource) {
      throw new HttpException(
        `DataSource with id ${dataSourceId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const relatedAuthData = await this.getAuthDataById(
      selectedDataSource.authDataId,
      rolesFromRequest,
    );

    if (!relatedAuthData) {
      throw new HttpException(
        `AuthData not found for DataSource of id ${dataSourceId}`,
        HttpStatus.NOT_FOUND,
      );
    }

    const token = await this.getToken(dataSourceId, rolesFromRequest);
    const headers = {
      Authorization: `Bearer ${token}`,
      'fiware-service': fiwareService,
    };

    return {
      entitiesUrl: relatedAuthData.liveUrl,
      headers,
    };
  }

  async getTypes(
    fiwareService: string,
    dataSourceId: string,
    rolesFromRequest: string[],
  ): Promise<string[]> {
    const { entitiesUrl, headers } = await this.prepareRequest(
      fiwareService,
      dataSourceId,
      rolesFromRequest,
    );

    try {
      const entitiesResponse = await lastValueFrom(
        this.httpService.get(entitiesUrl, { headers }),
      );

      const types = entitiesResponse.data.map((entity) => entity.type);
      return Array.from(new Set(types));
    } catch (error) {
      throw new HttpException(
        'Failed to fetch Fiware Types',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getEntityIds(
    fiwareService: string,
    dataSourceId: string,
    rolesFromRequest: string[],
    type?: string,
  ): Promise<string[]> {
    const { entitiesUrl, headers } = await this.prepareRequest(
      fiwareService,
      dataSourceId,
      rolesFromRequest,
    );

    try {
      const entitiesResponse = await lastValueFrom(
        this.httpService.get(entitiesUrl, { headers }),
      );

      // Filter entities by the optional fiwareType
      const filteredEntities = type
        ? entitiesResponse.data.filter((entity) => entity.type === type)
        : entitiesResponse.data;

      // Map to extract IDs of filtered entities
      return filteredEntities.map((entity) => entity.id);
    } catch (error) {
      throw new HttpException(
        'Failed to fetch Fiware Entity IDs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getEntityAttributes(
    fiwareService: string,
    dataSourceId: string,
    rolesFromRequest: string[],
    entityId?: string,
  ): Promise<string[]> {
    const { entitiesUrl, headers } = await this.prepareRequest(
      fiwareService,
      dataSourceId,
      rolesFromRequest,
    );

    try {
      const entitiesResponse = await lastValueFrom(
        this.httpService.get(entitiesUrl, { headers }),
      );

      // // Filter entities by the optional entityId
      const filteredEntities = entityId
        ? entitiesResponse.data.filter((entity) => entity.id === entityId)
        : entitiesResponse.data;

      // Set to collect unique attribute names
      const attributesSet: Set<string> = new Set();
      // Add all keys which are not an id or a type to the set
      filteredEntities.forEach((entity) => {
        Object.keys(entity).forEach((key) => {
          if (key !== 'id' && key !== 'type') {
            attributesSet.add(key);
          }
        });
      });

      // Return set of attribute strings as an array
      return Array.from(attributesSet);
    } catch (error) {
      throw new HttpException(
        'Failed to fetch Fiware Entity Attributes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
