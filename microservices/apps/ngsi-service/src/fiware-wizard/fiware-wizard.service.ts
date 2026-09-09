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
import axios from 'axios';
import {
  DataPlatformQueue,
  DataPlatformQueueFingerprintInput,
  createCredentialFingerprint,
} from '@app/data-platform-queue';

type PreparedNgsiV2EntityRequest = {
  entitiesUrl: string;
  headers: {
    Authorization: string;
    'fiware-service': string;
  };
};

type PreparedNgsiLdEntityRequest = {
  entitiesUrl: string;
  headers: {
    Authorization: string;
    'NGSILD-Tenant': string;
    Link: string;
  };
};

@Injectable()
export class FiwareWizardService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly httpService: HttpService,
    private readonly queue: DataPlatformQueue,
  ) {}

  async executeWizardFetch<T>(
    operation: string,
    dataSourceId: string,
    rolesFromRequest: string[],
    runtimeParameters: object,
    execute: (signal: AbortSignal) => Promise<T>,
  ): Promise<T> {
    const dataSource = await this.getDataSourceById(dataSourceId);
    const relatedAuthData = await this.getAuthDataById(
      dataSource.authDataId,
      rolesFromRequest,
    );
    const fingerprintInput: DataPlatformQueueFingerprintInput = {
      platform: 'ngsi',
      operation,
      target: {
        dataSourceId,
        authDataId: relatedAuthData.id,
        liveUrl: relatedAuthData.liveUrl,
        credentialFingerprint: createCredentialFingerprint(
          JSON.stringify({
            authDataId: relatedAuthData.id,
            clientId: relatedAuthData.clientId,
            clientSecret: relatedAuthData.clientSecret,
            appUser: relatedAuthData.appUser,
            appUserPassword: relatedAuthData.appUserPassword,
          }),
        ),
        roles: [...rolesFromRequest].sort(),
      },
      queryConfig: {},
      runtimeParameters,
    };
    return this.queue.enqueue({
      category: 'wizard',
      priority: 'interactive',
      fingerprint: this.queue.createFingerprint(fingerprintInput),
      execute,
    });
  }

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
    signal?: AbortSignal,
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
            signal,
          },
        ),
      );

      return authResponse.data.access_token;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to get authentication token',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  private async prepareRequestNgsiV2(
    fiwareService: string,
    dataSourceId: string,
    rolesFromRequest: string[],
    signal?: AbortSignal,
  ): Promise<PreparedNgsiV2EntityRequest> {
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

    const token = await this.getToken(dataSourceId, rolesFromRequest, signal);
    const headers = {
      Authorization: `Bearer ${token}`,
      'fiware-service': fiwareService,
    };

    return {
      entitiesUrl: relatedAuthData.liveUrl,
      headers,
    };
  }

  private async prepareRequestNgsiLd(
    dataSourceId: string,
    rolesFromRequest: string[],
    signal?: AbortSignal,
  ): Promise<PreparedNgsiLdEntityRequest> {
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

    const token = await this.getToken(dataSourceId, rolesFromRequest, signal);
    const headers = {
      Authorization: `Bearer ${token}`,
      'NGSILD-Tenant': relatedAuthData.ngsildTenant,
      Link: `<${relatedAuthData.ngsildContextUrl}>; rel="http://www.w3.org/ns/json-ld#context"; type="application/ld+json"`,
    };

    return {
      entitiesUrl: relatedAuthData.liveUrl,
      headers,
    };
  }

  async getTypesNgsiV2(
    fiwareService: string,
    dataSourceId: string,
    rolesFromRequest: string[],
    signal?: AbortSignal,
  ): Promise<string[]> {
    const { entitiesUrl, headers } = await this.prepareRequestNgsiV2(
      fiwareService,
      dataSourceId,
      rolesFromRequest,
      signal,
    );
    const url = new URL(entitiesUrl);

    // Adjusting URl to call the NGSI endpoint for 'v1/types'.
    // Check if the URL contains the word 'entities'.
    // If so, process the URL, replacing 'entities' with 'types'.
    const typesUrl = url.toString().includes('entities')
      ? entitiesUrl.replace('entities', 'types')
      : entitiesUrl;

    try {
      url.searchParams.set('limit', '1000');
      const entitiesResponse = await lastValueFrom(
        this.httpService.get(typesUrl, { headers, signal }),
      );
      const types = entitiesResponse.data.map((entity) => entity.type);
      return Array.from(new Set(types));
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to fetch Fiware Types',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTypesNgsiLd(
    fiwareService: string,
    dataSourceId: string,
    rolesFromRequest: string[],
    signal?: AbortSignal,
  ): Promise<string[]> {
    const { entitiesUrl, headers } = await this.prepareRequestNgsiLd(
      dataSourceId,
      rolesFromRequest,
      signal,
    );
    const url = new URL(entitiesUrl);

    // Adjusting URl to call the NGSI endpoint for 'v1/types'.
    // Check if the URL contains the word 'entities'.
    // If so, process the URL, replacing 'entities' with 'types'.
    const typesUrl = url.toString().includes('entities')
      ? entitiesUrl.replace('entities', 'types')
      : entitiesUrl;

    try {
      url.searchParams.set('limit', '1000');
      const entitiesResponse = await lastValueFrom(
        this.httpService.get(typesUrl, { headers, signal }),
      );

      const types = entitiesResponse.data.typeList.map((entity) => entity);
      return Array.from(new Set(types));
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to fetch Fiware Types',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getEntityIdsNgsiV2(
    fiwareService: string,
    dataSourceId: string,
    rolesFromRequest: string[],
    type?: string,
    signal?: AbortSignal,
  ): Promise<string[]> {
    const { entitiesUrl, headers } = await this.prepareRequestNgsiV2(
      fiwareService,
      dataSourceId,
      rolesFromRequest,
      signal,
    );
    const url = new URL(entitiesUrl);

    let allEntityIds: string[] = [];
    let offset = 0;
    const limit = 1000;

    try {
      // Continue fetching entities in batches of 1000 until no more are found
      let hasMoreEntities = true;
      while (hasMoreEntities) {
        url.searchParams.set('limit', limit.toString());
        url.searchParams.set('offset', offset.toString());
        if (type) url.searchParams.set('type', type);

        const entitiesResponse = await lastValueFrom(
          this.httpService.get(url.toString(), { headers, signal }),
        );

        const entities = type
          ? entitiesResponse.data.filter((entity) => entity.type === type)
          : entitiesResponse.data;

        // Extract entity IDs from the current batch and add them to the result array
        const entityIds = entities.map((entity) => entity.id);
        allEntityIds = allEntityIds.concat(entityIds);

        // If fewer than 1000 entities were returned, we've reached the last page
        hasMoreEntities = entityIds.length === limit;

        // Increment the offset to fetch the next batch
        if (hasMoreEntities) {
          offset += limit;
        }
      }
      return allEntityIds;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to fetch Fiware Entity IDs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getEntityIdsNgsiLd(
    fiwareService: string,
    dataSourceId: string,
    rolesFromRequest: string[],
    type?: string,
    signal?: AbortSignal,
  ): Promise<string[]> {
    const { entitiesUrl, headers } = await this.prepareRequestNgsiLd(
      dataSourceId,
      rolesFromRequest,
      signal,
    );
    const url = new URL(entitiesUrl);

    let allEntityIds: string[] = [];
    let offset = 0;
    const limit = 100;

    try {
      // Continue fetching entities in batches of 100 until no more are found
      let hasMoreEntities = true;
      while (hasMoreEntities) {
        url.searchParams.set('limit', limit.toString());
        url.searchParams.set('offset', offset.toString());
        if (type) url.searchParams.set('type', type);

        const entitiesResponse = await lastValueFrom(
          this.httpService.get(url.toString(), { headers, signal }),
        );

        const entities = type
          ? entitiesResponse.data.filter((entity) => entity.type === type)
          : entitiesResponse.data;

        // Extract entity IDs from the current batch and add them to the result array
        const entityIds = entities.map((entity) => entity.id);
        allEntityIds = allEntityIds.concat(entityIds);

        // If fewer than 100 entities were returned, we've reached the last page
        hasMoreEntities = entityIds.length === limit;

        // Increment the offset to fetch the next batch
        if (hasMoreEntities) {
          offset += limit;
        }
      }

      return allEntityIds;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to fetch Fiware Entity IDs',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getEntityAttributesNgsiV2(
    fiwareService: string,
    dataSourceId: string,
    rolesFromRequest: string[],
    entityType: string[],
    signal?: AbortSignal,
  ): Promise<string[]> {
    const { entitiesUrl, headers } = await this.prepareRequestNgsiV2(
      fiwareService,
      dataSourceId,
      rolesFromRequest,
      signal,
    );
    const url = new URL(entitiesUrl);

    try {
      // Adjusting URl to call the NGSI endpoint for 'v1/types'.
      // Check if the URL contains the word 'entities'.
      // If so, process the URL, replacing 'entities' with 'types'.
      const typesUrl = url.toString().includes('entities')
        ? entitiesUrl.replace('entities', 'types')
        : entitiesUrl;

      const entitiesResponse = await axios.get(`${typesUrl}/${entityType}`, {
        headers: headers,
        signal,
      });

      const attributesSet: Set<string> = new Set();
      const filteredEntities = entitiesResponse.data;
      // Add all keys which are not an id or a type to the set
      Object.keys(filteredEntities.attrs).forEach((key) => {
        if (key !== 'id' && key !== 'type') {
          attributesSet.add(key);
        }
      });

      // Return set of attribute strings as an array
      return Array.from(attributesSet);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to fetch Fiware Entity Attributes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getEntityAttributesNgsiLd(
    fiwareService: string,
    dataSourceId: string,
    rolesFromRequest: string[],
    entityType: string[],
    signal?: AbortSignal,
  ): Promise<string[]> {
    const { entitiesUrl, headers } = await this.prepareRequestNgsiLd(
      dataSourceId,
      rolesFromRequest,
      signal,
    );
    const url = new URL(entitiesUrl);

    try {
      // Adjusting URl to call the NGSI endpoint for 'v1/types'.
      // Check if the URL contains the word 'entities'.
      // If so, process the URL, replacing 'entities' with 'types'.
      const typesUrl = url.toString().includes('entities')
        ? entitiesUrl.replace('entities', 'types')
        : entitiesUrl;

      const entitiesResponse = await axios.get(`${typesUrl}/${entityType}`, {
        headers: headers,
        signal,
      });

      const attributesSet: Set<string> = new Set();
      const filteredEntities = entitiesResponse.data.attributeDetails;
      // Add all keys which are not an id or a type to the set
      filteredEntities.forEach((attribute) => {
        if (
          attribute.attributeName !== 'id' &&
          attribute.attributeName !== 'type'
        ) {
          attributesSet.add(attribute.attributeName);
        }
      });

      // Return set of attribute strings as an array
      return Array.from(attributesSet);
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Failed to fetch Fiware Entity Attributes',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
