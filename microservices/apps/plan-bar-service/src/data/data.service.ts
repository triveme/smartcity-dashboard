// eslint-disable-next-line prettier/prettier
import { Inject, Injectable, Logger } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  DataSource,
  dataSources,
} from '@app/postgres-db/schemas/data-source.schema';
import { QueryConfig } from '@app/postgres-db/schemas/query-config.schema';
import { authData, AuthData } from '@app/postgres-db/schemas/auth-data.schema';
import axios from 'axios';
import { AuthService } from '../auth/auth.service';
import {
  DataPlatformQueue,
  DataPlatformQueueEnqueueOptions,
  DataPlatformQueueFingerprintInput,
  createCredentialFingerprint,
} from '@app/data-platform-queue';

export type QueryBatch = {
  queryIds: string[];
  query_config: QueryConfig;
  data_source: DataSource;
  auth_data: AuthData;
};

export interface NGSIv2Attribute {
  type: 'Text' | 'Number';
  value: string | number;
  metadata: Record<string, unknown>;
}

export interface NGSIv2EntityFirstEntry {
  id: string;
  type: 'planbar';
  name: NGSIv2Attribute;
  usage: NGSIv2Attribute;
  location: NGSIv2Attribute;
  date: NGSIv2Attribute;
}

interface Shift {
  id: string;
  shiftDate: string;
  startTime: string;
  endTime: string;
  driverId: string | null;
  coDriverId: string | null;
  vehicle: string | null;
}

interface Person {
  id: string;
  firstName: string;
  lastName: string;
  driver: boolean;
}

interface Location {
  id: string;
  name: string;
  streetAndNumber: string;
  city: string;
}

interface Ride {
  id: string;
  shiftId: string;
  destinationId: string | null;
}

