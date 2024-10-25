import { Inject, Injectable } from '@nestjs/common';

import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  CorporateInfo,
  NewCorporateInfo,
} from '@app/postgres-db/schemas/corporate-info.schema';
import {
  CorporateInfoRepo,
  CorporateInfoWithLogos,
  SidebarLogo,
} from './corporate-info.repo';
import { CorporateInfoSidebarLogo } from '@app/postgres-db/schemas/corporate-info-sidebar-logos.schema';
import { CorporateInfoSidebarLogosRepo } from './corporate-info-sidebar-logos.repo';
import { LogoRepo } from '../logo/logo.repo';

@Injectable()
export class CorporateInfoService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly corporateInfoRepository: CorporateInfoRepo,
    private readonly corporateInfoSidebarLogosRepo: CorporateInfoSidebarLogosRepo,
    private readonly logoRepo: LogoRepo,
  ) {}

  async getAllWithLogos(): Promise<CorporateInfoWithLogos[]> {
    const corporateInfosWithLogos =
      await this.corporateInfoRepository.getAllWithLogos();

    // Fetch and group sidebar logos by corporateInfoId
    const sidebarLogos = await this.corporateInfoSidebarLogosRepo.getAll();

    // Group sidebar logos by corporateInfoId
    const groupedSidebarLogos = sidebarLogos.reduce(
      (acc: CorporateInfoSidebarLogo, logo) => {
        if (!acc[logo.corporateInfoId]) {
          acc[logo.corporateInfoId] = [];
        }
        acc[logo.corporateInfoId].push(logo);
        return acc;
      },
      {
        corporateInfoId: null,
        logoId: null,
        order: null,
      },
    );

    // Combine corporate info with grouped sidebar logos
    return corporateInfosWithLogos.map((info) => ({
      ...info,
      sidebarLogos: groupedSidebarLogos[info.id] || [],
    }));
  }

  async getAll(): Promise<CorporateInfo[]> {
    return this.corporateInfoRepository.getAll();
  }

  async getByTenant(
    tenantAbbreviation: string,
    withLogos: boolean,
  ): Promise<CorporateInfo[] | CorporateInfoWithLogos[]> {
    return this.corporateInfoRepository.getByTenant(
      tenantAbbreviation,
      withLogos,
    );
  }

  async create(
    row: NewCorporateInfo & {
      sidebarLogos?: SidebarLogo[];
    },
    transaction?: DbType,
  ): Promise<CorporateInfo> {
    const dbActor = transaction === undefined ? this.db : transaction;

    return dbActor.transaction(async (tx) => {
      const corporateInfo = await this.corporateInfoRepository.create(row, tx);

      await this.createSidebarLogosAndRelations(row, corporateInfo, tx);

      return corporateInfo;
    });
  }

  async update(
    id: string,
    values: Partial<
      CorporateInfo & {
        sidebarLogos?: SidebarLogo[];
      }
    >,
  ): Promise<CorporateInfo> {
    return this.db.transaction(async (tx) => {
      const { sidebarLogos, ...updateData } = values;

      if (Object.keys(updateData).length > 0) {
        await this.corporateInfoRepository.update(id, updateData, tx);
      }

      await this.updateSidebarLogosAndRelations(sidebarLogos, id, tx);

      return await this.corporateInfoRepository.getById(id);
    });
  }

  async delete(id: string): Promise<CorporateInfo> {
    return this.db.transaction(async (tx) => {
      const deletedCorporateInfo = await this.corporateInfoRepository.delete(
        id,
        tx,
      );

      await this.corporateInfoSidebarLogosRepo.deleteRelationsForCorporateInfo(
        deletedCorporateInfo.id,
        tx,
      );

      return deletedCorporateInfo;
    });
  }

  async deleteByTenant(
    tenantAbbreviation: string,
    transaction?: DbType,
  ): Promise<CorporateInfo[]> {
    const dbActor = transaction ? transaction : this.db;

    return dbActor.transaction(async (tx) => {
      const deletedCorporateInfos =
        await this.corporateInfoRepository.deleteByTenant(
          tenantAbbreviation,
          transaction,
        );

      for (const deletedCorporateInfo of deletedCorporateInfos) {
        await this.corporateInfoSidebarLogosRepo.deleteRelationsForCorporateInfo(
          deletedCorporateInfo.id,
          tx,
        );
      }

      return deletedCorporateInfos;
    });
  }

  private async createSidebarLogosAndRelations(
    row: NewCorporateInfo & {
      sidebarLogos?: SidebarLogo[];
    },
    dbCorporateInfo: CorporateInfo,
    tx: DbType,
  ): Promise<void> {
    const sidebarLogos = row.sidebarLogos;
    const allLogos = await this.logoRepo.getAllForTenantAbbreviation(
      row.tenantId,
    );
    const allLogoIds = allLogos.map((logo) => logo.id);

    if (sidebarLogos && sidebarLogos.length > 0) {
      const sidebarLogosToCreate = row.sidebarLogos.filter(
        (sidebarLogo) => !allLogoIds.includes(sidebarLogo.id),
      );
      await this.logoRepo.createMultiple(sidebarLogosToCreate);
      const dbLogos = await this.logoRepo.getAllForTenantAbbreviation(
        row.tenantId,
      );
      const sidebarLogoNames = sidebarLogos.map(
        (sidebarLogo) => sidebarLogo.logoName,
      );

      const corporateInfoToSidebarLogoRelations = dbLogos
        .filter((dbLogo) => sidebarLogoNames.includes(dbLogo.logoName))
        .map((dbLogo) => {
          const sidebarLogo = sidebarLogos.filter(
            (logo) => logo.logoName === dbLogo.logoName,
          )[0];

          return {
            corporateInfoId: dbCorporateInfo.id,
            logoId: dbLogo.id,
            order: sidebarLogo ? sidebarLogo.order : null,
          };
        });

      await this.corporateInfoSidebarLogosRepo.createMultiple(
        corporateInfoToSidebarLogoRelations,
        tx,
      );
    }
  }

  private async createRelations(
    sidebarLogos: SidebarLogo[],
    corporateInfoId: string,
    addLogoRelationIds: Array<string>,
    transaction: DbType,
  ): Promise<void> {
    const newRelations: CorporateInfoSidebarLogo[] = addLogoRelationIds.map(
      (logoId) => {
        const sidebarLogo = sidebarLogos.filter(
          (sidebarLogo) => sidebarLogo.id === logoId,
        )[0];

        return {
          corporateInfoId: corporateInfoId,
          logoId: logoId,
          order: sidebarLogo ? sidebarLogo.order : null,
        };
      },
    );

    if (newRelations.length > 0) {
      await this.corporateInfoSidebarLogosRepo.createMultiple(
        newRelations,
        transaction,
      );
    }
  }

  private async deleteRelations(
    corporateInfoId: string,
    deletionLogoRelationIds: Array<string>,
    transaction: DbType,
  ): Promise<void> {
    if (deletionLogoRelationIds.length === 0) return;

    await this.corporateInfoSidebarLogosRepo.deleteMultiple(
      corporateInfoId,
      deletionLogoRelationIds,
      transaction,
    );
  }

  private getSidebarLogosToUpdate(
    sidebarLogos: SidebarLogo[],
    existingLogoRelationIds: Array<string>,
    deletionLogoRelationIds: Array<string>,
  ): SidebarLogo[] {
    return sidebarLogos.filter(
      (sidebarLogo) =>
        existingLogoRelationIds.includes(sidebarLogo.id) &&
        !deletionLogoRelationIds.includes(sidebarLogo.id),
    );
  }

  private async updateSidebarLogosAndRelations(
    sidebarLogos: SidebarLogo[],
    corporateInfoId: string,
    transaction: DbType,
  ): Promise<SidebarLogo[]> {
    if (sidebarLogos) {
      const corporateInfoToLogoRelations =
        await this.corporateInfoSidebarLogosRepo.getByCorporateInfoId(
          corporateInfoId,
        );
      const relationLogoIds = corporateInfoToLogoRelations.map(
        (relation) => relation.logoId,
      );
      const sidebarLogoIds = sidebarLogos.map((sidebarLogo) => sidebarLogo.id);

      const existingLogoRelationIds = sidebarLogoIds.filter((sidebarLogoId) =>
        relationLogoIds.includes(sidebarLogoId),
      );
      const deletionLogoRelationIds = relationLogoIds.filter(
        (relationLogoId) => !sidebarLogoIds.includes(relationLogoId),
      );
      const addLogoRelationIds = sidebarLogoIds.filter(
        (sidebarLogoId) => !relationLogoIds.includes(sidebarLogoId),
      );

      await this.updateRelations(
        sidebarLogos,
        existingLogoRelationIds,
        deletionLogoRelationIds,
        corporateInfoId,
        transaction,
      );

      await this.createRelations(
        sidebarLogos,
        corporateInfoId,
        addLogoRelationIds,
        transaction,
      );
      await this.deleteRelations(
        corporateInfoId,
        deletionLogoRelationIds,
        transaction,
      );

      return this.logoRepo.getSidebarLogosByCorporateInfoId(corporateInfoId);
    }
  }

  private async updateRelations(
    sidebarLogos: SidebarLogo[],
    existingLogoRelationIds: Array<string>,
    deletionLogoRelationIds: Array<string>,
    corporateInfoId: string,
    transaction: DbType,
  ): Promise<void> {
    const sidebarLogosToUpdate = this.getSidebarLogosToUpdate(
      sidebarLogos,
      existingLogoRelationIds,
      deletionLogoRelationIds,
    );

    for (const logo of sidebarLogosToUpdate) {
      const { order, ...logoData } = logo;

      await this.logoRepo.update(logo.id, logoData);

      await this.corporateInfoSidebarLogosRepo.update(
        corporateInfoId,
        logo.id,
        order,
        transaction,
      );
    }
  }
}
