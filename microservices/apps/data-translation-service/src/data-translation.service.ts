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
import { PopulateListviewService } from './populate/populate-listview';

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
    tab.componentType === 'Werte zu Bildern' ||
    tab.componentType === 'Sensorstatus' ||
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
  values: [string, number, string?][];
  color?: string;
  id?: string;
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

export type InterestingPlace = {
  id: string;
  name: string;
  types: string[];
  address: string;
  image: string;
  imagePreview: string;
  creator: string;
  location: {
    type: string;
    coordinates: number[];
  };
  info: string;
  zoomprio: string;
  contactName?: string;
  contactPhone?: string;
  participants?: string;
  supporter?: string;
  email?: string;
  website?: string;
  description?: string;
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
} & {
  listviewData: InterestingPlace[];
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
    listviewData: [],
    // Initialize properties that might be null from database
    chartValues: tab.chartValues || [],
    textValue: tab.textValue || '',
    imageSrc: tab.imageSrc || '',
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
    private readonly populateListviewService: PopulateListviewService,
  ) {}

  async refreshTabData(): Promise<void> {
    try {
      console.log('Refreshing tab data...');
      const data = await this.dataTranslationRepo.getAllTabs();
      const tabPromises = data.map(async (tab) => {
        try {
          // Skip tabs that don't have a valid widget ID
          // console.log(`Refresh Tab ${tab.id} with widget ${tab.widgetId}`);
          if (!tab.widgetId) {
            console.warn(`Tab ${tab.id} has no widget ID. Skipping.`);
            return;
          }

          // Check if widget exists before processing
          const widget = await this.dataTranslationRepo.getWidgetById(
            tab.widgetId,
          );
          if (!widget) {
            console.warn(
              `Widget ${tab.widgetId} for tab ${tab.id} does not exist. Skipping.`,
            );
            return;
          }

          const tabWithContent = wrapTabWithDefaultData(tab);
          if (isSingleValueTab(tab)) {
            await this.populateValueService.populateTab(tabWithContent);
          } else if (isCombinedWidgetTab(tab)) {
            await this.populateCombinedWidgetService.populateTab(
              tabWithContent,
            );
          } else if (tab.componentType === 'Listview') {
            await this.populateListviewService.populateListview(tabWithContent);
          } else if (
            tab.componentType === 'Diagramm' ||
            tab.componentType === 'Karte' ||
            (tab.componentType === 'Slider' &&
              tab.componentSubType === 'Slider Übersicht') ||
            tab.componentType === 'Interaktive Komponente'
          ) {
            await this.populateChartService.populateTab(tabWithContent);
          }

          if (
            tabWithContent.chartData.length > 0 ||
            tabWithContent.weatherWarnings.length > 0 ||
            tabWithContent.mapObject.length > 0 ||
            tabWithContent.listviewData.length > 0 ||
            tabWithContent.combinedWidgets.length > 0 ||
            (tabWithContent.chartValues &&
              tabWithContent.chartValues.length > 0) ||
            (tabWithContent.textValue && tabWithContent.textValue !== '')
          ) {
            // Get existing data to preserve fields that weren't populated this time
            const existingData = await this.dataTranslationRepo.getWidgetData(
              tab.widgetId,
            );

            this.dataTranslationRepo.setWidgetData(tab.widgetId, {
              chartData:
                tabWithContent.chartData.length > 0
                  ? tabWithContent.chartData
                  : existingData?.chartData || [],
              combinedWidgets:
                tabWithContent.combinedWidgets ||
                existingData?.combinedWidgets ||
                [],
              weatherWarnings:
                tabWithContent.weatherWarnings.length > 0
                  ? tabWithContent.weatherWarnings
                  : existingData?.weatherWarnings || [],
              mapObject:
                tabWithContent.mapObject.length > 0
                  ? tabWithContent.mapObject
                  : existingData?.mapObject || [],
              chartValues:
                tabWithContent.chartValues &&
                tabWithContent.chartValues.length > 0
                  ? tabWithContent.chartValues
                  : existingData?.chartValues || [],
              textValue:
                tabWithContent.textValue && tabWithContent.textValue !== ''
                  ? tabWithContent.textValue
                  : existingData?.textValue || '',
              listviewData:
                tabWithContent.listviewData.length > 0
                  ? tabWithContent.listviewData
                  : existingData?.listviewData || [],
            });
          }
        } catch (error) {
          console.error('Error while refreshing tab data:', error);
          console.error(
            'TAB: ',
            tab.id,
            tab.componentType,
            tab.componentSubType,
          );
        }
      });

      await Promise.all(tabPromises);
    } catch (error) {
      console.error('Critical error in refreshTabData:', error);
      // Service continues to run, just logs the error
    }
  }
}
