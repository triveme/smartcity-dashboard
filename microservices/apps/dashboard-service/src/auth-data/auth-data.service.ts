import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { v4 as uuid } from 'uuid';
import {
  AuthData,
  authData,
  NewAuthData,
} from '@app/postgres-db/schemas/auth-data.schema';
import { DataSourceService } from '../data-source/data-source.service';
import { AuthDataRepo } from './auth-data.repo';
import { dataSources } from '@app/postgres-db/schemas/data-source.schema';
import { queryConfigs } from '@app/postgres-db/schemas/query-config.schema';
import { queries } from '@app/postgres-db/schemas/query.schema';
import { tabs, widgets } from '@app/postgres-db/schemas';
import { widgetsToTenants } from '@app/postgres-db/schemas/widget-to-tenant.schema';
import { eq } from 'drizzle-orm';
import { RoleUtil } from '../../../infopin-service/src/utility/RoleUtil';
import { AuthHelperUtility } from '@app/auth-helper';
import {
  checkAuthorizationToRead,
  checkAuthorizationToWrite,
  checkRequiredRights,
} from '@app/auth-helper/right-management/right-management.service';
import { EncryptionUtil } from '../util/encryption.util';
import { widgetsToPanels } from '@app/postgres-db/schemas/dashboard.widget-to-panel.schema';

