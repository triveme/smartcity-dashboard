import {
  PipeTransform,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Tab } from '@app/postgres-db/schemas';

type DeclarationObject = {
  bild?: string[];
  diagramm?: string[];
  iframe?: string[];
  karte?: string[];
  text?: string[];
  wert?: string[];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
@Injectable()
export class SanitizeTabDataPipe implements PipeTransform {
  commonFields: string[] = [
    'chartDateRepresentation',
    'componentType',
    'componentSubType',
    'id',
    'widgetId',
    'dataModelId',
    'queryId',
    'icon',
    'iconColor',
    'iconText',
    'iconUrl',
  ];
  declaredFields: DeclarationObject = {
    bild: [
      'imageUpdateInterval',
      'imageUrl',
      'imageSrc',
      'imageAllowJumpoff',
      'imageJumpoffUrl',
      ...this.commonFields,
    ],
    diagramm: [
      'chartAllowImageDownload',
      'chartHasAutomaticZoom',
      'chartHasAdditionalSelection',
      'chartLabels',
      'chartLegendAlign',
      'chartMaximum',
      'chartMinimum',
      'chartPieRadius',
      'chartStaticValues',
      'chartStaticValuesColors',
      'chartStaticValuesLogos',
      'chartStaticValuesTexts',
      'chartStaticValuesTicks',
      'chartUnit',
      'chartValues',
      'chartXAxisLabel',
      'chartYAxisLabel',
      'chartYAxisScale',
      'chartYAxisScaleChartMinValue',
      'chartYAxisScaleChartMaxValue',
      'chartHoverSingleValue',
      'chartDynamicOnlyShowHover',
      'chartDynamicNoSelectionDisplayAll',
      'dynamicHighlightColor',
      'dynamicUnhighlightColor',
      'colorStages',
      'isStepline',
      'isStackedChart',
      'labelColor',
      'mapAllowZoom',
      'sliderCurrentAttribute',
      'sliderMaximumAttribute',
      'setYAxisInterval',
      'setSortAscending',
      'setSortDescending',
      'setValueLimit',
      'userDefinedLimit',
      'showLegend',
      'tiles',
      'decimalPlaces',
      'tableFontColor',
      'tableHeaderColor',
      'tableOddRowColor',
      'tableEvenRowColor',

      ...this.commonFields,
    ],
    iframe: ['iFrameUrl', ...this.commonFields],
    karte: [
      '',
      'childWidgets',
      'chartStaticValues',
      'chartStaticValuesColors',
      'chartStaticValuesLogos',
      'chartStaticValuesTexts',
      'chartStaticValuesTicks',
      'mapActiveMarkerColor',
      'mapAllowFilter',
      'mapAllowLegend',
      'mapAllowPopups',
      'mapAllowScroll',
      'mapAllowZoom',
      'mapAttributeForValueBased',
      'mapFormSizeFactor',
      'mapDisplayMode',
      'mapFilterAttribute',
      'mapGeoJSON',
      'mapGeoJSONSensorBasedColors',
      'mapGeoJSONSensorBasedNoDataColor',
      'mapGeoJSONBorderColor',
      'mapGeoJSONFillColor',
      'mapGeoJSONFillOpacity',
      'mapGeoJSONSelectionBorderColor',
      'mapGeoJSONSelectionFillColor',
      'mapGeoJSONSelectionFillOpacity',
      'mapGeoJSONHoverBorderColor',
      'mapGeoJSONHoverFillColor',
      'mapGeoJSONHoverFillOpacity',
      'mapGeoJSONFeatureIdentifier',
      'mapIsFormColorValueBased',
      'mapIsIconColorValueBased',
      'mapLatitude',
      'mapLegendDisclaimer',
      'mapLegendValues',
      'mapLongitude',
      'mapMarkerColor',
      'mapMarkerIcon',
      'mapMarkerIconColor',
      'mapMaxZoom',
      'mapMinZoom',
      'mapShapeColor',
      'mapShapeOption',
      'mapStandardZoom',
      'mapWidgetValues',
      'mapWmsUrl',
      'mapCombinedWmsUrl',
      'mapWmsLayer',
      'mapCombinedWmsLayer',
      'mapUnitsTexts',
      'chartStaticValuesText',
      ...this.commonFields,
    ],
    text: ['textValue', ...this.commonFields],
    wert: [
      'chartUnit',
      'decimalPlaces',
      'textValue',
      'chartStaticValues',
      'chartStaticValuesColors',
      'chartStaticValuesLogos',
      'chartStaticValuesTexts',
      'chartStaticValuesTicks',
      ...this.commonFields,
    ],
  };

  transform(value: Tab): Tab {
    if (!value.componentType)
      throw new HttpException(
        'Component Type for tab must be set',
        HttpStatus.BAD_REQUEST,
      );
    const componentType = value.componentType.toLowerCase();
    const possibleComponents = Object.keys(this.declaredFields);
    if (possibleComponents.includes(componentType)) {
      for (const entry of Object.keys(value)) {
        if (!this.declaredFields[componentType].includes(entry)) {
          value[entry] = null;
        }
      }
    }
    return value;
  }
}
