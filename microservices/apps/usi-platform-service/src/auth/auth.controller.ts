import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

// Controller for testing purposes - get USI keycloak token
@Controller('usi-auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('token')
  async getToken(): Promise<{ access_token: string }> {
    const access_token = await this.authService.getToken();
    return { access_token };
  }
}
