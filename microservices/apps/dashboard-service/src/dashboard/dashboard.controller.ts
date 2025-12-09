import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { DashboardService, DashboardWithContent } from './dashboard.service';
import {
  Dashboard,
  NewDashboard,
} from '@app/postgres-db/schemas/dashboard.schema';
import { AuthenticatedRequest } from '@app/auth-helper';
import { Public } from '@app/auth-helper/PublicDecorator';
import { DashboardDataService } from './dashboard.data.service';
import { PaginatedResult } from '../widget/widget.model';

@Controller('dashboards')
export class DashboardController {
  constructor(
    private readonly service: DashboardService,
    private readonly dashboardDataService: DashboardDataService,
  ) {}

  @Public()
  @Get('/')
  async getAll(
    @Query('includeContent') includeContent: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<Dashboard[] | DashboardWithContent[]> {
    const roles = request.roles ?? [];
    if (includeContent === 'true') {
      return this.service.getDashboardsWithContent(roles);
    }
    return this.service.getAll(roles);
  }

  @Public()
  @Get('/search')
  async getBySearchParam(
    @Query('search') searchParam: string = '',
    @Req() request: AuthenticatedRequest,
    @Query('abbreviation') tenantAbbreviation: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<PaginatedResult<Dashboard>> {
    const roles = request.roles ?? [];
    return this.service.getBySearchParam(
      searchParam,
      roles,
      tenantAbbreviation,
      page,
      limit,
    );
  }

  @Public()
  @Get('/:id')
  async getById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query('includeContent') includeContent: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<Dashboard | DashboardWithContent> {
    const roles = request.roles ?? [];
    const tenant = request.tenant ?? undefined;
    if (includeContent === 'true') {
      if (tenant && tenant !== '') {
        return this.service.getDashboardWithContent(id, roles, tenant);
      } else {
        return this.service.getDashboardWithContentById(id, roles);
      }
    }

    return this.service.getById(id, roles);
  }

  @Public()
  @Get('/url/:url')
  async getByUrl(
    @Param('url') url: string,
    @Req() request: AuthenticatedRequest,
    @Query('abbreviation') abbreviation: string,
  ): Promise<Dashboard | DashboardWithContent> {
    const roles = request.roles ?? [];
    return await this.service.getByUrlAndTenant(url, roles, abbreviation);
  }

  @Public()
  @Get('/first/url')
  async getFirstDashboardUrl(
    @Req() request: AuthenticatedRequest,
  ): Promise<string[]> {
    const roles = request.roles ?? [];
    const tenant = request.tenant ?? undefined;
    return this.service.getFirstDashboardUrl(roles, tenant);
  }

  @Public()
  @Get('/tenant/:abbreviation')
  async getByTenantAbbreviation(
    @Query('includeContent') includeContent: string,
    @Param('abbreviation') abbreviation: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<Dashboard[]> {
    const roles = request.roles ?? [];
    if (includeContent === 'true') {
      return this.service.getDashboardsWithContentByAbbreviation(
        roles,
        abbreviation,
      );
    }

    return this.service.getDashboardsByTenantAbbreviation(abbreviation);
  }

  @Public()
  @Get('/tenant/url/:abbreviation')
  async getDashboardUrlByTenantAbbreviation(
    @Param('abbreviation') abbreviation: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<string[]> {
    const roles = request.roles ?? [];
    const tenant = request.tenant ?? undefined;
    return this.service.getDashboardUrlByTenantAbbreviation(
      abbreviation,
      roles,
      tenant,
    );
  }

  @Public()
  @Get('with-widgets/:id')
  async getDashboardWithWidgets(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<DashboardWithContent> {
    const roles = request.roles ?? [];
    return this.service.getDashboardWithWidgets(id, roles);
  }

  @Public()
  @Post('/')
  async create(
    @Query('tenant') tenant: string,
    @Body() row: NewDashboard,
    @Req() request: AuthenticatedRequest,
  ): Promise<Dashboard> {
    const roles = request.roles ?? [];
    return this.service.create(row, roles, tenant);
  }

  @Public()
  @Post('/duplicate/:id')
  async duplicate(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query('tenant') tenant: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<DashboardWithContent> {
    const roles = request.roles ?? [];
    return this.service.duplicate(id, roles, tenant);
  }

  @Public()
  @Patch('/:id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query('tenant') tenant: string,
    @Body() values: Partial<Dashboard>,
    @Req() request: AuthenticatedRequest,
  ): Promise<Dashboard> {
    const roles = request.roles ?? [];
    return this.service.update(id, values, roles, tenant);
  }

  @Public()
  @Delete('/:id')
  async delete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() request: AuthenticatedRequest,
    @Query('tenant') tenant: string,
  ): Promise<Dashboard> {
    const roles = request.roles ?? [];
    return this.service.delete(id, roles, tenant);
  }

  @Public()
  @Get('/download-data/:dashboardId')
  async downloadData(
    @Param('dashboardId') dashboardId: string,
    @Query('ids') ids: string[],
  ): Promise<string> {
    return this.dashboardDataService.downloadDashboardData(dashboardId, ids);
  }
}
