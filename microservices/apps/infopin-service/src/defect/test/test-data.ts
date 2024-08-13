import { DbType } from '@app/postgres-db';
import { v4 as uuid } from 'uuid';
import { Defect, defects } from '@app/postgres-db/schemas/defect.schema';

export function getDefect(): Defect {
  return {
    id: '',
    location: {
      lat: 9.444,
      lng: -9.444,
    },
    category: 'test',
    description: 'test description',
    imgPath: '/images/test.png',
    mail: 'test@test.com',
    phone: '+1 555 728',
    visibility: 'public',
    readRoles: [],
    writeRoles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function createDefectByObject(
  dbClient: DbType,
  defect: Defect,
): Promise<Defect> {
  defect.id = uuid();

  const createdDefects = await dbClient
    .insert(defects)
    .values(defect)
    .returning();

  return createdDefects.length > 0 ? createdDefects[0] : null;
}
