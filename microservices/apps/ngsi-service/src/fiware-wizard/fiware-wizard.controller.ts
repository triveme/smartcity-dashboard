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

  // Endpoint to get all fiware types for ngsi-v2
  @Public()
  @Get('/types/v2/:fiwareService/:dataSourceId')
  async getTypesNgsiV2(
    @Param('fiwareService') fiwareService: string,
    @Param('dataSourceId', new ParseUUIDPipe({ version: '4' }))
    dataSourceId: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<string[]> {
    const roles = request.roles ?? [];
    return this.service.getTypesNgsiV2(fiwareService, dataSourceId, roles);
  }
  // Endpoint to get all fiware types for ngsi-ld
  @Public()
  @Get('/types/ld/:fiwareService/:dataSourceId')
  async getTypesNgsiLd(
    @Param('fiwareService') fiwareService: string,
    @Param('dataSourceId', new ParseUUIDPipe({ version: '4' }))
    dataSourceId: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<string[]> {
    const roles = request.roles ?? [];
    return this.service.getTypesNgsiLd(fiwareService, dataSourceId, roles);
  }

  // Endpoint to get all fiware entity ids with optional fiwareType
  @Public()
  @Get('/entityIds/v2/:fiwareService/:dataSourceId')
  async getEntityIdsV2(
    @Param('fiwareService') fiwareService: string,
    @Param('dataSourceId', new ParseUUIDPipe({ version: '4' }))
    dataSourceId: string,
    @Req() request: AuthenticatedRequest,
    @Query('type') type?: string,
  ): Promise<string[]> {
    const roles = request.roles ?? [];
    return this.service.getEntityIdsNgsiV2(
      fiwareService,
      dataSourceId,
      roles,
      type,
    );
  }

  // Endpoint to get all fiware entity ids with optional fiwareType
  @Public()
  @Get('/entityIds/ld/:fiwareService/:dataSourceId')
  async getEntityIdsLd(
    @Param('fiwareService') fiwareService: string,
    @Param('dataSourceId', new ParseUUIDPipe({ version: '4' }))
    dataSourceId: string,
    @Req() request: AuthenticatedRequest,
    @Query('type') type?: string,
  ): Promise<string[]> {
    const roles = request.roles ?? [];
    return this.service.getEntityIdsNgsiLd(
      fiwareService,
      dataSourceId,
      roles,
      type,
    );
  }

  // Endpoint to get all fiware entity attributes with optional entity id
  @Public()
  @Get('/entityAttributes/v2/:fiwareService/:dataSourceId')
  async getEntityAttributesNgsiV2(
    @Param('fiwareService') fiwareService: string,
    @Param('dataSourceId', new ParseUUIDPipe({ version: '4' }))
    dataSourceId: string,
    @Req() request: AuthenticatedRequest,
    @Query('entityType') entityType: string[],
  ): Promise<string[]> {
    const roles = request.roles ?? [];
    return this.service.getEntityAttributesNgsiV2(
      fiwareService,
      dataSourceId,
      roles,
      entityType,
    );
  }

  // Endpoint to get all fiware entity attributes with optional entity id
  @Public()
  @Get('/entityAttributes/ld/:fiwareService/:dataSourceId')
  async getEntityAttributesNgsiLd(
    @Param('fiwareService') fiwareService: string,
    @Param('dataSourceId', new ParseUUIDPipe({ version: '4' }))
    dataSourceId: string,
    @Req() request: AuthenticatedRequest,
    @Query('entityType') entityType: string[],
  ): Promise<string[]> {
    const roles = request.roles ?? [];
    return this.service.getEntityAttributesNgsiLd(
      fiwareService,
      dataSourceId,
      roles,
      entityType,
    );
  }
}
