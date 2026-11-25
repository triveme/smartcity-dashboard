import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  ValueTranslation,
  valueTranslation,
} from '@app/postgres-db/schemas/value-translation.schema';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, eq, isNull, or } from 'drizzle-orm';
import {
  NewTenantTranslation,
  UpdateValueTranslation,
} from './value-translation.model';

@Injectable()
export class ValueTranslationRepo {
  @Inject(POSTGRES_DB)
  private readonly db: DbType;

  private static translationsCache = new Map<string, ValueTranslation[]>();
  private static cacheExpiresAt = new Map<string, number>();
  private static loadingPromises = new Map<
    string,
    Promise<ValueTranslation[]>
  >();

  private static readonly CACHE_TTL_MS = 2 * 60 * 1000;

  async getAllTranslations(tenant?: string): Promise<ValueTranslation[]> {
    const cacheKey = tenant || '__all__';
    const now = Date.now();
    const cachedTranslations =
      ValueTranslationRepo.translationsCache.get(cacheKey);
    const cacheExpiresAt =
      ValueTranslationRepo.cacheExpiresAt.get(cacheKey) ?? 0;

    if (cachedTranslations && now < cacheExpiresAt) {
      return cachedTranslations;
    }

    const loadingPromise = ValueTranslationRepo.loadingPromises.get(cacheKey);
    if (loadingPromise) {
      return loadingPromise;
    }

    const query = this.db.select().from(valueTranslation);
    const filteredQuery = tenant
      ? query.where(
          or(
            isNull(valueTranslation.tenantId),
            eq(valueTranslation.tenantId, tenant),
          ),
        )
      : query;

    const newLoadingPromise = filteredQuery
      .then((translations) => {
        ValueTranslationRepo.translationsCache.set(cacheKey, translations);
        ValueTranslationRepo.cacheExpiresAt.set(
          cacheKey,
          Date.now() + ValueTranslationRepo.CACHE_TTL_MS,
        );

        return translations;
      })
      .finally(() => {
        ValueTranslationRepo.loadingPromises.delete(cacheKey);
      });

    ValueTranslationRepo.loadingPromises.set(cacheKey, newLoadingPromise);

    return newLoadingPromise;
  }

  async createTenantSpecificTranslation(
    body: NewTenantTranslation,
  ): Promise<ValueTranslation> {
    try {
      const result = await this.db
        .insert(valueTranslation)
        .values(body)
        .returning();

      this.clearTranslationsCache();
      return result[0];
    } catch (error: unknown) {
      const isUniqueViolation =
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23505';

      if (isUniqueViolation) {
        throw new ConflictException(
          `Translation with rawValue "${body.rawValue}" already exists for this tenant.`,
        );
      }

      const isForeignKeyViolation =
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === '23503';

      if (isForeignKeyViolation) {
        throw new NotFoundException(`Tenant "${body.tenantId}" not found.`);
      }

      throw error;
    }
  }

  async updateTenantSpecificTranslationById(
    id: string,
    tenant: string,
    values: UpdateValueTranslation,
  ): Promise<ValueTranslation> {
    const [result] = await this.db
      .update(valueTranslation)
      .set({
        label: values.label,
      })
      .where(
        and(eq(valueTranslation.id, id), eq(valueTranslation.tenantId, tenant)),
      )
      .returning();

    if (!result) {
      throw new NotFoundException('Translation not found.');
    }

    this.clearTranslationsCache();

    return result;
  }

  async deleteTenantSpecificTranslationById(
    id: string,
    tenant: string,
  ): Promise<ValueTranslation> {
    const [result] = await this.db
      .delete(valueTranslation)
      .where(
        and(eq(valueTranslation.id, id), eq(valueTranslation.tenantId, tenant)),
      )
      .returning();

    if (!result) {
      throw new NotFoundException('Translation not found.');
    }

    this.clearTranslationsCache();

    return result;
  }

  clearTranslationsCache(): void {
    ValueTranslationRepo.translationsCache.clear();
    ValueTranslationRepo.cacheExpiresAt.clear();
  }
}
