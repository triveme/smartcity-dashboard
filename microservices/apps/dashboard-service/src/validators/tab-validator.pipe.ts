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
      'chartHasAdditionalSelection',
      'chartLabels',
      'chartLegendAlign',
      'chartMaximum',
      'chartMinimum',
      'chartStaticValues',
      'chartStaticValuesColors',
      'chartStaticValuesLogos',
      'chartStaticValuesTexts',
      'chartStaticValuesTicks',
      'chartUnit',
      'chartValues',
      'chartXAxisLabel',
      'chartYAxisLabel',
      'colorStages',
      'isStepline',
      'labelColor',
      'mapAllowZoom',
      'sliderCurrentAttribute',
      'sliderMaximumAttribute',
      'showLegend',
      'tiles',
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
      'mapWmsLayer',
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
