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
    'componentType',
    'id',
    'widgetId',
    'dataModelId',
    'queryId',
  ];
  declaredFields: DeclarationObject = {
    bild: ['imageUpdateInterval', 'imageUrl', 'imageSrc', ...this.commonFields],
    diagramm: [
      'mapAllowZoom',
      'isStepline',
      'showLegend',
      'componentSubType',
      'chartLabels',
      'chartMaximum',
      'chartMinimum',
      'chartStaticValues',
      'chartStaticValuesColors',
      'chartUnit',
      'chartValues',
      'chartXAxisLabel',
      'chartYAxisLabel',
      'colorStages',
      ...this.commonFields,
    ],
    iframe: ['iFrameUrl', ...this.commonFields],
    karte: [
      'componentSubType',
      'mapAllowPopups',
      'mapAllowScroll',
      'mapAllowZoom',
      'mapAllowFilter',
      'mapFilterAttribute',
      'mapAllowLegend',
      'mapLegendValues',
      'mapLegendDisclaimer',
      'mapMaxZoom',
      'mapMinZoom',
      'mapMarkerColor',
      'mapActiveMarkerColor',
      'mapMarkerIcon',
      'mapMarkerIconColor',
      'mapStandardZoom',
      'mapLatitude',
      'mapLongitude',
      'mapShapeOption',
      'mapDisplayMode',
      'mapShapeColor',
      'mapWidgetValues',
      ...this.commonFields,
    ],
    text: ['textValue', ...this.commonFields],
    wert: ['chartUnit', 'decimalPlaces', 'textValue', ...this.commonFields],
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
