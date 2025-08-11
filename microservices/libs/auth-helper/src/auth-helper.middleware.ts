import { Injectable, NestMiddleware } from '@nestjs/common';
import { config } from 'dotenv';
import { Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Jwt, JwtPayload, decode, verify } from 'jsonwebtoken';
import * as jwks from 'jwks-rsa';
import * as https from 'https';
import * as path from 'path';

const rootDir = path.resolve(__dirname, '../../../');
const envPath = path.join(rootDir, '.env');
config({ path: envPath }); // Load environment variables from .env file in root directory

export type AuthenticatedRequest = Request & { roles?: string[] } & {
  tenant?: string;
};

@Injectable()
export class AuthHelperMiddleware implements NestMiddleware {
  readonly jwksUri = process.env.NEST_JWKS_URI as string;
  readonly ca = process.env.TRUSTED_CA;
  readonly logger = new Logger('Auth Guard');
  constructor() {
    if (!this.jwksUri) {
      throw new Error('Missing JWKS URI environment variable');
    }
  }

  // Determine the protocol of the JWKS URI
  private getProtocol(uri: string): string {
    return new URL(uri).protocol;
  }

  readonly jwksClient = jwks({
    jwksUri: this.jwksUri,
    requestHeaders: {}, // Optional
    requestAgent:
      this.getProtocol(this.jwksUri) === 'https:'
        ? new https.Agent({ ca: this.ca }) // add trusted ca when the protocol is https
        : undefined,
  });

  /**
   * @param request The HTTP request object.
   * @returns The JWT token, or `undefined` if the token is not present or is invalid.
   */
  private extractJwtFromHeader(request: Request): string | undefined {
    if (request.headers.authorization?.startsWith('ey')) {
      return request.headers.authorization;
    }
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  /**
   * Retrieves the public key for a given key ID from the JWKS endpoint.
   *
   * @param kid The key ID to retrieve the public key for.
   * @returns A Promise that resolves to the public key, or rejects with an error if the key cannot be retrieved.
   */
  private async getSigningKey(kid: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.jwksClient.getSigningKey(kid, (err, key) => {
        if (err) {
          reject(err);
        } else {
          const signingKey = key?.getPublicKey();
          resolve(signingKey);
        }
      });
    });
  }

  /**
   * Sets the `roles` property of the `req` object based on the JWT in the request header.
   * If the token is not present or is invalid, the `roles` property is set to undefined.
   *
   * @param req The HTTP request object.
   * @param res The HTTP response object.
   * @param next The next middleware function in the request-response cycle.
   */
  async use(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const token = this.extractJwtFromHeader(req);
      if (!token) {
        this.logger.log('Unauthenticated request');
        req.roles = undefined;
        next();
        return;
      }

      const decodedToken = decode(token as string, { complete: true });
      const { payload, header } = decodedToken as Jwt & { payload: JwtPayload };
      const kid = header.kid;
      const signingKey = await this.getSigningKey(kid as string);

      try {
        verify(token as string, signingKey as string);
      } catch (error) {
        // We use a normal log here because failing verifications are expected.
        this.logger.log(error);
        req.roles = undefined;
        next();
        return;
      }

      const roles = payload.realm_access?.roles;
      const tenant = payload.mandator_code;
      req.roles = roles || undefined;
      req.tenant = tenant || undefined;
      this.logger.log(
        `Authenticated request with roles: ${roles.join(
          ', ',
        )} for tenant:  ${tenant}`,
      );
      next();
    } catch (err) {
      this.logger.error(err);
      req.roles = undefined;
      next();
      return;
    }
  }
}
