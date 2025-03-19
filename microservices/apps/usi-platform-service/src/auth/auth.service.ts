import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import { catchError } from 'rxjs/operators';

export interface KeycloakResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

interface SendableData {
  client_id: string;
  client_secret: string;
  grant_type: string;
  refresh_token?: string;
}

@Injectable()
export class AuthService {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(private readonly httpService: HttpService) {}

  private async fetchToken(): Promise<KeycloakResponse> {
    const dataToSend: SendableData = {
      client_id: process.env.USI_CLIENT_ID as string,
      client_secret: process.env.USI_CLIENT_SECRET as string,
      grant_type: 'client_credentials',
    };

    const params = new URLSearchParams();
    Object.entries(dataToSend).forEach(([key, value]) =>
      params.append(key, value),
    );

    try {
      const { data }: AxiosResponse<KeycloakResponse> = await lastValueFrom(
        this.httpService
          .post(process.env.USI_AUTH_URL, params.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          })
          .pipe(
            catchError((error: AxiosError) => {
              console.error(
                'Authentication error:',
                error.response?.data || error.message,
              );
              throw error;
            }),
          ),
      );

      this.token = data.access_token;
      this.refreshToken = data.refresh_token || null;
      this.tokenExpiry = Date.now() + data.expires_in * 1000 - 5000; // Expire a bit earlier to avoid last-second issues
      return data;
    } catch (error) {
      console.error('Failed to get authentication token:', error);
      throw error;
    }
  }

  // Check if the token needs to be updated
  private doesTokenNeedToUpdate(): boolean {
    return !this.token || !this.tokenExpiry || Date.now() >= this.tokenExpiry;
  }

  // Refresh token if needed
  private async refreshTokenIfNeeded(): Promise<KeycloakResponse> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    const dataToSend: SendableData = {
      client_id: process.env.USI_CLIENT_ID as string,
      client_secret: process.env.USI_CLIENT_SECRET as string,
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
    };

    const params = new URLSearchParams();
    Object.entries(dataToSend).forEach(([key, value]) =>
      params.append(key, value),
    );

    try {
      const { data }: AxiosResponse<KeycloakResponse> = await lastValueFrom(
        this.httpService
          .post(process.env.USI_AUTH_URL, params.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          })
          .pipe(
            catchError((error: AxiosError) => {
              console.error(
                'Token refresh error:',
                error.response?.data || error.message,
              );
              throw error;
            }),
          ),
      );

      this.token = data.access_token;
      this.refreshToken = data.refresh_token || this.refreshToken;
      this.tokenExpiry = Date.now() + data.expires_in * 1000 - 5000;
      return data;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      throw error;
    }
  }

  // Get token, refresh it if necessary
  async getToken(): Promise<string> {
    if (this.doesTokenNeedToUpdate()) {
      // Token needs to be refreshed or fetched again
      if (this.refreshToken) {
        // Try to refresh using the refresh token
        await this.refreshTokenIfNeeded();
      } else {
        // If no refresh token, fetch a new token
        await this.fetchToken();
      }
    }
    return this.token!;
  }
}
