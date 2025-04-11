import { Inject, Injectable, Logger } from '@nestjs/common';
import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { AuthService } from '../auth/auth.service';
import axios from 'axios';
import { tenants } from '@app/postgres-db/schemas/tenant.schema';
import { groupingElements } from '@app/postgres-db/schemas/dashboard.grouping-element.schema';
import { eq } from 'drizzle-orm';
import { v4 as uuid } from 'uuid';
import {
  SystemUser,
  systemUsers,
} from '@app/postgres-db/schemas/tenant.system-user.schema';
import { EncryptionUtil } from '../../../dashboard-service/src/util/encryption.util';

type OrganisationResponse = { id: string; name: string };

type GroupingElementNamesAndUrls = {
  groupingElementNames: string[];
  groupingElementUris: string[];
};

@Injectable()
export class OrganisationService {
  private readonly apiBaseUrl: string;
  private readonly authUrl: string;
  private readonly logger = new Logger(OrganisationService.name);

  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly authService: AuthService,
  ) {
    this.apiBaseUrl = `${process.env.ORCHIDEO_CONNECT_MANDATORS_URL}/mandators`;
    this.authUrl = `${process.env.API_AUTH_URL}`;
  }

  async updateGroupingElements(): Promise<void> {
    const mandators = await this.getMandatorCodes();
    const groupingElementNamesAndUrls =
      await this.getGroupingElementNamesAndUrls();

    for (const mandatorCode of mandators) {
      const organisations = await this.getOrganisations(
        mandatorCode,
        groupingElementNamesAndUrls,
      );

      for (const organisation of organisations) {
        await this.createGroupingElementForOrganisation(
          organisation.name,
          mandatorCode,
        );
      }
    }
  }

  private async createGroupingElementForOrganisation(
    organisationName: string,
    mandatorCode: string,
  ): Promise<void> {
    const mandator = mandatorCode.toLowerCase();
    const urlOrganisation = this.convertToUrl(
      organisationName.replace(/\s+/g, ''), //Remove all whitespace
    );

    const value = {
      id: uuid(),
      name: organisationName,
      url: `${mandator}-${urlOrganisation}`,
      isDashboard: false,
      tenantAbbreviation: mandatorCode,
      icon: 'ChevronLeft', // Assigning a default icon
    };

    await this.db.insert(groupingElements).values(value);

    this.logger.log(
      `Created grouping element for organisation ${organisationName} tenant ${mandatorCode}`,
      value,
    );
  }

  private async getGroupingElementNamesAndUrls(): Promise<GroupingElementNamesAndUrls> {
    const groupingElementsNamesAndUris = await this.db
      .select({
        name: groupingElements.name,
        url: groupingElements.url,
      })
      .from(groupingElements)
      .where(eq(groupingElements.isDashboard, false));

    const groupingElementNames = groupingElementsNamesAndUris.map(
      (groupingElement) => groupingElement.name,
    );
    const groupingElementUris = groupingElementsNamesAndUris.map(
      (groupingElement) => groupingElement.url,
    );

    return { groupingElementNames, groupingElementUris };
  }

  private async getMandatorCodes(): Promise<string[]> {
    const mandatorObjects = await this.db
      .select({ mandatorCode: tenants.abbreviation })
      .from(tenants);

    return mandatorObjects.map((mandatorObject) => mandatorObject.mandatorCode);
  }

  private async getOrganisations(
    mandatorCode: string,
    groupingElementNamesAndUrls: GroupingElementNamesAndUrls,
  ): Promise<OrganisationResponse[]> {
    const organisations =
      await this.getOrganisationsDataFromDataSource(mandatorCode);

    return organisations
      ? organisations.filter(
          (organisation) =>
            !this.hasOrganisationAnGroupingElement(
              organisation.name,
              groupingElementNamesAndUrls,
              mandatorCode,
            ),
        )
      : [];
  }

  async getByTenantAbbreviation(
    tenantAbbreviation: string,
  ): Promise<SystemUser> {
    const result = await this.db
      .select()
      .from(systemUsers)
      .where(eq(systemUsers.tenantAbbreviation, tenantAbbreviation));
    return result.length > 0 ? result[0] : null;
  }

  async getOrganisationsDataFromDataSource(
    mandator: string,
  ): Promise<OrganisationResponse[]> {
    try {
      const authData = await this.getByTenantAbbreviation(mandator);
      if (!authData) {
        throw new Error(`Could not get credentials for mandator ${mandator}`);
      }
      const tokenData = await this.authService.getTokenData({
        authUrl: this.authUrl,
        username: authData.username,
        password: EncryptionUtil.decryptPassword(authData.password as object),
      });
      if (!tokenData.access_token) {
        throw new Error(`Could not get access token for mandator ${mandator}`);
      }
      const url = `${this.apiBaseUrl}/${mandator}/organisations`;
      const headers = {
        Authorization: `Bearer ${tokenData.access_token}`,
      };

      const response = await axios.get<OrganisationResponse[]>(url, {
        headers,
      });

      return response.data;
    } catch (error) {
      this.logger.error(
        `Could not get organisations data for mandator ${mandator}`,
        error,
      );
    }
  }

  private hasOrganisationAnGroupingElement(
    organisation: string,
    groupingElementNamesAndUrls: GroupingElementNamesAndUrls,
    mandatorCode: string,
  ): boolean {
    const mandator = mandatorCode.toLowerCase();
    const urlOrganisation = this.convertToUrl(
      organisation.replace(/\s+/g, ''), //Remove all whitespace
    );
    const url = `${mandator}-${urlOrganisation}`;

    return (
      groupingElementNamesAndUrls.groupingElementUris.includes(url) &&
      groupingElementNamesAndUrls.groupingElementNames.includes(organisation)
    );
  }

  private convertToUrl(encodable: string): string {
    return encodeURI(encodable).toLowerCase();
  }
}
