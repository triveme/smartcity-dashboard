import {
  MapModalWidget,
  Tab,
  tabComponentSubTypeEnum,
  tabComponentTypeEnum,
} from '@/types';
import { WizardErrors } from '@/types/errors';
import {
  validateLat,
  validateLong,
  validateUrl,
} from '@/utils/validationHelper';

export function validateTab(tab: Tab): WizardErrors {
  const errorsOccured: WizardErrors = {};
  if (tab?.componentType === tabComponentTypeEnum.iframe && !tab?.iFrameUrl) {
    errorsOccured.urlError = 'iFrame-URL ist erforderlich!';
  } else if (
    tab?.componentType === tabComponentTypeEnum.iframe &&
    tab?.iFrameUrl &&
    !validateUrl(tab?.iFrameUrl)
  ) {
    errorsOccured.urlError = 'Ungültige URL für iFrame';
  } else if (tab?.componentType === tabComponentTypeEnum.map) {
    if (!validateLat(tab?.mapLatitude) || !validateLong(tab?.mapLongitude)) {
      errorsOccured.latLongError =
        'Ungültige Latitude oder Longitude für die Karte';
    }
    if (
      !tab?.componentSubType ||
      (tab.componentSubType !== tabComponentSubTypeEnum.pin &&
        tab.componentSubType !== tabComponentSubTypeEnum.parking)
    ) {
      errorsOccured.mapTypeError = 'Der Karten Typ muss gewählt werden.';
    }
    if (
      tab.mapAllowPopups &&
      tab.mapWidgetValues &&
      tab.mapWidgetValues.length > 0
    ) {
      // map modal widget static values checking
      const invalidIndices = findInvalidMapWidgetIndices(tab.mapWidgetValues);
      if (invalidIndices.length > 0) {
        errorsOccured.mapModalWidgetError = `Unvollständige statische Werte an Position(en): ${invalidIndices
          .map((i) => i + 1) // starts from 1
          .join(', ')}`;
        errorsOccured.mapModalWidgetIndexError = invalidIndices;
      }
    }
  } else if (tab?.componentType === tabComponentTypeEnum.diagram) {
    if (tab.componentSubType === tabComponentSubTypeEnum.stageableChart) {
      if (tab?.chartStaticValues) {
        for (let i = 0; i < tab.chartStaticValues.length; i++) {
          const value = tab.chartStaticValues[i];

          if (tab.chartMinimum !== undefined && value < tab.chartMinimum) {
            errorsOccured.stageableColorValueError = `Wert ${value} muss größer oder gleich ${tab.chartMinimum} sein.`;
            break;
          }

          if (tab.chartMaximum !== undefined && value > tab.chartMaximum) {
            errorsOccured.stageableColorValueError = `Wert ${value} muss kleiner oder gleich ${tab.chartMaximum} sein.`;
            break;
          }
        }
      }
    }
  } else if (
    tab?.componentType === tabComponentTypeEnum.information &&
    tab?.componentSubType === tabComponentSubTypeEnum.iconWithLink
  ) {
    if (!tab?.iconUrl) errorsOccured.urlError = 'URL ist erforderlich!';
  } else if (tab?.componentType === tabComponentTypeEnum.combinedComponent) {
    if (!tab.childWidgets?.[0])
      errorsOccured.combinedTopWidgetError = 'Oberes widget ist erforderlich!';
    if (!tab.childWidgets?.[1])
      errorsOccured.combinedBottomWidgetError =
        'Unteres widget ist erforderlich!';
  }
  return errorsOccured;
}

const findInvalidMapWidgetIndices = (
  mapWidgetValues: MapModalWidget[],
): number[] => {
  return mapWidgetValues.reduce((invalidIndices, widget, index) => {
    if (
      !widget.attributes ||
      widget.chartMinimum == undefined ||
      widget.chartMaximum == undefined ||
      !widget.chartUnit ||
      !widget.componentSubType ||
      !widget.componentType
    ) {
      invalidIndices.push(index);
    }
    return invalidIndices;
  }, [] as number[]);
};
