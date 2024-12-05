import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError } from 'rxjs/operators';
import { AxiosError } from 'axios';
import { lastValueFrom } from 'rxjs';
import { error } from 'console';

// Define an interface for the response shape
export interface KeycloakResponse {
  access_token: string;
  expires_in: number;
}

interface sendableData {
  client_id?: string;
  username?: string;
  password?: string;
  grant_type?: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly httpService: HttpService) {}
  private readonly logger = new Logger(AuthService.name);

  async getTokenData(toSend?: sendableData): Promise<KeycloakResponse> {
    let dataToSend: sendableData;
    if (toSend) {
      dataToSend = {
        ...toSend,
        client_id: process.env.API_CLIENT_ID,
        grant_type: 'password',
      };
    } else {
      this.logger.error('Using old authentication method');
      throw error('Using old authentication method');
    }
    const { data } = await lastValueFrom(
      this.httpService
        .post(process.env.API_KEYCLOAK_URL, dataToSend, {
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
    return data as KeycloakResponse;
  }
}