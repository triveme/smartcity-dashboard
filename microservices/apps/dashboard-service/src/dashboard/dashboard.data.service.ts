import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { widgets } from '@app/postgres-db/schemas';
import { Parser } from '@json2csv/plainjs';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
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
      const dashboardPanels =
        await this.panelRepo.getPanelsByDashboardId(dashboardId);

      const allCsvData: string[] = [];

      for (const dashboardPanel of dashboardPanels) {
        const panelToWidgets = await this.widgetsToPanelRepo.getByPanelId(
          dashboardPanel.id,
        );

        const widgetIds = new Set(
          panelToWidgets.map((panelToWidget) => panelToWidget.widgetId),
        );
        const allWidgets = await Promise.all(
          Array.from(widgetIds).map(async (id) => {
            const widget = await this.db
              .select()
              .from(widgets)
              .where(eq(widgets.id, id));
            return widget[0];
          }),
        );

        for (const panelWidget of allWidgets) {
          const queryWithAllInfos =
            await this.ngsiQueryService.getQueryWithAllInfosByWidgetId(
              panelWidget.id,
            );

          if (!queryWithAllInfos) {
            throw new HttpException(
              `No query information found for widget with id: ${panelWidget.id}`,
              HttpStatus.BAD_REQUEST,
            );
          }

          const queryBatch = {
            queryIds: [queryWithAllInfos.query.id],
            query_config: queryWithAllInfos.query_config,
            data_source: queryWithAllInfos.data_source,
            auth_data: queryWithAllInfos.auth_data,
          };
          queryBatch.query_config.aggrMode = 'none';
          queryBatch.query_config.timeframe = 'year';

          const rawData =
            await this.ngsiDataService.getDataFromDataSource(queryBatch);

          // Handle undefined rawData
          if (!rawData || (Array.isArray(rawData) && rawData.length === 0)) {
            throw new HttpException(
              `No valid data returned from data source for widget with id: ${panelWidget.id}`,
              HttpStatus.BAD_REQUEST,
            );
          }

          const rawDataArray = Array.isArray(rawData) ? rawData : [rawData];
          const flattenedData = rawDataArray.flatMap((dataItem) => {
            const attributes = dataItem.attributes || [];
            const indices = dataItem.index || [];

            return attributes.flatMap((attr) => {
              return attr.values.map((value, i) => ({
                entityId: dataItem.entityId,
                attrName: attr.attrName,
                value: value,
                index: indices[i],
              }));
            });
          });

          // Convert to CSV
          const opts = { fields: ['entityId', 'attrName', 'value', 'index'] };
          const parser = new Parser(opts);
          const csv = parser.parse(flattenedData);
          allCsvData.push(csv);
        }
      }

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
