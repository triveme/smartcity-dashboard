import { Logo, logos } from '@app/postgres-db/schemas/logo.schema';
import { DbType } from '@app/postgres-db';
import { v4 as uuid } from 'uuid';
import { createTenantByObject } from '../../tenant/test/test-data';

export function getLogo(): Logo {
  return {
    id: uuid(),
    tenantId: 'edag',
    logo: 'https://example.com/logo.png',
    logoHeight: 100,
    logoWidth: 200,
    format: 'png',
    size: 'large',
    logoName: 'edag_big.png',
  };
}

export async function createLogoByObject(
  db: DbType,
  logo: Logo,
  createTenant?: boolean,
): Promise<Logo> {
  if (createTenant) {
    await createTenantByObject(db, { id: uuid(), abbreviation: logo.tenantId });
  }
  const createdLogos = await db.insert(logos).values(logo).returning();

  return createdLogos.length > 0 ? createdLogos[0] : null;
}
