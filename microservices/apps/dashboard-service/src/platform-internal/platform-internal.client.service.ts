import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

type PlatformAuthDataType =
  | 'ngsi'
  | 'ngsi-ld'
  | 'ngsi-v2'
  | 'api'
  | 'internal'
  | 'usi'
  | 'sql'
  | 'planbar';

const platformBaseUrlVariables: Record<PlatformAuthDataType, string> = {
  ngsi: 'NGSI_SERVICE_BASE_URL',
  'ngsi-ld': 'NGSI_SERVICE_BASE_URL',
  'ngsi-v2': 'NGSI_SERVICE_BASE_URL',
  api: 'ORCHIDEO_CONNECT_SERVICE_BASE_URL',
  internal: 'INTERNAL_DATA_SERVICE_BASE_URL',
  usi: 'USI_PLATFORM_SERVICE_BASE_URL',
  sql: 'SQL_VIEW_SERVICE_BASE_URL',
  planbar: 'PLAN_BAR_SERVICE_BASE_URL',
};

@Injectable()
export class PlatformInternalClientService {
  private readonly logger = new Logger(PlatformInternalClientService.name);

  constructor(private readonly configService: ConfigService) {}

  async enqueueQueryPopulation(
    authDataType: string,
    queryId: string,
    authorization: string | string[] | undefined,
  ): Promise<void> {
    const baseUrlVariable = platformBaseUrlVariables[authDataType];
    if (!baseUrlVariable) {
      throw new Error(
        `Initial population is not supported for data source type: ${authDataType}`,
      );
    }

    const baseUrl = this.configService.get<string>(baseUrlVariable);
    if (!baseUrl) {
      throw new Error(`Missing ${baseUrlVariable} configuration`);
    }

    const authorizationHeader = Array.isArray(authorization)
      ? authorization[0]
      : authorization;
    if (!authorizationHeader) {
      throw new Error('Missing Authorization header for initial population');
    }

    await axios.post(
      `${baseUrl.replace(/\/$/, '')}/internal/query-populations`,
      { queryId },
      { headers: { Authorization: authorizationHeader } },
    );

    this.logger.debug(
      `Queued initial population for query ${queryId} on ${authDataType}`,
    );
  }

  async getQueryData<T>(
    authDataType: string,
    queryId: string,
    authorization: string | string[] | undefined,
    overrides: object = {},
  ): Promise<T> {
    const baseUrlVariable = platformBaseUrlVariables[authDataType];
    if (!baseUrlVariable) {
      throw new Error(
        `Dashboard data is not supported for data source type: ${authDataType}`,
      );
    }
    const baseUrl = this.configService.get<string>(baseUrlVariable);
    if (!baseUrl) {
      throw new Error(`Missing ${baseUrlVariable} configuration`);
    }
    const authorizationHeader = Array.isArray(authorization)
      ? authorization[0]
      : authorization;
    if (!authorizationHeader) {
      throw new Error('Missing Authorization header for dashboard data');
    }
    const response = await axios.post<T>(
      `${baseUrl.replace(/\/$/, '')}/internal/query-data`,
      { queryId, overrides },
      { headers: { Authorization: authorizationHeader } },
    );
    return response.data;
  }
}
