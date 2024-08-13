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
  @Get('/:id')
  async getById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query('includeContent') includeContent: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<Dashboard | DashboardWithContent> {
    const roles = request.roles ?? [];
    if (includeContent === 'true') {
      return this.service.getDashboardWithContent(id, roles);
    }

    return this.service.getById(id, roles);
  }

  @Public()
  @Get('/url/:url')
  async getByUrl(
    @Param('url') url: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<Dashboard | DashboardWithContent> {
    const roles = request.roles ?? [];
    const dashboard = await this.service.getByUrl(url, roles);
    return this.service.getDashboardWithContent(dashboard.id, roles);
  }

  @Public()
  @Get('/first/url')
  async getFirstDashboardUrl(
    @Req() request: AuthenticatedRequest,
  ): Promise<string[]> {
    const roles = request.roles ?? [];
    return this.service.getFirstDashboardUrl(roles);
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
    return this.service.getDashboardUrlByTenantAbbreviation(
      abbreviation,
      roles,
    );
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
  ): Promise<Dashboard> {
    const roles = request.roles ?? [];
    return this.service.delete(id, roles);
  }

  @Public()
  @Get('/download-data/:dashboardId')
  async downloadData(
    @Param('dashboardId') dashboardId: string,
  ): Promise<string> {
    return this.dashboardDataService.downloadDashboardData(dashboardId);
  }
}
