import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import {
  PaginatedResult,
  WidgetWithChildren,
  WidgetWithComponentTypes,
} from './widget.model';
import {
  NewWidget,
  Widget,
} from '@app/postgres-db/schemas/dashboard.widget.schema';
import { AuthenticatedRequest, AuthHelperUtility } from '@app/auth-helper';
import { Public } from '@app/auth-helper/PublicDecorator';
import { ValidateWidgetWithChildrenPipe } from '../validators/widgetWithChildren-validator.pipe';
import { WidgetDataService } from './widget.data.service';
import { WidgetService } from './widget.service';

@Controller('widgets')
export class WidgetController {
  constructor(
    private readonly service: WidgetService,
    private readonly widgetDataService: WidgetDataService,
    private readonly authHelperUtility: AuthHelperUtility,
  ) {}

  @Public()
  @Get('/')
  async getAll(@Req() request: AuthenticatedRequest): Promise<Widget[]> {
    const roles = request.roles ?? [];
    return this.service.getAll(roles);
  }

  // Endpoint for Widget search-bar
  @Public()
  @Get('/search')
  async getBySearchParam(
    @Req() request: AuthenticatedRequest,
    @Query('abbreviation') tenantAbbreviation: string,
    @Query('search') searchParam: string = '',
    @Query('component') componentType: string = '',
    @Query('type') componentSubType: string = '',
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<PaginatedResult<WidgetWithComponentTypes>> {
    const roles = request.roles ?? [];
    return this.service.getBySearchParam(
      searchParam,
      componentType,
      componentSubType,
      roles,
      tenantAbbreviation,
      page,
      limit,
    );
  }

  @Public()
  @Get('/with-children')
  async getWithChildren(
    @Query('tenant') tenantAbbreviation: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<WidgetWithChildren[]> {
    const roles = request.roles ?? [];
    return this.service.getWithChildren(roles, tenantAbbreviation);
  }

  @Public()
  @Get('/:id')
  async getById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<Widget> {
    const roles = request.roles ?? [];
    return this.service.getById(id, roles);
  }

  @Public()
  @Get('panel/:id')
  async getWidgetsByPanelId(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Widget[]> {
    return this.service.getWidgetsByPanelId(id);
  }

  @Public()
  @Get('/tab/:componentType')
  async getByTenantAndTabComponentType(
    @Query('abbreviation') abbreviation: string,
    @Param('componentType') componentType: string,
  ): Promise<WidgetWithChildren[]> {
    return this.service.getByTenantAndTabComponentType(
      componentType,
      abbreviation,
    );
  }

  @Public()
  @Get('/tenant/:abbreviation')
  async getByTenantAbbreviation(
    @Param('abbreviation') abbreviation: string,
  ): Promise<Widget[]> {
    return this.service.getWidgetsByTenantAbbreviation(abbreviation);
  }

  @Public()
  @Post('/')
  async create(
    @Query('tenant') tenant: string,
    @Body() row: NewWidget,
    @Req() request: AuthenticatedRequest,
  ): Promise<Widget> {
    const roles = request.roles ?? [];
    if (
      this.authHelperUtility.isAdmin(roles) ||
      this.authHelperUtility.isEditor(roles)
    ) {
      return this.service.create(row, roles, undefined, tenant);
    } else {
      throw new HttpException(
        'Unauthorized to create widget',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @Public()
  @Post('duplicate/:id')
  async duplicate(
    @Param('id') id: string,
    @Query('tenant') tenant: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<WidgetWithChildren> {
    const roles = request.roles ?? [];
    if (
      this.authHelperUtility.isAdmin(roles) ||
      this.authHelperUtility.isEditor(roles)
    ) {
      return this.service.duplicate(roles, id, tenant, undefined);
    } else {
      throw new HttpException(
        'Unauthorized to duplicate widget',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @Public()
  @Patch('/:id')
  async update(
    @Query('tenant') tenant: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() values: Partial<Widget>,
    @Req() request: AuthenticatedRequest,
  ): Promise<Widget> {
    const roles = request.roles ?? [];
    return this.service.update(id, values, roles, tenant);
  }

  @Public()
  @Delete('/:id')
  async delete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<Widget> {
    const roles = request.roles ?? [];
    return this.service.delete(id, roles);
  }

  @Public()
  @Get('/with-children/:id')
  async getWithChildrenById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<WidgetWithChildren> {
    const roles = request.roles ?? [];
    return this.service.getWithChildrenById(id, roles);
  }

  @Public()
  @Post('/with-children')
  async createWithChildren(
    @Query('tenant') tenant: string,
    @Body(ValidateWidgetWithChildrenPipe) payload: WidgetWithChildren,
    @Req() request: AuthenticatedRequest,
  ): Promise<WidgetWithChildren> {
    const roles = request.roles ?? [];

    if (
      this.authHelperUtility.isAdmin(roles) ||
      this.authHelperUtility.isEditor(roles)
    ) {
      return this.service.createWithChildren(payload, roles, tenant);
    } else {
      throw new HttpException(
        'Unauthorized to create widget',
        HttpStatus.FORBIDDEN,
      );
    }
  }

  @Public()
  @Patch('/with-children/:id')
  async updateWithChildren(
    @Query('tenant') tenant: string,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(ValidateWidgetWithChildrenPipe) values: Partial<WidgetWithChildren>,
    @Req() request: AuthenticatedRequest,
  ): Promise<WidgetWithChildren> {
    const roles = request.roles ?? [];
    return this.service.updateWithChildren(id, values, roles, tenant);
  }

  @Public()
  @Get('/download-data/:widgetId')
  async downloadData(@Param('widgetId') widgetId: string): Promise<string> {
    return this.widgetDataService.downloadWidgetData(widgetId);
  }
}
