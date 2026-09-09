import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticatedRequest } from '@app/auth-helper';
import { QueryConfig } from '@app/postgres-db/schemas/query-config.schema';
import { NgsiService } from './ngsi.service';

@Controller('internal')
export class InternalQueryPopulationController {
  constructor(private readonly ngsiService: NgsiService) {}

  @Post('query-populations')
  @HttpCode(HttpStatus.ACCEPTED)
  async populateQuery(
    @Body('queryId', new ParseUUIDPipe({ version: '4' })) queryId: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    if (!request.authenticated) {
      throw new UnauthorizedException();
    }
    await this.ngsiService.enqueueQueryPopulation(
      queryId,
      request.roles ?? [],
      request.tenant,
    );
  }

  @Post('query-data')
  async getQueryData(
    @Body('queryId', new ParseUUIDPipe({ version: '4' })) queryId: string,
    @Body('overrides') overrides: Partial<QueryConfig> = {},
    @Req() request: AuthenticatedRequest,
  ): Promise<object | object[]> {
    if (!request.authenticated) {
      throw new UnauthorizedException();
    }
    return this.ngsiService.getQueuedQueryData(
      queryId,
      overrides,
      request.roles ?? [],
      request.tenant,
    );
  }
}
