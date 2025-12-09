import { Inject, Injectable } from '@nestjs/common';
import { eq, inArray, and } from 'drizzle-orm';

import { DbType, POSTGRES_DB } from '@app/postgres-db';
import {
  EnrichedTab,
  NewEnrichedTab,
  Tab,
  tabs,
} from '@app/postgres-db/schemas/dashboard.tab.schema';
import { customMapSensorDataTable } from '@app/postgres-db/schemas/custom-map-sensor-data.schema';
import { tabValuesToImageTable } from '@app/postgres-db/schemas/dashboard.tab.values_to_image.schema';

@Injectable()
export class TabRepo {
  constructor(@Inject(POSTGRES_DB) private readonly db: DbType) {}

  async getAll(): Promise<EnrichedTab[]> {
    const tabsData = await this.db.select().from(tabs);
    const results = await Promise.all(
      tabsData.map(async (tab) => {
        const sensorData = await this.db
          .select()
          .from(customMapSensorDataTable)
          .where(eq(customMapSensorDataTable.tabId, tab.id));
        const valuesToImagesData = await this.db
          .select()
          .from(tabValuesToImageTable)
          .where(eq(tabValuesToImageTable.tabId, tab.id));
        return {
          ...tab,
          customMapSensorData: sensorData,
          valuesToImages: valuesToImagesData,
        };
      }),
    );
    return results;
  }

  async getById(id: string): Promise<EnrichedTab> {
    const result = await this.db.select().from(tabs).where(eq(tabs.id, id));
    if (result.length > 0) {
      const sensorData = await this.db
        .select()
        .from(customMapSensorDataTable)
        .where(eq(customMapSensorDataTable.tabId, id));

      const valuesToImagesData = await this.db
        .select()
        .from(tabValuesToImageTable)
        .where(eq(tabValuesToImageTable.tabId, id));

      return {
        ...result[0],
        customMapSensorData: sensorData,
        valuesToImages: valuesToImagesData,
      };
    }

    return result.length > 0 ? result[0] : null;
  }

  async getTabsByWidgetId(widgetId: string): Promise<EnrichedTab[]> {
    const tabsData = await this.db
      .select()
      .from(tabs)
      .where(eq(tabs.widgetId, widgetId));
    const results = await Promise.all(
      tabsData.map(async (tab) => {
        const sensorData = await this.db
          .select()
          .from(customMapSensorDataTable)
          .where(eq(customMapSensorDataTable.tabId, tab.id));
        const valuesToImagesData = await this.db
          .select()
          .from(tabValuesToImageTable)
          .where(eq(tabValuesToImageTable.tabId, tab.id));
        return {
          ...tab,
          customMapSensorData: sensorData,
          valuesToImages: valuesToImagesData,
        };
      }),
    );
    return results;
  }

  async getTabsByWidgetIds(widgetIds: string[]): Promise<EnrichedTab[]> {
    const tabsData = await this.db
      .select()
      .from(tabs)
      .where(inArray(tabs.widgetId, widgetIds));
    const results = await Promise.all(
      tabsData.map(async (tab) => {
        const sensorData = await this.db
          .select()
          .from(customMapSensorDataTable)
          .where(eq(customMapSensorDataTable.tabId, tab.id));
        const valuesToImagesData = await this.db
          .select()
          .from(tabValuesToImageTable)
          .where(eq(tabValuesToImageTable.tabId, tab.id));
        return {
          ...tab,
          customMapSensorData: sensorData,
          valuesToImages: valuesToImagesData,
        };
      }),
    );
    return results;
  }

