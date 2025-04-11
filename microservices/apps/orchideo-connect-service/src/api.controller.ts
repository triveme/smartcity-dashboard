import {
  Controller,
  createParamDecorator,
  ExecutionContext,
  Get,
  Query,
} from '@nestjs/common';
import { OrchideoConnectService } from './api.service';

const Bearer = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const authorizationToken: string = request.headers['authorization'];

  if (authorizationToken) {
    return authorizationToken.replace('Bearer ', '');
  }

  return null;
});

@Controller('wizard')
export class OrchideoConnectController {
  constructor(private readonly apiService: OrchideoConnectService) {}

  @Get('/collections')
  async getCollections(
    @Bearer() authorizationToken: string,
    @Query('apiid') apiId: string,
  ): Promise<string[]> {
    return this.apiService.getCollections(authorizationToken, apiId);
  }

  @Get('/sources')
  async getSources(
    @Query('collection') collection: string,
    @Bearer() authorizationToken: string,
    @Query('apiid') apiId: string,
  ): Promise<string[]> {
    return this.apiService.getSources(collection, authorizationToken, apiId);
  }

  @Get('/entities')
  async getEntities(
    @Query('collection') collection: string,
    @Query('source') source: string,
    @Bearer() authorizationToken: string,
    @Query('apiid') apiId: string,
  ): Promise<string[]> {
    return this.apiService.getEntities(
      collection,
      source,
      authorizationToken,
      apiId,
    );
  }

  @Get('/attributes')
  async getAttributes(
    @Query('collection') collection: string,
    @Query('source') source: string,
    @Bearer() authorizationToken: string,
    @Query('apiid') apiId: string,
  ): Promise<string[]> {
    return this.apiService.getAttributes(
      collection,
      source,
      authorizationToken,
      apiId,
    );
  }
}
