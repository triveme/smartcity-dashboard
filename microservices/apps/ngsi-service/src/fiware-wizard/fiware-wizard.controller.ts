import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
} from '@nestjs/common';
import { FiwareWizardService } from './fiware-wizard.service';
import { Public } from '@app/auth-helper/PublicDecorator';
import { AuthenticatedRequest } from '@app/auth-helper';

@Controller('fiwareWizard')
export class FiwareWizardController {
  constructor(private readonly service: FiwareWizardService) {}

  // Endpoint to get all fiware types
  @Public()
  @Get('/types/:fiwareService/:dataSourceId')
  async getTypes(
    @Param('fiwareService') fiwareService: string,
    @Param('dataSourceId', new ParseUUIDPipe({ version: '4' }))
    dataSourceId: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<string[]> {
    const roles = request.roles ?? [];
    return this.service.getTypes(fiwareService, dataSourceId, roles);
  }

  // Endpoint to get all fiware entity ids with optional fiwareType
  @Public()
  @Get('/entityIds/:fiwareService/:dataSourceId')
  async getEntityIds(
    @Param('fiwareService') fiwareService: string,
    @Param('dataSourceId', new ParseUUIDPipe({ version: '4' }))
    dataSourceId: string,
    @Req() request: AuthenticatedRequest,
    @Query('type') type?: string,
  ): Promise<string[]> {
    const roles = request.roles ?? [];
    return this.service.getEntityIds(fiwareService, dataSourceId, roles, type);
  }

  // Endpoint to get all fiware entity attributes with optional entity id
  @Public()
  @Get('/entityAttributes/:fiwareService/:dataSourceId')
  async getEntityAttributes(
    @Param('fiwareService') fiwareService: string,
    @Param('dataSourceId', new ParseUUIDPipe({ version: '4' }))
    dataSourceId: string,
    @Req() request: AuthenticatedRequest,
    @Query('entityIds') entityIds?: string[],
  ): Promise<string[]> {
    const roles = request.roles ?? [];
    return this.service.getEntityAttributes(
      fiwareService,
      dataSourceId,
      roles,
      entityIds,
    );
  }
}