  async getTabsByWidgetIdsAndComponentType(
    widgetIds: string[],
    componentType: string,
  ): Promise<EnrichedTab[]> {
    const tabsData = await this.db
      .select()
      .from(tabs)
      .where(
        and(
          inArray(tabs.widgetId, widgetIds),
          eq(
            tabs.componentType,
            componentType as
              | 'Informationen'
              | 'Diagramm'
              | 'Slider'
              | 'Karte'
              | 'Kombinierte Komponente'
              | 'Wetterwarnungen'
              | 'Wert'
              | 'iFrame'
              | 'Bild',
          ),
        ),
      );
    const results = await Promise.all(
      tabsData.map(async (tab) => {
        const sensorData = await this.db
          .select()
          .from(customMapSensorDataTable)
          .where(eq(customMapSensorDataTable.tabId, tab.id));
        const valuesToImagesData = await this.db
          .select()
          .from(tabValuesToImageTable)
          .where(eq(tabValuesToImageTable.tabId, tab.id));
        return {
          ...tab,
          customMapSensorData: sensorData,
          valuesToImages: valuesToImagesData,
        };
      }),
    );
    return results;
  }

  async create(
    row: NewEnrichedTab,
    transaction?: DbType,
  ): Promise<EnrichedTab> {
    const { customMapSensorData, valuesToImages, ...tabValues } = row;
    const dbActor = transaction === undefined ? this.db : transaction;

    const result = await dbActor.insert(tabs).values(tabValues).returning();

    if (result && result.length > 0) {
      if (customMapSensorData !== undefined) {
        await dbActor.insert(customMapSensorDataTable).values(
          customMapSensorData.map((sensor) => ({
            tabId: result[0].id,
            entityId: sensor.entityId,
            attribute: sensor.attribute,
            positionX: sensor.positionX,
            positionY: sensor.positionY,
          })),
        );
      }

      if (valuesToImages !== undefined) {
        await dbActor.insert(tabValuesToImageTable).values(
          valuesToImages.map((vti) => ({
            tabId: result[0].id,
            imageId: vti.imageId,
            min: vti.min,
            max: vti.max,
          })),
        );
      }

      return this.getById(result[0].id);
    }

    return result.length > 0 ? result[0] : null;
  }

  async update(
    id: string,
    values: Partial<EnrichedTab>,
    transaction?: DbType,
  ): Promise<EnrichedTab> {
    const { customMapSensorData, valuesToImages, ...tabValues } = values;
    const dbActor = transaction === undefined ? this.db : transaction;
    const result = await dbActor
      .update(tabs)
      .set(tabValues)
      .where(eq(tabs.id, id))
      .returning();

    if (result && result.length > 0) {
      if (customMapSensorData && customMapSensorData.length > 0) {
        await dbActor
          .delete(customMapSensorDataTable)
          .where(eq(customMapSensorDataTable.tabId, id));

        await dbActor.insert(customMapSensorDataTable).values(
          customMapSensorData.map((sensor) => ({
            tabId: id,
            entityId: sensor.entityId,
            attribute: sensor.attribute,
            positionX: sensor.positionX,
            positionY: sensor.positionY,
          })),
        );
      } else {
        const customSensors = await dbActor
          .select()
          .from(customMapSensorDataTable)
          .where(eq(customMapSensorDataTable.tabId, id));

        if (customSensors.length > 0) {
          await dbActor
            .delete(customMapSensorDataTable)
            .where(eq(customMapSensorDataTable.tabId, id));
        }
      }

      if (valuesToImages && valuesToImages.length > 0) {
        await dbActor
          .delete(tabValuesToImageTable)
          .where(eq(tabValuesToImageTable.tabId, id));

        await dbActor.insert(tabValuesToImageTable).values(
          valuesToImages.map((vti) => ({
            tabId: result[0].id,
            imageId: vti.imageId,
            min: vti.min,
            max: vti.max,
          })),
        );
      }
      return this.getById(result[0].id);
    }

    return result.length > 0 ? result[0] : null;
  }

  async delete(id: string, transaction?: DbType): Promise<Tab> {
    const dbActor = transaction === undefined ? this.db : transaction;

    const result = await dbActor
      .delete(tabs)
      .where(eq(tabs.id, id))
      .returning();

    return result.length > 0 ? result[0] : null;
  }
}
