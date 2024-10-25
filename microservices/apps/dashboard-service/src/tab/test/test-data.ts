import { createQuery, getNGSILiveQuery } from '../../query/test/test-data';
import { Tab, tabs } from '@app/postgres-db/schemas';
import { DbType } from '@app/postgres-db';
import { v4 as uuid } from 'uuid';
import {
  DataModel,
  dataModels,
} from '@app/postgres-db/schemas/data-model.schema';

export function getDataModel(): DataModel {
  return {
    id: uuid(),
    model: {
      name: 'Dummy interesting place',
      types: ['Art', 'History'],
      address: {
        addressLocality: 'City',
        postalCode: '12345',
        streetAddress: 'Examplestreet 123',
      },
      image: 'https://example.com/image.jpg',
      imagePreview: 'https://example.com/image-preview.jpg',
      creator: 'John Doe',
      location: {
        type: 'Point',
        coordinates: [50.1234, 7.5678],
      },
      info: 'Ein Beispieltext mit Informationen über den Ort.',
      zoomprio: 'High',
    },
  };
}

export async function createDataModel(db: DbType): Promise<DataModel> {
  const createdDataModels = await db
    .insert(dataModels)
    .values(getDataModel())
    .returning();

  return createdDataModels.length > 0 ? createdDataModels[0] : null;
}

export async function getTab(
  db: DbType,
  widgetId: string,
  componentType?:
    | 'Informationen'
    | 'Diagramm'
    | 'Slider'
    | 'Karte'
    | 'Wert'
    | 'iFrame'
    | 'Bild',
  componentSubType?:
    | 'Text'
    | 'Icon mit Link'
    | '180° Chart'
    | '360° Chart'
    | 'Stageable Chart'
    | 'Pie Chart'
    | 'Linien Chart'
    | 'Balken Chart'
    | 'Measurement'
    | 'Pin'
    | 'Parking'
    | 'Farbiger Slider'
    | 'Slider Übersicht',
  dataModelId?: string,
  queryId?: string,
): Promise<Tab> {
  componentType = componentType ? componentType : 'Diagramm';
  componentSubType = componentSubType ? componentSubType : 'Balken Chart';

  if (!dataModelId) {
    const dataModel = await createDataModel(db);
    dataModelId = dataModel.id;
  }
  if (!queryId) {
    const query = await createQuery(db, getNGSILiveQuery());
    queryId = query.id;
  }

  return {
    id: uuid(),
    componentType: componentType,
    componentSubType: componentSubType,
    chartHasAdditionalSelection: false,
    chartMinimum: 0,
    chartMaximum: 100,
    chartUnit: '%',
    chartValues: [10, 20, 30, 40, 50],
    chartLabels: ['1', '2', '3', '4', '5'],
    chartLegendAlign: 'Top',
    chartXAxisLabel: 'Month',
    chartYAxisLabel: 'Percentage',
    chartStaticValues: [25, 75],
    chartStaticValuesColors: ['red', 'green'],
    chartStaticValuesTicks: [20, 60],
    chartStaticValuesLogos: ['ChevronLeft', 'ChevronLeft'],
    chartStaticValuesTexts: ['dry', 'normal', 'humid'],
    childWidgets: [],
    isStepline: false,
    mapAllowPopups: true,
    mapAllowScroll: true,
    mapAllowZoom: true,
    mapAllowFilter: false,
    mapAttributeForValueBased: 'distance',
    mapFormSizeFactor: 1,
    mapFilterAttribute: 'relativeHumidity',
    mapIsFormColorValueBased: false,
    mapIsIconColorValueBased: false,
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
    rangeStaticValuesMin: [1, 51],
    rangeStaticValuesMax: [52, 99],
    rangeStaticValuesColors: ['yellow', 'red'],
    rangeStaticValuesLogos: ['Leaf', 'Tree'],
    rangeStaticValuesLabels: ['Low', 'High'],
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
    mapWmsUrl: 'www.google.com',
    mapWmsLayer: 'SomeLayer',
    tiles: 10,
    sliderCurrentAttribute: 'Current Attribute',
    sliderMaximumAttribute: 'Maximum Attribute',
  };
}

export async function createTab(db: DbType, tab: Tab): Promise<Tab> {
  const createdTabs = await db.insert(tabs).values(tab).returning();

  return createdTabs.length > 0 ? createdTabs[0] : null;
}
