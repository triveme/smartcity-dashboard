import { SystemUser } from '@app/postgres-db/schemas/tenant.system-user.schema';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
} from '@nestjs/common';
import { SystemUserService } from './system-user.service';

class CreateSystemUserDto {
  tenantAbbreviation: string;
  username: string;
}

@Controller('systemUsers')
export class SystemUserController {
  constructor(private readonly service: SystemUserService) {}

  @Get('/')
  async getAll(): Promise<SystemUser[]> {
    return this.service.getAll();
  }

  @Get('/:id')
  async getById(@Param('id') id: string): Promise<SystemUser> {
    return this.service.getById(id);
  }

  @Get('tenant/:tenantAbbreviation')
  async getByTenant(
    @Param('tenantAbbreviation') tenantAbbreviation: string,
  ): Promise<SystemUser> {
    return this.service.getByTenantAbbreviation(tenantAbbreviation);
  }

  @Post('/')
  async create(
    @Body() createSystemUserDto: CreateSystemUserDto,
    @Headers('password') passwordFromHeader: string,
  ): Promise<SystemUser> {
    const { tenantAbbreviation, username } = createSystemUserDto;
    return this.service.create(
      tenantAbbreviation,
      username,
      passwordFromHeader,
    );
  }

  @Delete('/:username')
  async delete(@Param('username') username: string): Promise<SystemUser[]> {
    return this.service.delete(username);
  }

  @Delete('/')
  async deleteAll(): Promise<SystemUser[]> {
    return this.service.deleteAll();
  }
}
