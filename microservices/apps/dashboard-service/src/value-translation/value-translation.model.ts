import {
  NewValueTranslation,
  ValueTranslation,
} from '@app/postgres-db/schemas/value-translation.schema';

export type CreateTenantTranslation = {
  category: string;
  rawValue: string;
  label: string;
};

export type NewTenantTranslation = CreateTenantTranslation & {
  tenantId: NonNullable<NewValueTranslation['tenantId']>;
};

export type UpdateValueTranslation = Pick<ValueTranslation, 'label'> & {
  label: string;
};
