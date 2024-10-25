import {
  ChartData,
  DashboardWithContent,
  MapObject,
  PanelWithContent,
  TabWithContent,
  WidgetWithContent,
} from '../dashboard.service';
import { Panel, Tab, Widget } from '@app/postgres-db/schemas';
import { DataModel } from '@app/postgres-db/schemas/data-model.schema';
import { Query } from '@app/postgres-db/schemas/query.schema';
import { WidgetToPanel } from '@app/postgres-db/schemas/dashboard.widget-to-panel.schema';

export function reduceDashboard(
  currentDashboard: DashboardWithContent,
  panelMap: Map<string, Panel>,
  widgetToPanelMap: Map<string, WidgetToPanel>,
  widgetMap: Map<string, Widget>,
  tabMap: Map<string, Tab>,
  dataModelMap: Map<string, DataModel>,
  queryMap: Map<string, Query>,
): DashboardWithContent {
  // Filter panels related to the current dashboard from the panelMap and store in an array
  const currentPanels = Array.from(panelMap.values()).filter(
    (panel) => panel.dashboardId === currentDashboard.id,
  );

  // Setting the panels of the current dashboard and operating on each one - reducing their data
  currentDashboard.panels = currentPanels.map((panel) => {
    // Passing a spreaded panel object & explicitly setting it's widgets to an empty array
    return reducePanel(
      { ...panel, widgets: [] },
      widgetToPanelMap,
      widgetMap,
      tabMap,
      dataModelMap,
      queryMap,
    );
  });

  return currentDashboard;
}

export function reducePanel(
  currentPanel: PanelWithContent,
  widgetToPanelMap: Map<string, WidgetToPanel>,
  widgetMap: Map<string, Widget>,
  tabMap: Map<string, Tab>,
  dataModelMap: Map<string, DataModel>,
  queryMap: Map<string, Query>,
): PanelWithContent {
  // Filter the widgetToPanelMap with ids that match the currentPanel id and store in an array.
  const currentWidgetToPanels = Array.from(widgetToPanelMap.values()).filter(
    (widgetToPanel) => widgetToPanel.panelId === currentPanel.id,
  );

  // Getting all widgets in the widgetMap by the widget IDs stored in the currentWidgetToPanels array
  const currentWidgets = currentWidgetToPanels.map((widgetToPanel) =>
    widgetMap.get(widgetToPanel.widgetId),
  );

  // Setting the widgets of the current panel and operating on each one - reducing their data
  currentPanel.widgets = currentWidgets.map((widget) => {
    // Passing a spreaded widget object & explicitly setting it's tabs to an empty array
    return reduceWidget(
      { ...widget, tabs: [] },
      tabMap,
      dataModelMap,
      queryMap,
    );
  });

  return currentPanel;
}

export function reduceWidget(
  currentWidget: WidgetWithContent,
  tabMap: Map<string, Tab>,
  dataModelMap: Map<string, DataModel>,
  queryMap: Map<string, Query>,
): WidgetWithContent {
  // Filter tabs related to the current widget from the tabMap and store in an array
  const currentTabs = Array.from(tabMap.values()).filter(
    (tab) => tab.widgetId === currentWidget.id,
  );

  // Setting the tabs of the current widget and operating on each one - reducing their data
  currentWidget.tabs = currentTabs.map((tab) => {
    // Passing a spreaded tab object & explicitly setting its query to null
    return reduceTab(
      {
        ...tab,
        query: null,
        dataModel: null,
        chartData: null,
        mapObject: null,
        combinedWidgets: null,
      },
      dataModelMap,
      queryMap,
    );
  });

  return currentWidget;
}

export function reduceTab(
  currentTab: TabWithContent,
  dataModelMap: Map<string, DataModel>,
  queryMap: Map<string, Query>,
): TabWithContent {
  // Getting the query of the current Tab by it's queryId
  const currentQuery = queryMap.get(currentTab.queryId);
  // Setting the current Tab's query property
  currentTab.dataModel = dataModelMap.get(currentTab.dataModelId);
  currentTab.query = currentQuery;

  return currentTab;
}

export function isCombinedWidgetTab(
  tab: Tab & { dataModel: DataModel } & {
    chartData: ChartData[];
  } & { mapObject: MapObject[] },
): boolean {
  return (
    tab.componentType === 'Kombinierte Komponente' ||
    tab.componentSubType === 'Kombinierte Karte'
  );
}

export function isSingleValueTab(
  tab: Tab & { query?: Query } & { dataModel: DataModel } & {
    chartData: ChartData[];
  } & { mapObject: MapObject[] },
): boolean {
  return (
    tab.componentType === 'Wert' ||
    tab.componentType === 'Bild' ||
    (tab.componentType === 'Slider' &&
      tab.componentSubType === 'Farbiger Slider') ||
    (tab.componentType === 'Diagramm' &&
      (tab.componentSubType === '180° Chart' ||
        tab.componentSubType === '360° Chart' ||
        tab.componentSubType === 'Stageable Chart'))
  );
}

export function getGermanLabelForAttribute(attribute: string): string {
  switch (attribute.toUpperCase()) {
    case 'MONTHLYCONSUMPTIONSUMGAS':
      return 'Monatlicher Gasverbrauch';
    case 'MONTHLYCONSUMPTIONSUMWATER':
      return 'Monatlicher Wasserverbrauch';
    case 'CO2':
      return 'Kohlenstoffdioxid';
    case 'SOILMOISTUREEC':
      return 'Bodenfeuchtigkeit';
    case 'SOILMOISTUREVWC':
      return 'Bodenfeuchtigkeit';
    case 'SOILMOISTUREVWC_TIEFE_1':
      return 'Bodenfeuchtigkeit 10cm';
    case 'SOILMOISTUREVWC_TIEFE_2':
      return 'Bodenfeuchtigkeit 25cm';
    case 'SOILMOISTUREVWC_TIEFE_3':
      return 'Bodenfeuchtigkeit 50cm';
    case 'SOILMOISTUREVWC_TIEFE_4':
      return 'Bodenfeuchtigkeit 75cm';
    case 'SOILMOISTUREVWC_TIEFE_5':
      return 'Bodenfeuchtigkeit 90cm';
    case 'SOILMOISTUREVWC_TIEFE_6':
      return 'Bodenfeuchtigkeit 1m';
    case 'SOILTEMPERATURE':
      return 'Bodentemperatur';
    case 'TOTALCONSUMPTIONSUM_GAS':
      return 'Gesamtverbrauch Gas';
    case 'TOTALCONSUMPTIONSUM_WATER':
      return 'Gesamtverbrauch Wasser';
    case 'CO2AVG':
      return 'CO2 Durchschnitt';
    case 'TEMPERATURE':
      return 'Temperatur';
    case 'CURRENT_LEVEL':
      return 'Aktueller Pegelstand';
    case 'DEWPOINT':
      return 'Taupunkt';
    case 'RELATIVEHUMIDITY':
      return 'Relative Luftfeuchte';
    case 'SOILTEMPERATUR':
      return 'Boden Temperatur';
    case 'CURRENT_LEVEL':
      return 'Aktueller Pegelstand';
    default:
      return attribute;
  }
}
