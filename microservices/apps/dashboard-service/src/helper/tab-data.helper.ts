import { DbType } from '@app/postgres-db';
import { FlatDashboardData } from '../dashboard/dashboard.model';
import { customMapSensorDataTable } from '@app/postgres-db/schemas/custom-map-sensor-data.schema';
import { tabMultiAttributeConfigsTable } from '@app/postgres-db/schemas/dashboard.tab.multi_attribute_configs.schema';
import { inArray } from 'drizzle-orm';
import { tabValuesToImageTable } from '@app/postgres-db/schemas/dashboard.tab.values_to_image.schema';

export class TabDataHelper {
  static async enrichDashboardData(
    db: DbType,
    dashboardContent: FlatDashboardData[],
  ): Promise<FlatDashboardData[]> {
    const tabIds = dashboardContent
      .map((row) => row.tab?.id)
      .filter((id): id is string => !!id);

    if (tabIds.length === 0) {
      return dashboardContent;
    }

    // Fetch custom map sensor data for all tabs in one query
    const sensorDataRows = await db
      .select()
      .from(customMapSensorDataTable)
      .where(inArray(customMapSensorDataTable.tabId, tabIds));

    // Fetch multi-attribute configs for all tabs in one query
    const multiCfgRows = await db
      .select()
      .from(tabMultiAttributeConfigsTable)
      .where(inArray(tabMultiAttributeConfigsTable.tabId, tabIds));

    const valueToImageRows = await db
      .select()
      .from(tabValuesToImageTable)
      .where(inArray(tabValuesToImageTable.tabId, tabIds));

    const sensorDataMap = sensorDataRows.reduce(
      (acc, sensor) => {
        acc[sensor.tabId] = acc[sensor.tabId] || [];
        acc[sensor.tabId].push(sensor);
        return acc;
      },
      {} as Record<
        string,
        {
          id: string;
          tabId: string;
          entityId: string;
          attribute: string;
          positionX: number;
          positionY: number;
        }[]
      >,
    );

    const multiCfgMap = multiCfgRows.reduce(
      (acc, cfg) => {
        acc[cfg.tabId] = acc[cfg.tabId] || [];
        acc[cfg.tabId].push(cfg);
        return acc;
      },
      {} as Record<
        string,
        {
          id: string;
          tabId: string;
          attribute: string;
          errorColor: string;
          defaultRange: string;
          defaultColor: string;
          warnRange: string | null;
          warnColor: string | null;
        }[]
      >,
    );

    const valueToImagesMap = valueToImageRows.reduce(
      (acc, vti) => {
        acc[vti.tabId] = acc[vti.tabId] || [];
        acc[vti.tabId].push(vti);
        return acc;
      },
      {} as Record<
        string,
        {
          id: string;
          tabId: string;
          imageId: string;
          min: string;
          max: string;
        }[]
      >,
    );

    const enrichedRows: FlatDashboardData[] = dashboardContent.map((row) => {
      if (row.tab && row.tab.id) {
        return {
          ...row,
          tab: {
            ...row.tab,
            customMapSensorData: sensorDataMap[row.tab.id] || [],
            multiAttributeConfigs: multiCfgMap[row.tab.id] || [],
            valuesToImages: valueToImagesMap[row.tab.id] || [],
          },
        } as FlatDashboardData;
      }

      return row;
    });

    return enrichedRows;
  }
}
