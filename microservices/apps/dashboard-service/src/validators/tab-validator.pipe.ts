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

const mapDateColorModes = ['numeric', 'text', 'relative_date'];
const mapDateDirections = ['before', 'after'];
const mapDateAnchors = [
  'now',
  'start_of_day',
  'start_of_week',
  'start_of_month',
];
const mapDateOffsetUnits = ['hour', 'day', 'week', 'month'];

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
      'chartHideXAxis',
      'chartHideYAxis',
      'chartYAxisScale',
      'chartYAxisScaleChartMinValue',
      'chartYAxisScaleChartMaxValue',
      'chartAggregationMode',
      'chartHoverSingleValue',
      'chartDynamicOnlyShowHover',
      'chartDynamicNoSelectionDisplayAll',
      'chartShowPercent',
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
      'singleSelectLegend',
      'advancedDateSelection',
      'tiles',
      'decimalPlaces',
      'tableFontColor',
      'tableHeaderColor',
      'tableOddRowColor',
      'tableEvenRowColor',
      'barChartShowTimestampOnHover',
      'isTableHeaderVisible',
      'useDashboardFontColor',
      'normalizeXAxisByTimeFramePeriod',
      'usePreviousStageColorOnBoundary',
      'extendedTimeframe',
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
      'mapClusterAtMaxZoom',
      'mapSearch',
      'mapAttributeForValueBased',
      'mapFormSizeFactor',
      'mapDisplayMode',
      'pinMode',
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
      'mapValueColorMode',
      'mapDateColorRules',
      'mapValueColorDefaultColor',
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
      'customMapImageId',
      'customMapSensorData',
      'allowMapPopupWidthChange',
      'mapPopupWidth',
      'multiAttributeConfigs',
      ...this.commonFields,
    ],
    text: ['textValue', ...this.commonFields],
    wert: [
      'chartUnit',
      'decimalPlaces',
      'hideThousandsSeparator',
      'valueFontSize',
      'valueUnitFontSize',
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
    this.validateMapDateColorConfiguration(value, componentType);
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

  private validateMapDateColorConfiguration(
    value: Tab,
    componentType: string,
  ): void {
    if (componentType !== 'karte') {
      return;
    }

    if (
      value.mapValueColorMode != null &&
      !mapDateColorModes.includes(value.mapValueColorMode)
    ) {
      throw new HttpException(
        'Invalid map value color mode',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (value.mapDateColorRules == null) {
      return;
    }

    if (!Array.isArray(value.mapDateColorRules)) {
      throw new HttpException(
        'Map date color rules must be an array',
        HttpStatus.BAD_REQUEST,
      );
    }

    const hasInvalidRule = value.mapDateColorRules.some((rule) => {
      if (!rule || typeof rule !== 'object') {
        return true;
      }

      const config = rule as Record<string, unknown>;
      return (
        !mapDateAnchors.includes(config.anchor as string) ||
        !Number.isInteger(config.offsetValue) ||
        (config.offsetValue as number) < 0 ||
        !mapDateOffsetUnits.includes(config.offsetUnit as string) ||
        !mapDateDirections.includes(config.offsetDirection as string) ||
        typeof config.color !== 'string' ||
        (config.icon != null && typeof config.icon !== 'string')
      );
    });

    if (hasInvalidRule) {
      throw new HttpException(
        'Invalid map date color rule',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