@Injectable()
export class PlanBarService {
  private readonly logger = new Logger(PlanBarService.name);

  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly authService: AuthService,
    private readonly queue: DataPlatformQueue,
  ) {}

  async executeQueuedFetch<T>(
    options: Omit<DataPlatformQueueEnqueueOptions<T>, 'fingerprint'> & {
      fingerprintInput: DataPlatformQueueFingerprintInput;
    },
  ): Promise<T> {
    const { fingerprintInput, ...queueOptions } = options;

    return this.queue.enqueue({
      ...queueOptions,
      fingerprint: this.queue.createFingerprint(fingerprintInput),
    });
  }

  async getCollections(apiid: string): Promise<string[]> {
    return this.executeQueuedFetch({
      category: 'wizard',
      priority: 'interactive',
      fingerprintInput: {
        platform: 'plan-bar',
        operation: 'wizard-collections',
        target: { apiId: apiid },
        queryConfig: {},
        runtimeParameters: {},
      },
      execute: async (signal) => {
        signal.throwIfAborted();
        return this.fetchCollections(apiid);
      },
    });
  }

  private async fetchCollections(apiid: string): Promise<string[]> {
    try {
      const datas = await this.db
        .select()
        .from(dataSources)
        .where(eq(dataSources.id, apiid));

      return datas.flatMap((d) => d.collections);
    } catch (error) {
      this.logger.error('Failed to fetch data: ', error);
      throw new Error('Failed to fetch data');
    }
  }

  async getSources(): Promise<string[]> {
    return this.executeQueuedFetch({
      category: 'wizard',
      priority: 'interactive',
      fingerprintInput: {
        platform: 'plan-bar',
        operation: 'wizard-sources',
        target: {},
        queryConfig: {},
        runtimeParameters: {},
      },
      execute: async (signal) => {
        signal.throwIfAborted();
        return ['all'];
      },
    });
  }

  async getEntities(apiId?: string): Promise<string[]> {
    const authData = await this.getAuthDataForDataSource(apiId);
    return this.executeQueuedFetch({
      category: 'wizard',
      priority: 'interactive',
      fingerprintInput: this.wizardFingerprint(
        'wizard-entities',
        apiId,
        authData,
        {},
      ),
      execute: (signal) => this.fetchEntities(authData, signal),
    });
  }

  private async fetchEntities(
    authData: AuthData,
    signal: AbortSignal,
  ): Promise<string[]> {
    try {
      const accessToken = await this.authService.getToken(authData, signal);
      signal.throwIfAborted();
      const response = await axios.get<Person[]>(
        `${authData.liveUrl}/persons`,
        { headers: { Authorization: `Bearer ${accessToken}` }, signal },
      );
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return response.data
        .filter((p) => p.driver && uuidRegex.test(p.id))
        .map((p) => `${p.id}::${p.lastName} ${p.firstName}`.trim());
    } catch (error) {
      this.logger.error('Failed to fetch entities:', error);
      throw new Error('Failed to fetch entities');
    }
  }

  async getAttributes(collection: string, apiId?: string): Promise<string[]> {
    const authData = await this.getAuthDataForDataSource(apiId);
    return this.executeQueuedFetch({
      category: 'wizard',
      priority: 'interactive',
      fingerprintInput: this.wizardFingerprint(
        'wizard-attributes',
        apiId,
        authData,
        { collection },
      ),
      execute: (signal) => this.fetchAttributes(collection, authData, signal),
    });
  }

  private async fetchAttributes(
    collection: string,
    authData: AuthData,
    signal: AbortSignal,
  ): Promise<string[]> {
    try {
      const accessToken = await this.authService.getToken(authData, signal);
      signal.throwIfAborted();
      const url = `${authData.liveUrl}/${collection}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        signal,
      });
      return Object.keys(response.data[0]);
    } catch (error) {
      this.logger.error('Failed to fetch event types:', error);
      throw new Error('Failed to fetch event types');
    }
  }

  private async getAuthDataById(authDataId: string): Promise<AuthData> {
    const result = await this.db
      .select()
      .from(authData)
      .where(eq(authData.id, authDataId));

    return result.length > 0 ? result[0] : null;
  }

  private async getAuthDataForDataSource(apiId?: string): Promise<AuthData> {
    const authId = await this.getAuthIdFromDataSource(apiId);
    return this.getAuthDataById(authId);
  }

  private wizardFingerprint(
    operation: string,
    apiId: string | undefined,
    authData: AuthData,
    runtimeParameters: object,
  ): DataPlatformQueueFingerprintInput {
    return {
      platform: 'plan-bar',
      operation,
      target: {
        apiId,
        authDataId: authData.id,
        liveUrl: authData.liveUrl,
        credentialFingerprint: createCredentialFingerprint(
          JSON.stringify({
            authDataId: authData.id,
            clientId: authData.clientId,
            clientSecret: authData.clientSecret,
          }),
        ),
      },
      queryConfig: {},
      runtimeParameters,
    };
  }

  private async getAuthIdFromDataSource(apiId: string): Promise<string> {
    const authId = await this.db
      .select()
      .from(dataSources)
      .leftJoin(authData, eq(dataSources.authDataId, authData.id))
      .where(eq(dataSources.id, apiId));

    return authId.length > 0 ? authId[0].auth_data.id : null;
  }

  async getDataFromDataSource(
    queryBatch: QueryBatch,
    signal?: AbortSignal,
  ): Promise<NGSIv2EntityFirstEntry[]> {
    try {
      const accessToken = await this.authService.getToken(
        queryBatch.auth_data,
        signal,
      );
      signal?.throwIfAborted();
      const baseUrl = queryBatch.auth_data.liveUrl;
      const headers = { Authorization: `Bearer ${accessToken}` };

      const shiftsRes = await axios.get<Shift[]>(`${baseUrl}/shifts`, {
        headers,
        signal,
      });
      signal?.throwIfAborted();
      const personsRes = await axios.get<Person[]>(`${baseUrl}/persons`, {
        headers,
        signal,
      });
      signal?.throwIfAborted();
      const locationsRes = await axios.get<Location[]>(`${baseUrl}/locations`, {
        headers,
        signal,
      });
      signal?.throwIfAborted();
      const ridesRes = await axios.get<Ride[]>(`${baseUrl}/rides`, {
        headers,
        signal,
      });

      const result = this.buildShiftEntries(
        shiftsRes.data,
        personsRes.data,
        locationsRes.data,
        ridesRes.data,
        queryBatch.query_config.entityIds ?? [],
      );
      console.info('result', result);
      return result;
    } catch (error) {
      this.logger.error('Failed to fetch data:', error);
      throw new Error('Failed to fetch data');
    }
  }

  private buildShiftEntries(
    shifts: Shift[],
    persons: Person[],
    locations: Location[],
    rides: Ride[],
    selectedDriverIds: string[],
  ): NGSIv2EntityFirstEntry[] {
    const personMap = new Map<string, string>(
      persons.map((p) => [p.id, `${p.lastName} ${p.firstName}`.trim()]),
    );

    const locationMap = new Map<string, string>(
      locations.map((l) => [l.id, `${l.streetAndNumber}, ${l.city}`.trim()]),
    );

    const shiftLocationMap = new Map<string, string>();
    for (const ride of rides) {
      if (!shiftLocationMap.has(ride.shiftId) && ride.destinationId) {
        shiftLocationMap.set(
          ride.shiftId,
          locationMap.get(ride.destinationId) ?? '',
        );
      }
    }

    const text = (value: string): NGSIv2Attribute => ({
      type: 'Text',
      value,
      metadata: {},
    });

    const filteredShifts =
      selectedDriverIds.length > 0
        ? shifts.filter((s) => selectedDriverIds.includes(s.driverId ?? ''))
        : shifts;

    return filteredShifts.map((shift) => ({
      id: shift.driverId ?? shift.id,
      type: 'planbar',
      name: text(personMap.get(shift.driverId ?? '') ?? ''),
      usage: text(personMap.get(shift.coDriverId ?? '') ?? ''),
      location: text(shiftLocationMap.get(shift.id) ?? ''),
      date: text(shift.shiftDate),
    }));
  }
}
