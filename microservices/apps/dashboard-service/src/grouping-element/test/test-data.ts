import { DbType } from '@app/postgres-db';
import {
  GroupingElement,
  groupingElements,
} from '@app/postgres-db/schemas/dashboard.grouping-element.schema';
import { v4 as uuid } from 'uuid';
import { eq } from 'drizzle-orm';

export function getGroupingElement(
  isDashboard?: boolean,
  url?: string,
  parentGroupingElementId?: string,
  position?: number,
  tenantAbbreviation?: string,
): GroupingElement {
  return {
    id: uuid(),
    name: '',
    color: '#000000',
    gradient: false,
    icon: null,
    url: url ?? 'http://localhost',
    isDashboard: isDashboard ?? false,
    parentGroupingElementId: parentGroupingElementId ?? null,
    position: position ?? null,
    tenantAbbreviation: tenantAbbreviation ?? null,
  };
}

export async function createGroupingElementByObject(
  db: DbType,
  groupingElement: GroupingElement,
): Promise<GroupingElement> {
  const createdGroupingElements = await db
    .insert(groupingElements)
    .values(groupingElement)
    .returning();

  return createdGroupingElements.length > 0 ? createdGroupingElements[0] : null;
}

export async function getGroupingElementFromDb(
  db: DbType,
  id: string,
): Promise<GroupingElement> {
  const groupingElementArray = await db
    .select()
    .from(groupingElements)
    .where(eq(groupingElements.id, id));

  return groupingElementArray.length > 0 ? groupingElementArray[0] : null;
}
