/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import {
  ChartData,
  MapObject,
  WeatherWarningData,
  WidgetWithContent,
} from '../dashboard.service';
import { Tab } from '@app/postgres-db/schemas';
import { Query } from '@app/postgres-db/schemas/query.schema';
import { DataModel } from '@app/postgres-db/schemas/data-model.schema';
import { WidgetRepo } from '../../widget/widget.repo';
import {
  isCombinedWidgetTab,
  isSingleValueTab,
  reduceWidget,
} from './populate.util';
import { PopulateValueService } from './populate-value.service';
import { PopulateChartService } from './populate-chart.service';

@Injectable()
export class PopulateCombinedWidgetService {
  constructor(
    private readonly widgetRepo: WidgetRepo,
    private readonly populateValueService: PopulateValueService,
    private readonly populateChartService: PopulateChartService,
  ) {}

  async populateTab(
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
    } & {
      mapObject: MapObject[];
    } & { combinedWidgets: WidgetWithContent[] },
  ): Promise<void> {
    tab.combinedWidgets = [];

    if (Array.isArray(tab.childWidgets)) {
      for (const childWidgetId of tab.childWidgets) {
        const tabMap = new Map<string, Tab>();
        const dataModelMap = new Map<string, DataModel>();
        const queryMap = new Map<string, Query>();
        const widget = await this.widgetRepo.getById(childWidgetId);

        const flatWidget = await this.widgetRepo.getWidgetWithContent(
          widget.id,
        );

        flatWidget.forEach((row) => {
          if (row.tab) {
            tabMap.set(row.tab.id, row.tab);
          }
          if (row.data_model) {
            dataModelMap.set(row.data_model.id, row.data_model);
          }
          if (row.query) {
            queryMap.set(row.query.id, row.query);
          }
        });

        const widgetWithContent = reduceWidget(
          { ...widget, tabs: [] },
          tabMap,
          dataModelMap,
          queryMap,
        );

        for (const tab of widgetWithContent.tabs) {
          await this.populateTabWithContents(tab);
        }

        tab.combinedWidgets.push(widgetWithContent);
      }
    }
  }

  private async populateTabWithContents(
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
    } & { mapObject: MapObject[] } & {
      weatherWarnings: WeatherWarningData[];
    } & { combinedWidgets: WidgetWithContent[] },
  ): Promise<void> {
    if (
      tab.componentType !== 'Informationen' &&
      tab.componentType !== 'Bild' &&
      tab.componentType !== 'iFrame'
    ) {
      if (isSingleValueTab(tab)) {
        await this.populateValueService.populateTab(tab);
      } else if (isCombinedWidgetTab(tab)) {
        await this.populateTab(tab);
      } else {
        await this.populateChartService.populateTab(tab);
      }
    }
  }
}
