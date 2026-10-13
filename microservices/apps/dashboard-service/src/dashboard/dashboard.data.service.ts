import { DbType, POSTGRES_DB } from '@app/postgres-db';
import { widgets } from '@app/postgres-db/schemas';
import { Parser } from '@json2csv/plainjs';
import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { WidgetToPanelRepo } from '../widget-to-panel/widget-to-panel.repo';
import { PanelRepo } from '../panel/panel.repo';
import { TabService } from '../tab/tab.service';
import { flattenNgsiExportData } from '../util/ngsi-export.util';
import { CurrentAreaConfig } from '../widget/widget.model';
import { CsvDataService } from '../csv-data/csv-data.service';
import { PlatformQueryResolverService } from '../platform-internal/platform-query-resolver.service';

@Injectable()
export class DashboardDataService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly widgetsToPanelRepo: WidgetToPanelRepo,
    private readonly panelRepo: PanelRepo,
    private readonly tabService: TabService,
    private readonly csvDataService: CsvDataService,
    private readonly platformQueryResolver: PlatformQueryResolverService,
  ) {}

  async downloadDashboardData(
    dashboardId: string,
    ids: string[],
    currentAreaConfig: CurrentAreaConfig | CurrentAreaConfig[],
  ): Promise<string> {
    const allCsvData: string[] = [];

    try {
      const widgetIds = new Set(ids.map((id) => id));

      const allWidgets = await Promise.all(
        Array.from(widgetIds).map(async (id) => {
          const widget = await this.db
            .select()
            .from(widgets)
            .where(eq(widgets.id, id));

          return widget[0];
        }),
      );

      // Expand combined widgets by replacing them with their child widgets
      const expandedWidgets = [];
      for (const panelWidget of allWidgets) {
        const widgetTabs = await this.tabService.getTabsByWidgetId(
          panelWidget.id,
        );

        if (widgetTabs.length > 0) {
          const combinedTab = widgetTabs[0];
          if (
            combinedTab.componentType === 'Kombinierte Komponente' ||
            combinedTab.componentSubType === 'Kombinierte Karte'
          ) {
            if (
              combinedTab.childWidgets &&
              Array.isArray(combinedTab.childWidgets) &&
              combinedTab.childWidgets.length > 0
            ) {
              const childWidgets = await Promise.all(
                combinedTab.childWidgets.map(async (childWidgetId) => {
                  const childWidget = await this.db
                    .select()
                    .from(widgets)
                    .where(eq(widgets.id, childWidgetId));
                  return childWidget[0];
                }),
              );

              childWidgets.forEach((childWidget) => {
                if (childWidget) {
                  expandedWidgets.push(childWidget);
                }
              });
            }
          } else {
            expandedWidgets.push(panelWidget);
          }
        } else {
          expandedWidgets.push(panelWidget);
        }
      }

      const currAreaConfing = Array.isArray(currentAreaConfig)
        ? currentAreaConfig
        : [currentAreaConfig];

      for (const panelWidget of expandedWidgets) {
        try {
          const filterConfig = currAreaConfing.filter(
            (item) => item.id === panelWidget.id,
          )[0];

          const queryWithAllInfos =
            await this.platformQueryResolver.getByWidgetId(panelWidget.id);

          if (!queryWithAllInfos) {
            const warning = `No query information found for widget with id: ${panelWidget.id}`;
            console.warn(warning);
            throw new NotFoundException('Widget query not found');
          }

          const queryBatch = {
            queryIds: [queryWithAllInfos.query.id],
            query_config: { ...queryWithAllInfos.query_config },
            data_source: queryWithAllInfos.data_source,
            auth_data: queryWithAllInfos.auth_data,
          };
          if (
            queryBatch.auth_data.type === 'ngsi' ||
            queryBatch.auth_data.type === 'ngsi-ld' ||
            queryBatch.auth_data.type === 'ngsi-v2'
          ) {
            if (!queryBatch.query_config.aggrMode) {
              queryBatch.query_config.aggrMode = 'none';
            }

            if (filterConfig?.downloadCurrentArea === true) {
              const from = new Date(filterConfig.minRange);
              const to = new Date(filterConfig.maxRange);
              if (
                !Number.isFinite(from.getTime()) ||
                !Number.isFinite(to.getTime()) ||
                from > to
              ) {
                throw new BadRequestException('Visible range is invalid');
              }
              queryBatch.query_config.timeframe = 'user_defined';
              queryBatch.query_config.dataStartDate = from;
              queryBatch.query_config.dataUntilDate = to;
            } else if (filterConfig?.changeTimeFramePeriod === true) {
              queryBatch.query_config.timeframe = filterConfig.timeFramePeriod;
            } else {
              if (!queryBatch.query_config.timeframe) {
                queryBatch.query_config.timeframe = 'month';
              }
            }
          }

          const rawData = await this.csvDataService.getData(queryBatch);

          // Ensure rawData is an array
          const rawDataArray = Array.isArray(rawData) ? rawData : [rawData];
          const flattenedData =
            queryBatch.auth_data.type === 'internal'
              ? rawDataArray.flatMap((dataItem) => {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const allValues = dataItem.Values.map((v) => ({
                    ...v.Meta,
                    ...v.Time,
                    Value: v.Value,
                  }));

                  return allValues;
                })
              : queryBatch.auth_data.type === 'ngsi' ||
                  queryBatch.auth_data.type === 'ngsi-ld' ||
                  queryBatch.auth_data.type === 'ngsi-v2'
                ? flattenNgsiExportData(rawDataArray, [
                    ...(queryBatch.query_config.attributes || []),
                  ])
                : [];

          if (flattenedData.length === 0) {
            const warning = `No data found for widget with id: ${panelWidget.id}`;
            console.warn(warning);
            allCsvData.push(
              queryBatch.auth_data.type === 'internal'
                ? '"Quartal","Geschlecht","Altersklasse","Jahr","Value"'
                : '"entityId","attrName","value","index"',
            );
          } else {
            let opts;

            if (
              queryBatch.auth_data.type === 'ngsi' ||
              queryBatch.auth_data.type === 'ngsi-ld' ||
              queryBatch.auth_data.type === 'ngsi-v2'
            ) {
              opts = {
                fields: ['entityId', 'attrName', 'value', 'index'],
              };
            } else if (queryBatch.auth_data.type === 'internal') {
              opts = {
                fields: [
                  'Quartal',
                  'Geschlecht',
                  'Altersklasse',
                  'Jahr',
                  'Value',
                ],
              };
            }

            const parser = new Parser(opts);

            const csv = parser.parse(flattenedData);
            allCsvData.push(csv);
          }
        } catch (widgetError) {
          if (widgetError instanceof HttpException) throw widgetError;
          const warning = `Error processing widget with id: ${panelWidget.id} - ${widgetError.message}`;
          console.warn(warning);
          throw new InternalServerErrorException('CSV export failed');
        }
      }

      const resultCsv = allCsvData.join('\n');
      return resultCsv;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      console.error(
        'Error downloading data for dashboard with id:',
        dashboardId,
        '\ndue to error: ',
        error,
      );

      throw new InternalServerErrorException('CSV export failed');
    }
  }
}
