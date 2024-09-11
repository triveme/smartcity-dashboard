import { DbType } from '@app/postgres-db';
import { Panel, panels } from '@app/postgres-db/schemas';
import { v4 as uuid } from 'uuid';

export function getPanel(dashboardId?: string): Panel {
  return {
    id: uuid(),
    dashboardId: dashboardId,
    name: 'Sample Panel',
    height: 140,
    width: 140,
    position: 1,
    headlineColor: '#000',
    info: 'Sample Message',
    generalInfo: 'Sample General Info',
    showGeneralInfo: false,
    showJumpoffButton: false,
    jumpoffLabel: 'Sample Label',
    jumpoffIcon: 'ChevronLeft',
    jumpoffUrl: 'defaultUrl',
  };
}

export async function createPanelByObject(
  db: DbType,
  panel: Panel,
): Promise<Panel> {
  const createdPanels = await db.insert(panels).values(panel).returning();

  return createdPanels.length > 0 ? createdPanels[0] : null;
}
