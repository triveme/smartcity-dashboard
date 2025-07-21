import { POSTGRES_DB, DbType } from '@app/postgres-db';
import { Inject, Injectable } from '@nestjs/common';
import {
  Dashboard,
  Panel,
  Tab,
  Widget,
  WidgetData,
} from '@app/postgres-db/schemas';
import { DataModel } from '@app/postgres-db/schemas/data-model.schema';
import { PopulateValueService } from './populate/populate-value.service';
import { PopulateChartService } from './populate/populate-chart.service';
import { PopulateCombinedWidgetService } from './populate/populate-combined-widget.service';
import { Query } from '@app/postgres-db/schemas/query.schema';
import { DataTranslationRepo } from './data-translation.repo';
import { WidgetToPanel } from '@app/postgres-db/schemas/dashboard.widget-to-panel.schema';

export type QueryDataWidthWidgetId = {
  widgetId: string;
  queryData: unknown;
};

export function isCombinedWidgetTab(tab: Tab): boolean {
  return (
    tab.componentType === 'Kombinierte Komponente' ||
    tab.componentSubType === 'Kombinierte Karte'
  );
}

export function isSingleValueTab(tab: Tab): boolean {
  return (
    tab.componentType === 'Wert' ||
    tab.componentType === 'Bild' ||
    tab.componentType === 'Wetterwarnungen' ||
    (tab.componentType === 'Slider' &&
      tab.componentSubType === 'Farbiger Slider') ||
    (tab.componentType === 'Diagramm' &&
      (tab.componentSubType === '180° Chart' ||
        tab.componentSubType === '360° Chart' ||
        tab.componentSubType === 'Stageable Chart'))
  );
}

export type ChartData = {
  name: string;
  values: [string, number][];
  color?: string;
};

export type WeatherWarningData = {
  category: string;
  subCategory: string;
  severity: number;
  instructions: string;
  alertDescription: string;
  validFrom: string;
  validTo: string;
};

type Coordinate = [number, number];

export type Position = {
  type: string;
  coordinates: Coordinate;
};

export type MapObject = {
  entityId: string;
  position: Position;
  queryId: string;
  queryConfigId: string;
};
export type TabWithContent = Tab & { query?: Query } & {
  dataModel: DataModel;
} & { chartData: ChartData[] } & { combinedWidgets: WidgetWithContent[] } & {
  weatherWarnings: WeatherWarningData[];
} & {
  mapObject: MapObject[];
};
export type WidgetWithContent = Widget & { tabs: TabWithContent[] };
export type PanelWithContent = Panel & { widgets: WidgetWithContent[] };
export type DashboardWithContent = Dashboard & { panels: PanelWithContent[] };

export type FlatDashboardData = {
  dashboard: Dashboard;
  panel: Panel;
  widget_to_panel: WidgetToPanel;
  widget: Widget;
  widget_data?: WidgetData | null;
  tab: Tab;
  data_model: DataModel;
  query: Query;
};

const wrapTabWithDefaultData = (tab: Tab): TabWithContent => {
  return {
    ...tab,
    query: undefined,
    dataModel: {
      id: '',
      model: undefined,
    },
    chartData: [],
    combinedWidgets: [],
    weatherWarnings: [],
    mapObject: [],
  };
};

@Injectable()
export class DataTranslationService {
  constructor(
    @Inject(POSTGRES_DB) private readonly db: DbType,
    private readonly populateValueService: PopulateValueService,
    private readonly populateChartService: PopulateChartService,
    private readonly populateCombinedWidgetService: PopulateCombinedWidgetService,
    private readonly dataTranslationRepo: DataTranslationRepo,
  ) {}

  async refreshTabData(): Promise<void> {
    console.log('Refreshing tab data...');
    const data = await this.dataTranslationRepo.getAllTabs();
    const tabPromises = data.map(async (tab) => {
      try {
        const tabWithContent = wrapTabWithDefaultData(tab);

        if (isSingleValueTab(tab)) {
          await this.populateValueService.populateTab(tabWithContent);
        } else if (isCombinedWidgetTab(tab)) {
          await this.populateCombinedWidgetService.populateTab(tabWithContent);
        } else if (
          tab.componentType === 'Diagramm' ||
          tab.componentType === 'Karte'
        ) {
          await this.populateChartService.populateTab(tabWithContent);
        }

        this.dataTranslationRepo.setWidgetData(tab.widgetId, {
          chartData: tabWithContent.chartData,
          combinedWidgets: tabWithContent.combinedWidgets,
          weatherWarnings: tabWithContent.weatherWarnings,
          mapObject: tabWithContent.mapObject,
          chartValues: tabWithContent.chartValues,
          textValue: tabWithContent.textValue,
        });
      } catch (error) {
        console.error('Error while refreshing tab data:', error);
        console.error('TAB: ', tab.id, tab.componentType, tab.componentSubType);
        this.dataTranslationRepo.setWidgetData(tab.widgetId, null);
      }
    });

    await Promise.all(tabPromises);
  }
}
