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
    return this.service.executeWizardFetch(
      'wizard-types-v2',
      dataSourceId,
      roles,
      { fiwareService },
      (signal) =>
        this.service.getTypesNgsiV2(fiwareService, dataSourceId, roles, signal),
    );
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
    return this.service.executeWizardFetch(
      'wizard-types-ld',
      dataSourceId,
      roles,
      { fiwareService },
      (signal) =>
        this.service.getTypesNgsiLd(fiwareService, dataSourceId, roles, signal),
    );
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
    return this.service.executeWizardFetch(
      'wizard-entity-ids-v2',
      dataSourceId,
      roles,
      { fiwareService, type },
      (signal) =>
        this.service.getEntityIdsNgsiV2(
          fiwareService,
          dataSourceId,
          roles,
          type,
          signal,
        ),
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
    return this.service.executeWizardFetch(
      'wizard-entity-ids-ld',
      dataSourceId,
      roles,
      { fiwareService, type },
      (signal) =>
        this.service.getEntityIdsNgsiLd(
          fiwareService,
          dataSourceId,
          roles,
          type,
          signal,
        ),
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
    return this.service.executeWizardFetch(
      'wizard-entity-attributes-v2',
      dataSourceId,
      roles,
      { fiwareService, entityType },
      (signal) =>
        this.service.getEntityAttributesNgsiV2(
          fiwareService,
          dataSourceId,
          roles,
          entityType,
          signal,
        ),
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
    return this.service.executeWizardFetch(
      'wizard-entity-attributes-ld',
      dataSourceId,
      roles,
      { fiwareService, entityType },
      (signal) =>
        this.service.getEntityAttributesNgsiLd(
          fiwareService,
          dataSourceId,
          roles,
          entityType,
          signal,
        ),
    );
  }
}
