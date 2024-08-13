import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { Widget, widgets } from '@app/postgres-db/schemas';
import { Parser } from '@json2csv/plainjs';
import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DataService as NgsiDataService } from '../../../ngsi-service/src/data/data.service';
import { QueryService as NgsiQueryService } from '../../../ngsi-service/src/query/query.service';
import { WidgetToPanelRepo } from '../widget-to-panel/widget-to-panel.repo';
import { PanelRepo } from '../panel/panel.repo';

@Injectable()
export class DashboardDataService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly widgetsToPanelRepo: WidgetToPanelRepo,
    private readonly ngsiDataService: NgsiDataService,
    private readonly ngsiQueryService: NgsiQueryService,
    private readonly panelRepo: PanelRepo,
  ) {}

  async downloadDashboardData(dashboardId: string): Promise<string> {
    try {
      // Define expected format types for incoming query-data
      type Attribute = {
        type: string;
        value: unknown;
        metadata: Record<string, unknown>;
      };

      type DataFormat = {
        id: string;
        type: string;
        [key: string]: Attribute | string | object;
      };

      const dashboardPanels =
        await this.panelRepo.getPanelsByDashboardId(dashboardId);

      // Array to hold CSV data for all panels and widgets
      const allCsvData: string[] = [];

      for (const dashboardPanel of dashboardPanels) {
        const panelToWidgets = await this.widgetsToPanelRepo.getByPanelId(
          dashboardPanel.id,
        );

        // Getting all widgets linked to the panel
        const allWidgets: Widget[] = [];
        for (const panelToWidget of panelToWidgets) {
          const widget = await this.db
            .select()
            .from(widgets)
            .where(eq(widgets.id, panelToWidget.widgetId));
          allWidgets.push(widget[0]);
        }

        for (const panelWidget of allWidgets) {
          // Get all query info of specified widgets
          const queryWithAllInfos =
            await this.ngsiQueryService.getQueryWithAllInfosByWidgetId(
              panelWidget.id,
            );

          if (!queryWithAllInfos) {
            throw new Error(
              `No query information found for widget with id: ${panelWidget.id}`,
            );
          }

          // Set the aggregation method to 'none'
          queryWithAllInfos.query_config.aggrMode = 'none';

          // Create a queryBatch object
          const queryBatch = {
            queryIds: [queryWithAllInfos.query.id],
            query_config: queryWithAllInfos.query_config,
            data_source: queryWithAllInfos.data_source,
            auth_data: queryWithAllInfos.auth_data,
          };

          // Fetch data from data source
          const rawData =
            await this.ngsiDataService.getDataFromDataSource(queryBatch);

          // Handle undefined rawData
          if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
            throw new Error(
              `No valid data returned from data source for widget with id: ${panelWidget.id}`,
            );
          }

          const dataObject = rawData[0]; // Assuming there is exactly one object in the array

          // Check if dataObject is in the expected format
          const isDataInExpectedFormat = (
            data: unknown,
          ): data is DataFormat => {
            return (
              typeof data === 'object' &&
              data !== null &&
              'id' in data &&
              'type' in data
            );
          };

          // Ensure dataObject is in the correct format
          if (!isDataInExpectedFormat(dataObject)) {
            throw new Error(
              'Data format is unexpected; Expected an object with id and type',
            );
          }

          // Flatten the NGSI data format
          const flattenedData = [
            {
              id: dataObject.id,
              type: dataObject.type,
              ...Object.keys(dataObject).reduce(
                (acc, key) => {
                  if (
                    key !== 'id' &&
                    key !== 'type' &&
                    (dataObject[key] as Attribute)?.value !== undefined
                  ) {
                    if (key === 'location') {
                      acc[key] = JSON.stringify(
                        (dataObject[key] as Attribute).value,
                      );
                    } else {
                      acc[key] = (
                        dataObject[key] as Attribute
                      ).value.toString();
                    }
                  }
                  return acc;
                },
                {} as Record<string, string | object>,
              ),
            },
          ];

          // Initializing json2csv parser
          const opts = {};
          const parser = new Parser(opts);
          // Convert the data from JSON to CSV format
          const csv = parser.parse(flattenedData);

          // Collect the CSV data
          allCsvData.push(csv);
        }
      }

      // Join all CSV data with a newline
      return allCsvData.join('\n');
    } catch (error) {
      console.error(
        'Error downloading data for dashboard with id:',
        dashboardId,
        '\ndue to error: ',
        error,
      );
      throw error;
    }
  }
}
