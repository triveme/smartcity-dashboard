import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { eq } from 'drizzle-orm';
import {
  NewSystemUser,
  SystemUser,
  systemUsers,
} from '@app/postgres-db/schemas/tenant.system-user.schema';
import { OrganisationService } from '../organisation/organisation.service';
import { TenantService } from '../../../dashboard-service/src/tenant/tenant.service';
import { EncryptionUtil } from '../../../dashboard-service/src/util/encryption.util';
import {
  corporateInfos,
  NewCorporateInfo,
} from '@app/postgres-db/schemas/corporate-info.schema';
import { edagTemplate as DefaultCorporateInfo } from '../../../dashboard-service/src/corporate-info/corporate-info.template';

@Injectable()
export class SystemUserService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly organisationService: OrganisationService,
    private readonly tenantService: TenantService,
  ) {}

  private readonly logger = new Logger(SystemUserService.name);

  async getAll(): Promise<SystemUser[]> {
    const allSystemUsers = await this.db.select().from(systemUsers);

    for (const systemUser of allSystemUsers) {
      systemUser.password = EncryptionUtil.decryptPassword(
        systemUser.password as object,
      );
    }

    return allSystemUsers;
  }

  async getById(id: string): Promise<SystemUser> {
    const result = await this.db
      .select()
      .from(systemUsers)
      .where(eq(systemUsers.id, id));

    if (result.length > 0) {
      const dbSystemUser = result[0];

      dbSystemUser.password = EncryptionUtil.decryptPassword(
        dbSystemUser.password as object,
      );

      return dbSystemUser;
    } else {
      this.logger.error(`System User with ID ${id} couldn't be found`);
      throw new HttpException(
        `System User with ID ${id} couldn't be found`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async getByTenantAbbreviation(
    tenantAbbreviation: string,
  ): Promise<SystemUser> {
    const result = await this.db
      .select()
      .from(systemUsers)
      .where(eq(systemUsers.tenantAbbreviation, tenantAbbreviation));

    if (result.length > 0) {
      const dbSystemUser = result[0];

      dbSystemUser.password = EncryptionUtil.decryptPassword(
        dbSystemUser.password as object,
      );

      return dbSystemUser;
    } else {
      this.logger.error(
        `System User with tenant abbreviation ${tenantAbbreviation} couldn't be found`,
      );
      throw new HttpException(
        `System User with tenant abbreviation ${tenantAbbreviation} couldn't be found`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async create(
    tenantAbbreviation: string,
    username: string,
    passwordFromHeader: string,
  ): Promise<SystemUser> {
    if (!tenantAbbreviation) {
      this.logger.error(`Recieved no tenant abbreviation`);
      throw new HttpException(
        'Tenant abbreviation cannot be null or empty.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!username) {
      this.logger.error(`Recieved no username`);
      throw new HttpException(
        'Username cannot be null or empty.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!passwordFromHeader) {
      this.logger.error(`Recieved no password`);
      throw new HttpException(
        'Password cannot be null or empty.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingUsername = await this.db
      .select()
      .from(systemUsers)
      .where(eq(systemUsers.username, username));

    if (existingUsername.length !== 0) {
      this.logger.warn(`Username Already Exists`);
      throw new HttpException('Username must be unique', HttpStatus.CONFLICT);
    }
    // Check if a user with the same tenant abbreviation already exists
    const existingUser = await this.db
      .select()
      .from(systemUsers)
      .where(eq(systemUsers.tenantAbbreviation, tenantAbbreviation));
    if (existingUser.length > 0) {
      this.logger.warn(
        `A System User Already Exists For Tenant Abbreviation: ${tenantAbbreviation}`,
      );
      throw new HttpException(
        'A Tenant can only have one System User.',
        HttpStatus.CONFLICT,
      );
    } else {
      const hashedPassword = EncryptionUtil.encryptPassword(
        passwordFromHeader as string,
      );

      const userToCreate: NewSystemUser = {
        tenantAbbreviation,
        username,
        password: hashedPassword,
      };

      const result = await this.db
        .insert(systemUsers)
        .values(userToCreate)
        .returning();

      const tenantExists = await this.tenantService.existsByAbbreviation(
        result[0].tenantAbbreviation,
      );

      if (result.length > 0 && !tenantExists) {
        this.tenantService.create({ abbreviation: tenantAbbreviation });
      }

      await this.organisationService.updateGroupingElements();

      // Create default corporate infos
      await this.createDefaultCorporateInfos(tenantAbbreviation);

      return result.length > 0 ? result[0] : null;
    }
  }

  async delete(username: string): Promise<SystemUser[]> {
    const result = await this.db
      .delete(systemUsers)
      .where(eq(systemUsers.username, username))
      .returning();

    if (result.length === 0) {
      this.logger.warn(`User Does Not Exist In Database: ${username}`);
      throw new HttpException(
        `User with name ${username} does not exist.`,
        HttpStatus.NOT_FOUND,
      );
    }

    return result;
  }

  async deleteAll(): Promise<SystemUser[]> {
    return this.db.delete(systemUsers).returning();
  }

  private async createDefaultCorporateInfos(
    tenantAbbreviation: string,
  ): Promise<void> {
    //Create default light mode corporate info object from template for corporate info
    const defaultCorporateInfoLight: NewCorporateInfo = {
      ...DefaultCorporateInfo,
      tenantId: tenantAbbreviation,
    };

    //Set titleBar property to "Light"
    defaultCorporateInfoLight.titleBar = 'Light';

    //Insert default light mode corporate info object into database
    await this.db.insert(corporateInfos).values(defaultCorporateInfoLight);

    //Create default dark mode corporate info object from template for corporate info
    const defaultCorporateInfoDark: NewCorporateInfo = {
      ...DefaultCorporateInfo,
      tenantId: tenantAbbreviation,
    };

    //Set titleBar property to "Dark"
    defaultCorporateInfoDark.titleBar = 'Dark';

    //Insert default dark mode corporate info object into database
    await this.db.insert(corporateInfos).values(defaultCorporateInfoDark);
  }
}
