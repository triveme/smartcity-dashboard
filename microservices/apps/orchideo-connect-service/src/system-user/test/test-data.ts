import { DbType } from '@app/postgres-db';
import {
  SystemUser,
  systemUsers,
} from '@app/postgres-db/schemas/tenant.system-user.schema';
import { v4 as uuid } from 'uuid';

export function getSystemUser(): SystemUser {
  return {
    id: '',
    tenantAbbreviation: 'edag',
    username: 'testUser',
    password: 'admin',
  };
}

export async function createSystemUser(
  db: DbType,
  systemUser: SystemUser,
): Promise<SystemUser> {
  systemUser.id = uuid();
  const createdSystemUser = await db
    .insert(systemUsers)
    .values(systemUser)
    .returning();

  return createdSystemUser.length > 0 ? createdSystemUser[0] : null;
}
