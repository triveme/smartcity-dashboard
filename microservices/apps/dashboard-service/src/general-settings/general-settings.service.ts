import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  GeneralSettings,
  NewGeneralSettings,
} from '@app/postgres-db/schemas/general-settings.schema';
import { GeneralSettingsRepo } from './general-settings.repo';
import { AuthHelperUtility } from '@app/auth-helper';
import { TenantRepo } from '../tenant/tenant.repo';

@Injectable()
export class GeneralSettingsService {
  constructor(
    private readonly generalSettingsRepo: GeneralSettingsRepo,
    private readonly authHelperUtility: AuthHelperUtility,
    private readonly tenantRepo: TenantRepo,
  ) {}

  async getAll(roles: string[]): Promise<GeneralSettings[]> {
    if (!this.authHelperUtility.isAdmin(roles))
      throw new UnauthorizedException();

    return this.generalSettingsRepo.getAll();
  }

  async getById(id: string, roles: string[]): Promise<GeneralSettings> {
    if (!this.authHelperUtility.isAdmin(roles))
      throw new UnauthorizedException();

    return this.generalSettingsRepo.getById(id);
  }

  async getByTenantAbbreviation(
    abbreviation: string,
  ): Promise<GeneralSettings> {
    const tenant = await this.tenantRepo.getTenantByAbbreviation(abbreviation);
    if (!tenant) {
      throw new HttpException('Tenant Not Found', HttpStatus.NOT_FOUND);
    }

    const generalSettingsForTenant =
      await this.generalSettingsRepo.getByTenantAbbreviation(abbreviation);

    return generalSettingsForTenant
      ? generalSettingsForTenant
      : {
          id: null,
          tenant: abbreviation,
          information: null,
          imprint: null,
          privacy: null,
        };
  }

  async create(
    row: NewGeneralSettings,
    roles: string[],
  ): Promise<GeneralSettings> {
    if (!this.authHelperUtility.isAdmin(roles))
      throw new UnauthorizedException();

    const tenant = await this.tenantRepo.getTenantByAbbreviation(row.tenant);
    if (!tenant) {
      throw new HttpException('Tenant Not Found', HttpStatus.NOT_FOUND);
    }

    return this.generalSettingsRepo.create(row);
  }

  async update(
    id: string,
    values: Partial<NewGeneralSettings>,
    roles: string[],
  ): Promise<GeneralSettings> {
    if (
      !this.authHelperUtility.isAdmin(roles) &&
      !this.authHelperUtility.isEditor(roles)
    ) {
      throw new HttpException('Cannot create dashboard', HttpStatus.FORBIDDEN);
    }

    return this.generalSettingsRepo.update(id, values);
  }

  async delete(id: string, roles: string[]): Promise<GeneralSettings> {
    if (!this.authHelperUtility.isAdmin(roles))
      throw new UnauthorizedException();

    return this.generalSettingsRepo.delete(id);
  }
}
