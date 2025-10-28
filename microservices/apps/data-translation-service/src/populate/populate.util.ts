import {
  ChartData,
  DashboardWithContent,
  MapObject,
  PanelWithContent,
  TabWithContent,
  WidgetWithContent,
} from '../data-translation.service';
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
        weatherWarnings: null,
        listviewData: null,
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
    tab.componentType === 'Wetterwarnungen' ||
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
      return 'CO2';
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

    case 'SOILMOISTUREVWC_TIEFE_10CM':
      return 'Bodenfeuchtigkeit 10cm';
    case 'SOILMOISTUREVWC_TIEFE_20CM':
      return 'Bodenfeuchtigkeit 20cm';
    case 'SOILMOISTUREVWC_TIEFE_30CM':
      return 'Bodenfeuchtigkeit 30cm';
    case 'SOILMOISTUREVWC_TIEFE_45CM':
      return 'Bodenfeuchtigkeit 45cm';
    case 'SOILMOISTUREVWC_TIEFE_60CM':
      return 'Bodenfeuchtigkeit 60cm';
    case 'SOILMOISTUREVWC_TIEFE_90CM':
      return 'Bodenfeuchtigkeit 90cm';

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
    case 'CURRENTLEVEL':
      return 'Pegelstand';
    case 'CURRENT_LEVEL':
      return 'Pegelstand';
    case 'DEWPOINT':
      return 'Taupunkt';
    case 'RELATIVEHUMIDITY':
      return 'Relative Luftfeuchte';
    case 'SOILTEMPERATUR':
      return 'Boden Temperatur';
    case 'PRECIPITATION':
      return 'Niederschlag';
    case 'RAINRATEINTERVAL':
      return 'Niederschlag';
    case 'IRRADIATION':
      return 'Sonneneinstrahlung';
    case 'PRESSURE':
      return 'Luftdruck';
    case 'SOLARRADIATION':
      return 'Solareinstrahlung';
    case 'LIGHTNING_STRIKE_COUNT':
      return 'Blitzeinschläge';
    case 'LIGHTNING_STRIKE_DISTANCE':
      return 'Blitzentfernung';
    case 'WINDDIRECTION':
      return 'Windrichtung';
    case 'MAXIMUM_WINDSPEED':
      return 'Windböe';
    case 'WINDSPEED':
      return 'Windgeschwindigkeit';
    case 'TOTAL_COVERAGE':
      return 'Bewölkung';
    case 'MAXLVL':
      return 'Höchster Pegelstand';
    case 'MINLVL':
      return 'Niedrigster Pegelstand';
    case 'ATMOSPHERICPRESSURE':
      return 'Luftdruck';
    case 'VEHICLETYPE':
      return 'Fahrzeugtyp';
    case 'STREETNAME':
      return 'Straßenname';
    case 'INTENSITY':
      return 'Auslastung';
    case 'STATUS_ISOCCUPIEDSUM':
      return 'Belegung';
    case 'LIGHTNING_AVERAGE_DISTANCE':
      return 'Blitzentfernung';
    case 'CAR':
      return 'PKW';
    case 'PKW':
      return 'PKW';
    case 'AUTO':
      return 'PKW';
    case 'BIKE':
      return 'Fahrrad';
    case 'BICYCLE':
      return 'Fahrrad';
    case 'BICYCLES':
      return 'Fahrrad';
    case 'FAHRRAD':
      return 'Fahrrad';
    case 'SCOOTER':
      return 'Roller';
    case 'MOTORRAD':
      return 'Motorrad';
    case 'MOTORBIKE':
      return 'Motorrad';
    case 'MOTORCYCLE':
      return 'Motorrad';
    case 'MOTORCYCLES':
      return 'Motorrad';
    case 'ELECTRIC_CAR':
      return 'Elektroauto';
    case 'ELECTRIC_BIKE':
      return 'Elektrofahrrad';
    case 'ELECTRIC_SCOOTER':
      return 'Elektroroller';
    case 'ELECTRIC_MOTORBIKE':
      return 'Elektromotorrad';
    case 'BUS':
      return 'Bus';
    case 'BUSES':
      return 'Bus';
    case 'LKW':
      return 'LKW';
    case 'TRUCK':
      return 'LKW';
    case 'TRUCKS':
      return 'LKW';
    case 'PASSANT':
      return 'Person';
    case 'PERSON':
      return 'Person';
    case 'TOTALCONSUMPTION':
      return 'Verbrauch';
    case 'ANZAHL_LKW':
      return 'LKW';
    case 'ANZAHL_MOTORRAD':
      return 'Motorrad';
    case 'ANZAHL_PERSON':
      return 'Person';
    case 'ANZAHL_PKW':
      return 'PKW';
    case 'ANZAHL_SONSTIGE':
      return 'Sonstige';
    case 'SONSTIGE':
      return 'Sonstige';
    case 'ATMOSPHERICPRESSUREAVG':
      return 'Luftdruck';
    case 'PRECIPITATIONAVG':
      return 'Niederschlag';
    case 'RELATIVEHUMIDITYAVG':
      return 'Luftfeuchte';
    case 'TEMPERATUREAVG':
      return 'Temperatur';
    case 'CO':
      return 'Kohlenstoffmonoxid';
    case 'NO':
      return 'Stickstoffmonoxid';
    case 'NO2':
      return 'Stickstoffdioxid';
    case 'O3':
      return 'Ozon';
    case 'PM1':
      return 'Feinstaub PM1';
    case 'PM10':
      return 'Feinstaub PM10';
    case 'PM25':
      return 'Feinstaub PM2,5';
    case 'ARIQUALITYINDEX':
      return 'Luftqualitätsindex';
    default:
      return attribute;
  }
}
