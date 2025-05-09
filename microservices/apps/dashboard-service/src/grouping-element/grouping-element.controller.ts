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
import { GroupingElementService } from './grouping-element.service';
import {
  GroupingElement,
  NewGroupingElement,
} from '@app/postgres-db/schemas/dashboard.grouping-element.schema';
import { Public } from '@app/auth-helper/PublicDecorator';
import { GroupingElementWithChildren } from './grouping-element.repo';
import { AuthenticatedRequest } from '@app/auth-helper';

@Controller('groupingElements')
export class GroupingElementController {
  constructor(private readonly service: GroupingElementService) {}

  @Public()
  @Get('/')
  async getAll(
    @Req() request: AuthenticatedRequest,
  ): Promise<GroupingElementWithChildren[]> {
    const roles = request.roles ?? [];
    const tenant = request.tenant ?? undefined;
    return this.service.getAll(roles, tenant);
  }

  @Public()
  @Get('/:id')
  async getById(
    @Req() request: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<GroupingElement> {
    const roles = request.roles ?? [];
    const tenant = request.tenant ?? undefined;
    return this.service.getById(id, roles, tenant);
  }

  @Public()
  @Get('/tenant/:abbreviation')
  async getByTenantAbbreviation(
    @Param('abbreviation') abbreviation: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<GroupingElementWithChildren[]> {
    const roles = request.roles ?? [];
    const tenant = request.tenant ?? undefined;
    return this.service.getByTenantAbbreviation(abbreviation, roles, tenant);
  }

  @Public()
  @Get('/url/:url')
  async getByUrl(
    @Param('url') url: string,
    @Query('abbreviation') abbreviation: string,
  ): Promise<GroupingElement> {
    return this.service.getByUrlAndTenant(url, abbreviation);
  }

  @Public()
  @Post('/')
  async create(@Body() row: NewGroupingElement): Promise<GroupingElement> {
    return this.service.create(row);
  }

  @Public()
  @Patch('/:id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() values: Partial<GroupingElement>,
    @Req() request: AuthenticatedRequest,
  ): Promise<GroupingElement> {
    const roles = request.roles ?? [];
    return this.service.update(id, values, roles);
  }

  @Public()
  @Delete('/:id')
  async delete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<GroupingElement> {
    return this.service.delete(id);
  }
}
