import { DbType } from '@app/postgres-db';
import { Widget, widgets } from '@app/postgres-db/schemas';
import {
  widgetsToPanels,
  WidgetToPanel,
} from '@app/postgres-db/schemas/dashboard.widget-to-panel.schema';
import { v4 as uuid } from 'uuid';
import {
  widgetsToTenants,
  WidgetToTenant,
} from '@app/postgres-db/schemas/widget-to-tenant.schema';

export function getWidget(readRoles: string[], writeRoles: string[]): Widget {
  return {
    id: uuid(),
    name: 'Sample Widget',
    height: 400,
    width: 140,
    visibility: 'public',
    icon: 'test.png',
    readRoles: readRoles,
    writeRoles: writeRoles,
  };
}

export async function createWidgetByObject(
  db: DbType,
  widget: Widget,
  panelId?: string,
): Promise<Widget> {
  const createdWidgets = await db.insert(widgets).values(widget).returning();

  if (createdWidgets.length > 0) {
    const widget = createdWidgets[0];

    if (panelId) {
      await createWidgetToPanelRelation(db, widget.id, panelId);
    }

    return widget;
  } else {
    return null;
  }
}

export async function createWidgetToPanelRelation(
  db: DbType,
  widgetId: string,
  panelId: string,
): Promise<WidgetToPanel> {
  const createdRelations = await db
    .insert(widgetsToPanels)
    .values({
      widgetId: widgetId,
      panelId: panelId,
    })
    .returning();

  return createdRelations.length > 0 ? createdRelations[0] : null;
}

export async function createWidgetToTenantRelation(
  db: DbType,
  widgetId: string,
  tenantId: string,
): Promise<WidgetToTenant> {
  const createdRelations = await db
    .insert(widgetsToTenants)
    .values({
      widgetId: widgetId,
      tenantId: tenantId,
    })
    .returning();

  return createdRelations.length > 0 ? createdRelations[0] : null;
}
