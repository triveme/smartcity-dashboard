import { Inject, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { eq } from 'drizzle-orm';

import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { dataSources } from '@app/postgres-db/schemas/data-source.schema';
import { authData } from '@app/postgres-db/schemas/auth-data.schema';
import { AuthService } from '../auth/auth.service';

export type UsiEventType = {
  name: string;
  sensors: string[];
  attributes: string[];
};
@Injectable()
export class QueryConfigService {
  private readonly logger = new Logger(QueryConfigService.name);
  private readonly apiBaseUrl: string;

  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly authService: AuthService,
  ) {
    this.apiBaseUrl = `${process.env.USI_API_URL}`;
  }

  async getEventTypes(apiId?: string): Promise<UsiEventType[]> {
    try {
      const apiUrl = (await this.getUrl(apiId)) || this.apiBaseUrl;
      const url = `${apiUrl}/api/eventtypes`;
      const token = await this.authService.getToken();
      console.log('URL: ', url);
      console.log('Token: ', token);
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const transformedData = response.data.eventtypes.map((eventType) => ({
        name: eventType.name,
        sensors: eventType.sensors,
        attributes: Object.keys(eventType.description),
      }));

      return transformedData;
    } catch (error) {
      this.logger.error('Failed to fetch event types:', error);
      throw new Error('Failed to fetch event types');
    }
  }

  async getSensors(eventType: string, apiId?: string): Promise<string[]> {
    try {
      const apiUrl = (await this.getUrl(apiId)) || this.apiBaseUrl;
      const url = `${apiUrl}/api/${eventType}/sensors`;
      const token = await this.authService.getToken();
      console.log('URL: ', url);
      console.log('Token: ', token);
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      this.logger.error(
        `Failed to fetch sensors for event type ${eventType}:`,
        error,
      );
      throw new Error(`Failed to fetch sensors for event type ${eventType}`);
    }
  }

  // Function to get the USI URL from database config - if kept in the apiUrl field
  private async getUrl(apiId?: string): Promise<string | null> {
    if (!apiId) return null;

    const result = await this.db
      .select()
      .from(dataSources)
      .leftJoin(authData, eq(dataSources.authDataId, authData.id))
      .where(eq(dataSources.id, apiId));

    if (result.length > 0) {
      console.log('Returning URL: ', result[0].auth_data.liveUrl);
      return result[0].auth_data.liveUrl;
    } else {
      this.logger.error(`No datasource found with id: ${apiId}`);
      throw new Error('No datasource found with this id');
    }
  }
}
