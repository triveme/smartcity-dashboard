import { createQuery } from '../../query/test/test-data';
import { createDataModel } from '../../data-model/test/test-data';
import { Tab, tabs } from '@app/postgres-db/schemas';
import { DbType } from '@app/postgres-db';
import { v4 as uuid } from 'uuid';

export function getTab(
  widgetId: string,
  dataModelId?: string,
  queryId?: string,
): Tab {
  return {
    id: uuid(),
    componentType: 'Wert',
    componentSubType: 'Balken Chart',
    chartMinimum: 0,
    chartMaximum: 100,
    chartUnit: '%',
    chartValues: [10, 20, 30, 40, 50],
    chartLabels: ['1', '2', '3', '4', '5'],
    chartXAxisLabel: 'Month',
    chartYAxisLabel: 'Percentage',
    chartStaticValues: [25, 75],
    chartStaticValuesColors: ['red', 'green'],
    chartStaticValuesTicks: [20, 60],
    chartStaticValuesLogos: ['ChevronLeft', 'ChevronLeft'],
    chartStaticValuesTexts: ['dry', 'normal', 'humid'],
    isStepline: false,
    mapAllowPopups: true,
    mapAllowScroll: true,
    mapAllowZoom: true,
    mapAllowFilter: false,
    mapFilterAttribute: 'relativeHumidity',
    mapAllowLegend: false,
    mapLegendValues: [
      {
        icon: 'Tree',
        iconBackgroundColor: 'green',
        label: 'Sample Icon',
      },
    ],
    mapLegendDisclaimer: 'Sample Disclaimer',
    mapMinZoom: 5,
    mapMaxZoom: 15,
    mapStandardZoom: 10,
    mapMarkerColor: 'blue',
    mapActiveMarkerColor: 'red',
    mapMarkerIcon: 'location',
    mapMarkerIconColor: 'black',
    mapLongitude: 9.1,
    mapLatitude: 5.3,
    icon: 'ChevronLeft',
    iconColor: 'grey',
    iconText: 'Sample Icon Text',
    iconUrl: 'http://www.samplewebsite.com',
    labelColor: 'grey',
    showLegend: false,
    imageSrc: null,
    imageUrl: null,
    imageUpdateInterval: null,
    iFrameUrl: null,
    textValue: 'Sample Text',
    decimalPlaces: 2,
    widgetId: widgetId,
    queryId: queryId,
    dataModelId: dataModelId,
    mapDisplayMode: 'Only pin',
    mapShapeColor: 'red',
    mapShapeOption: 'Circle',
    mapWidgetValues: [
      {
        componentType: 'Diagramm',
        componentSubType: '180° Chart',
        attributes: 'absolutePressure',
        chartMininum: 0,
        chartMaximum: 100,
        chartUnit: 'm/s',
        chartStaticValues: [25, 75],
        chartStaticValuesColors: ['red', 'green'],
      },
    ],
  };
}

export async function createTab(
  db: DbType,
  widgetId: string,
  dataModelId?: string,
  queryId?: string,
): Promise<Tab> {
  if (!dataModelId) {
    const dataModel = await createDataModel(db);
    dataModelId = dataModel.id;
  }
  if (!queryId) {
    const query = await createQuery(db);
    queryId = query.id;
  }

  const createdTabs = await db
    .insert(tabs)
    .values(getTab(widgetId, dataModelId, queryId))
    .returning();

  return createdTabs.length > 0 ? createdTabs[0] : null;
}