@Injectable()
export class AuthDataService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly dataSourceService: DataSourceService,
    private readonly authDataRepo: AuthDataRepo,
    private readonly authHelperUtility: AuthHelperUtility,
  ) {}

  private readonly logger = new Logger(AuthDataService.name);

  async getAll(rolesFromRequest: string[]): Promise<AuthData[]> {
    // Fetch all AuthData
    let allAuthData = await this.authDataRepo.getAll();

    // Filter AuthData based on read and write roles
    allAuthData = allAuthData.filter((authData) => {
      return (
        checkRequiredRights(authData, authData.readRoles, rolesFromRequest) ||
        checkRequiredRights(authData, authData.writeRoles, rolesFromRequest)
      );
    });

    // Log a warning if no AuthData found
    if (allAuthData.length === 0) {
      this.logger.warn('No AuthData Found in Database');
      return [];
    } else {
      // Remove readRoles and writeRoles from the return body so they are not exposed to the frontend
      if (rolesFromRequest.length === 0) {
        allAuthData.forEach((authData) => {
          delete authData.readRoles;
          delete authData.writeRoles;
        });
      }

      for (const authData of allAuthData) {
        authData.clientSecret = EncryptionUtil.decryptPassword(
          authData.clientSecret as object,
        );
        authData.appUserPassword = EncryptionUtil.decryptPassword(
          authData.appUserPassword as object,
        );
      }

      return allAuthData;
    }
  }

  async getByTenant(
    rolesFromRequest: string[],
    tenantAbbreviation: string,
  ): Promise<AuthData[]> {
    // Fetch all AuthData
    let allAuthData = await this.authDataRepo.getByTenant(tenantAbbreviation);

    // Filter AuthData based on read and write roles
    allAuthData = allAuthData.filter((authData) => {
      return (
        checkRequiredRights(authData, authData.readRoles, rolesFromRequest) ||
        checkRequiredRights(authData, authData.writeRoles, rolesFromRequest)
      );
    });

    // Log a warning if no AuthData found
    if (allAuthData.length === 0) {
      this.logger.warn(
        `No AuthData found for Tenant with Abbreviation: ${tenantAbbreviation}`,
      );
      return [];
    } else {
      // Remove readRoles and writeRoles from the return body so they are not exposed to the frontend
      if (rolesFromRequest.length === 0) {
        allAuthData.forEach((authData) => {
          delete authData.readRoles;
          delete authData.writeRoles;
        });
      }

      for (const authData of allAuthData) {
        authData.clientSecret = EncryptionUtil.decryptPassword(
          authData.clientSecret as object,
        );
        authData.appUserPassword = EncryptionUtil.decryptPassword(
          authData.appUserPassword as object,
        );
      }

      return allAuthData;
    }
  }

  async getById(id: string, rolesFromRequest: string[]): Promise<AuthData> {
    const authData = await this.authDataRepo.getById(id);

    if (!authData) {
      this.logger.error(`AuthData with id ${id} not found`);
      throw new HttpException('AuthData Not Found', HttpStatus.NOT_FOUND);
    } else {
      checkAuthorizationToWrite(authData, rolesFromRequest);
      checkAuthorizationToRead(authData, rolesFromRequest);

      if (rolesFromRequest.length === 0) {
        delete authData.readRoles;
        delete authData.writeRoles;
      }

      authData.clientSecret = EncryptionUtil.decryptPassword(
        authData.clientSecret as object,
      );
      authData.appUserPassword = EncryptionUtil.decryptPassword(
        authData.appUserPassword as object,
      );

      return authData;
    }
  }

  async create(
    row: NewAuthData,
    rolesFromRequest: string[],
  ): Promise<NewAuthData> {
    // Check for roles
    if (
      !this.authHelperUtility.isAdmin(rolesFromRequest) &&
      !this.authHelperUtility.isEditor(rolesFromRequest)
    ) {
      throw new HttpException(
        'Cannot create Dataplattform',
        HttpStatus.FORBIDDEN,
      );
    }
    // Perform the transaction if all checks pass
    return await this.db.transaction(async (tx) => {
      // TODO: set the visibility of a Dataplattform via frontend and remove this line
      row.visibility = 'protected';
      // Populate roles
      RoleUtil.populateRoles(row, rolesFromRequest);

      if (row.type !== 'api') {
        row.appUserPassword = EncryptionUtil.encryptPassword(
          row.appUserPassword as string,
        );
        row.clientSecret = EncryptionUtil.encryptPassword(
          row.clientSecret as string,
        );
      }

      // Create auth data
      const createdAuthData = await this.authDataRepo.create(row, tx);

      // Create associated data source
      await this.dataSourceService.create(
        {
          id: uuid(),
          authDataId: createdAuthData.id,
          name: createdAuthData.name,
          origin: createdAuthData.type,
          collections: createdAuthData.collections,
        },
        tx,
      );

      return createdAuthData;
    });
  }

  async update(
    id: string,
    values: Partial<AuthData>,
    rolesFromRequest: string[],
  ): Promise<AuthData> {
    return await this.db.transaction(async (tx) => {
      // Fetch the existing auth data and check for authorization
      const authDataToUpdate = await this.getById(id, rolesFromRequest);
      checkAuthorizationToWrite(authDataToUpdate, rolesFromRequest);

      // Populate roles for the new values
      RoleUtil.populateRoles(values, rolesFromRequest);

      // Handle visibility logic if applicable
      if (values.visibility === 'public') {
        values.readRoles = [];
        values.writeRoles = [];
      }

      if (values.appUserPassword) {
        values.appUserPassword = EncryptionUtil.encryptPassword(
          values.appUserPassword as string,
        );
      }
      if (values.clientSecret) {
        values.clientSecret = EncryptionUtil.encryptPassword(
          values.clientSecret as string,
        );
      }

      // Update the auth data
      const updatedAuthData = await this.authDataRepo.update(id, values, tx);

      if (!updatedAuthData) {
        this.logger.error(`AuthData with id ${id} not found`);
        throw new HttpException('AuthData Not Found', HttpStatus.NOT_FOUND);
      }

      // Update associated data source
      const dataSource = await this.dataSourceService.getByAuthDataId(id);
      if (values.name) dataSource.name = values.name;
      if (values.type) dataSource.origin = values.type;
      if (values.collections) dataSource.collections = values.collections;

      await this.dataSourceService.update(dataSource.id, dataSource, tx);

      return updatedAuthData;
    });
  }

  private async checkIfAuthDataCanBeDeleted(
    id: string,
    rolesFromRequest: string[],
  ): Promise<void> {
    const authData: AuthData = await this.authDataRepo.getById(id);

    if (
      authData &&
      authData.writeRoles &&
      rolesFromRequest.length > 0 &&
      authData.visibility != 'public'
    ) {
      const thereAreRoleMatches = authData.writeRoles.some((value) =>
        rolesFromRequest.includes(value),
      );

      if (!thereAreRoleMatches) {
        throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
      }
    }
  }

  async delete(id: string, rolesFromRequest: string[]): Promise<AuthData> {
    const authDataToDelete = await this.getById(id, rolesFromRequest);

    if (!authDataToDelete) {
      this.logger.error(`AuthData with id ${id} not found`);
      throw new HttpException('AuthData Not Found', HttpStatus.NOT_FOUND);
    } else {
      // Transaction wrapped deletion to ensure consistency
      return await this.db.transaction(async (tx) => {
        const authDataToDelete = await this.getById(id, rolesFromRequest);

        checkAuthorizationToWrite(authDataToDelete, rolesFromRequest);
        await this.checkIfAuthDataCanBeDeleted(id, rolesFromRequest);

        const authDataExists = await tx
          .select()
          .from(authData)
          .where(eq(authData.id, id));

        if (authDataExists.length === 0) {
          throw new Error(`AuthData with id ${id} does not exist.`);
        }

        const relatedDataSource = await tx
          .select()
          .from(dataSources)
          .where(eq(dataSources.authDataId, id))
          .limit(1);

        if (relatedDataSource.length === 0) {
          throw new Error(
            `No DataSource related to AuthData with id ${id} found.`,
          );
        }

        const relatedQueryConfigs = await tx
          .select()
          .from(queryConfigs)
          .where(eq(queryConfigs.dataSourceId, relatedDataSource[0].id));

        // If the DataSource exists in 1 or more queryConfigs, then we begin cascade deletion across the widget(s)
        if (relatedQueryConfigs.length !== 0) {
          for (const queryConfig of relatedQueryConfigs) {
            const relatedQueries = await tx
              .select()
              .from(queries)
              .where(eq(queries.queryConfigId, queryConfig.id));

            for (const query of relatedQueries) {
              const relatedTabs = await tx
                .select()
                .from(tabs)
                .where(eq(tabs.queryId, query.id));

              for (const tab of relatedTabs) {
                const relatedWidgets = await tx
                  .select()
                  .from(widgets)
                  .where(eq(widgets.id, tab.widgetId));

                for (const widget of relatedWidgets) {
                  await tx
                    .delete(widgetsToTenants)
                    .where(eq(widgetsToTenants.widgetId, widget.id));

                  await tx.delete(tabs).where(eq(tabs.widgetId, widget.id));
                  await tx
                    .delete(widgetsToPanels)
                    .where(eq(widgetsToPanels.widgetId, widget.id));
                  await tx.delete(widgets).where(eq(widgets.id, tab.widgetId));
                }
              }

              await tx.delete(queries).where(eq(queries.id, query.id));
            }

            await tx
              .delete(queryConfigs)
              .where(eq(queryConfigs.id, queryConfig.id));
          }
        }

        // Delete related DataSource record
        await tx.delete(dataSources).where(eq(dataSources.authDataId, id));

        // Finally, delete the AuthData record
        const authDataDeletion = await tx
          .delete(authData)
          .where(eq(authData.id, id))
          .returning();

        return authDataDeletion.length > 0 ? authDataDeletion[0] : null;
      });
    }
  }
}
