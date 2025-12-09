/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import {
  ChartData,
  MapObject,
  WeatherWarningData,
  WidgetWithContent,
} from '../data-translation.service';
import { Tab } from '@app/postgres-db/schemas';
import { Query } from '@app/postgres-db/schemas/query.schema';
import { DataModel } from '@app/postgres-db/schemas/data-model.schema';
import {
  isCombinedWidgetTab,
  isSingleValueTab,
  reduceWidget,
} from './populate.util';
import { PopulateChartService } from './populate-chart.service';
import { DataTranslationRepo } from '../data-translation.repo';
import { PopulateValueService } from './populate-value.service';

@Injectable()
export class PopulateCombinedWidgetService {
  constructor(
    private readonly dataTranslationRepo: DataTranslationRepo,
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

    if (!Array.isArray(tab.childWidgets) || tab.childWidgets.length === 0) {
      console.warn(`Tab ${tab.id} has no valid childWidgets array`);
      return;
    }

    for (const childWidget of tab.childWidgets) {
      try {
        if (!childWidget) {
          console.warn(
            `Skipping invalid child widget in tab ${tab.id} ${tab.widgetId})`,
          );
          continue;
        }

        const widget =
          await this.dataTranslationRepo.getWidgetById(childWidget);

        if (!widget) {
          console.warn(
            `Widget with ID ${childWidget} not found for tab ${tab.id}`,
          );
          continue;
        }

        const flatWidget =
          await this.dataTranslationRepo.getWidgetWithContentById(widget.id);

        if (!flatWidget || flatWidget.length === 0) {
          console.warn(`No content found for widget ${widget.id}`);
          continue;
        }

        const tabMap = new Map<string, Tab>();
        const dataModelMap = new Map<string, DataModel>();
        const queryMap = new Map<string, Query>();

        flatWidget.forEach((row) => {
          if (row?.tab) {
            tabMap.set(row.tab.id, row.tab);
          }
          if (row?.data_model) {
            dataModelMap.set(row.data_model.id, row.data_model);
          }
          if (row?.query) {
            queryMap.set(row.query.id, row.query);
          }
        });

        const widgetWithContent = reduceWidget(
          { ...widget, tabs: [] },
          tabMap,
          dataModelMap,
          queryMap,
        );

        if (Array.isArray(widgetWithContent.tabs)) {
          for (const childTab of widgetWithContent.tabs) {
            if (childTab) {
              await this.populateTabWithContents(childTab);

              if (!widgetWithContent.widgetData) {
                widgetWithContent.widgetData = {
                  id: widget.id,
                  data: {},
                  widgetId: widget.id,
                };
              }

              if (childTab.chartData) {
                if (!widgetWithContent.widgetData.data)
                  widgetWithContent.widgetData.data = {};
                widgetWithContent.widgetData.data = {
                  chartData: childTab.chartData,
                };
              }
              if (childTab.mapObject) {
                if (!widgetWithContent.widgetData.data)
                  widgetWithContent.widgetData.data = {};
                widgetWithContent.widgetData.data = {
                  mapObject: childTab.mapObject,
                };
              }
              if (childTab.weatherWarnings) {
                if (!widgetWithContent.widgetData.data)
                  widgetWithContent.widgetData.data = {};
                widgetWithContent.widgetData.data = {
                  weatherWarnings: childTab.weatherWarnings,
                };
              }
              if (childTab.combinedWidgets) {
                if (!widgetWithContent.widgetData.data)
                  widgetWithContent.widgetData.data = {};
                widgetWithContent.widgetData.data = {
                  combinedWidgets: childTab.combinedWidgets,
                };
              }
            }
          }
        }

        tab.combinedWidgets.push(widgetWithContent);
      } catch (error) {
        console.error(`Error processing child widget in tab ${tab.id}:`, error);
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
