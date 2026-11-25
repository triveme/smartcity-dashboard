import { Injectable } from '@nestjs/common';
import { ValueTranslationRepo } from './value-translation.repo';
import { ValueTranslation } from '@app/postgres-db/schemas/value-translation.schema';
import {
  CreateTenantTranslation,
  NewTenantTranslation,
  UpdateValueTranslation,
} from './value-translation.model';

@Injectable()
export class ValueTranslationService {
  constructor(
    private readonly valueTranslationRepository: ValueTranslationRepo,
  ) {}

  async getValuesTranslation(tenant: string): Promise<ValueTranslation[]> {
    return this.valueTranslationRepository.getAllTranslations(tenant.trim());
  }

  async createTenantSpecificTranslation(
    tenant: string,
    body: CreateTenantTranslation,
  ): Promise<ValueTranslation> {
    const newTranslation: NewTenantTranslation = {
      category: body.category.trim(),
      rawValue: body.rawValue.trim().toUpperCase(),
      label: body.label,
      tenantId: tenant.trim(),
    };

    return this.valueTranslationRepository.createTenantSpecificTranslation(
      newTranslation,
    );
  }

  async updateTennantSpecificTranslationById(
    id: string,
    tenant: string,
    value: UpdateValueTranslation,
  ): Promise<ValueTranslation> {
    return this.valueTranslationRepository.updateTenantSpecificTranslationById(
      id,
      tenant.trim(),
      value,
    );
  }

  async deleteTenantSpecificTranslationById(
    id: string,
    tenant: string,
  ): Promise<ValueTranslation> {
    return this.valueTranslationRepository.deleteTenantSpecificTranslationById(
      id,
      tenant.trim(),
    );
  }
}
