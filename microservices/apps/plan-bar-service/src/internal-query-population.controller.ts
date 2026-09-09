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
import { QueryService } from './query/query.service';

@Controller('internal')
export class InternalQueryPopulationController {
  constructor(private readonly queryService: QueryService) {}

  @Post('query-populations')
  @HttpCode(HttpStatus.ACCEPTED)
  async populateQuery(
    @Body('queryId', new ParseUUIDPipe({ version: '4' })) queryId: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    if (!request.authenticated) {
      throw new UnauthorizedException();
    }
    await this.queryService.enqueueQueryPopulation(
      queryId,
      request.roles ?? [],
      request.tenant,
    );
  }

  @Post('query-data')
  async getQueryData(
    @Body('queryId', new ParseUUIDPipe({ version: '4' })) queryId: string,
    @Body('overrides') overrides: object = {},
    @Req() request: AuthenticatedRequest,
  ): Promise<object[]> {
    if (!request.authenticated) throw new UnauthorizedException();
    return this.queryService.getQueuedQueryData(
      queryId,
      overrides,
      request.roles ?? [],
      request.tenant,
    );
  }
}
