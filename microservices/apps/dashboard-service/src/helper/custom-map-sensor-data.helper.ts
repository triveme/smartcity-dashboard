import { DbType } from '@app/postgres-db';
import { FlatDashboardData } from '../dashboard/dashboard.model';
import { customMapSensorDataTable } from '@app/postgres-db/schemas/custom-map-sensor-data.schema';
import { inArray } from 'drizzle-orm';

export class CustomMapSensorDataHelper {
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

    const sensorDataRows = await db
      .select()
      .from(customMapSensorDataTable)
      .where(inArray(customMapSensorDataTable.tabId, tabIds));

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

    const enrichedRows: FlatDashboardData[] = dashboardContent.map((row) => {
      if (row.tab && row.tab.id) {
        return {
          ...row,
          tab: {
            ...row.tab,
            customMapSensorData: sensorDataMap[row.tab.id] || [],
          },
        } as FlatDashboardData;
      }

      return row;
    });

    return enrichedRows;
  }
}
