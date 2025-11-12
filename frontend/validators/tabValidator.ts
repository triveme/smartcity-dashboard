import {
  MapModalWidget,
  Tab,
  tabComponentSubTypeEnum,
  tabComponentTypeEnum,
  widgetImageSourceEnum,
} from '@/types';
import { WizardErrors } from '@/types/errors';
import {
  validateLat,
  validateLong,
  validateUrl,
} from '@/utils/validationHelper';

export function validateTab(tab: Tab): WizardErrors {
  const errorsOccured: WizardErrors = {};

  // validate component type and subtype (if needed)
  if (!tab?.componentType) {
    errorsOccured.tabComponentTypeError = 'Komponente ist erforderlich!';
  }
  if (tabNeedsSubType(tab) && !tab?.componentSubType) {
    errorsOccured.tabComponentSubTypeError = 'Subtyp ist erforderlich!';
  }

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
        tab.componentSubType !== tabComponentSubTypeEnum.combinedMap &&
        tab.componentSubType !== tabComponentSubTypeEnum.geoJSON &&
        tab.componentSubType !== tabComponentSubTypeEnum.geoJSONDynamic &&
        tab.componentSubType !== tabComponentSubTypeEnum.pinDynamic &&
        tab.componentSubType !== tabComponentSubTypeEnum.parking)
    ) {
      errorsOccured.mapTypeError = 'Der Karten Typ muss gewählt werden.';
    }
    if (tab.componentSubType === tabComponentSubTypeEnum.combinedMap) {
      if (
        !tab.childWidgets ||
        (tab.childWidgets && tab.childWidgets.length === 0)
      ) {
        errorsOccured.combinedMapWidgetError =
          'Mindestens ein Widget ist erforderlich!';
      }
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
  } else if (tab.componentType === tabComponentTypeEnum.slider) {
    if (tab.componentSubType === tabComponentSubTypeEnum.coloredSlider) {
      const chartValuesError = validateChartValues(tab);
      if (chartValuesError)
        errorsOccured.coloredSliderValueError = chartValuesError;
    }
  } else if (
    tab?.componentType === tabComponentTypeEnum.information &&
    tab?.componentSubType === tabComponentSubTypeEnum.iconWithLink
  ) {
    if (!tab?.iconUrl) errorsOccured.urlError = 'URL ist erforderlich!';
  } else if (tab?.componentType === tabComponentTypeEnum.combinedComponent) {
    // we allow more than 2 combined widgets, but only validate the minimum required (2)
    if (!tab.childWidgets?.[0])
      errorsOccured.combinedTopWidgetError = 'Oberes widget ist erforderlich!';
    if (!tab.childWidgets?.[1])
      errorsOccured.combinedBottomWidgetError =
        'Unteres widget ist erforderlich!';
  } else if (tab?.componentType === tabComponentTypeEnum.image) {
    if (tab?.imageAllowJumpoff && !tab?.imageJumpoffUrl) {
      errorsOccured.imageJumpoffUrlError = 'Bild Jumpoff-URL ist erforderlich!';
    } else if (
      tab?.imageAllowJumpoff &&
      tab?.imageJumpoffUrl &&
      !validateUrl(tab?.imageJumpoffUrl)
    ) {
      errorsOccured.imageJumpoffUrlError = 'Ungültige URL für Bild Jumpoff-URL';
    }
  } else if (tab?.componentType === tabComponentTypeEnum.listview) {
    if (!tab?.listviewName) {
      errorsOccured.listviewNameError = 'Listview Name ist erforderlich!';
    }

    if (tab?.listviewIsFilteringAllowed && !tab?.listviewFilterAttribute) {
      errorsOccured.listviewFilterAttributeError =
        'Filter Attribut ist erforderlich wenn Filtering erlaubt ist!';
    }

    if (tab?.listviewShowAddress && !tab?.listviewAddressAttribute) {
      errorsOccured.listviewAddressAttributeError =
        'Adresse Attribut ist erforderlich wenn Adresse angezeigt wird!';
    }

    if (tab?.listviewShowContact && !tab?.listviewContactAttribute) {
      errorsOccured.listviewContactAttributeError =
        'Kontakt Attribut ist erforderlich wenn Kontakt angezeigt wird!';
    }

    if (tab?.listviewShowImage && !tab?.listviewImageAttribute) {
      errorsOccured.listviewImageAttributeError =
        'Bild Attribut ist erforderlich wenn Bild angezeigt wird!';
    }

    if (tab?.listviewShowCategory && !tab?.listviewCategoryAttribute) {
      errorsOccured.listviewCategoryAttributeError =
        'Kategorie Attribut ist erforderlich wenn Kategorie angezeigt wird!';
    }

    if (tab?.listviewShowName && !tab?.listviewNameAttribute) {
      errorsOccured.listviewNameAttributeError =
        'Name Attribut ist erforderlich wenn Name angezeigt wird!';
    }

    if (tab?.listviewShowContactName && !tab?.listviewContactNameAttribute) {
      errorsOccured.listviewContactNameAttributeError =
        'Kontakt Name Attribut ist erforderlich wenn Kontakt Name angezeigt wird!';
    }

    if (tab?.listviewShowContactPhone && !tab?.listviewContactPhoneAttribute) {
      errorsOccured.listviewContactPhoneAttributeError =
        'Kontakt Telefonnummer Attribut ist erforderlich wenn Kontakt Telefonnummer angezeigt wird!';
    }

    if (tab?.listviewShowParticipants && !tab?.listviewParticipantsAttribute) {
      errorsOccured.listviewParticipantsAttributeError =
        'Teilnehmer Attribut ist erforderlich wenn Teilnehmer angezeigt wird!';
    }

    if (tab?.listviewShowSupporter && !tab?.listviewSupporterAttribute) {
      errorsOccured.listviewSupporterAttributeError =
        'Unterstützer Attribut ist erforderlich wenn Unterstützer angezeigt wird!';
    }

    if (tab?.listviewShowEmail && !tab?.listviewEmailAttribute) {
      errorsOccured.listviewEmailAttributeError =
        'E-Mail Attribut ist erforderlich wenn E-Mail angezeigt wird!';
    }

    if (tab?.listviewShowWebsite && !tab?.listviewWebsiteAttribute) {
      errorsOccured.listviewWebsiteAttributeError =
        'Website Attribut ist erforderlich wenn Website angezeigt wird!';
    }

    if (tab?.listviewShowDescription && !tab?.listviewDescriptionAttribute) {
      errorsOccured.listviewDescriptionAttributeError =
        'Beschreibung Attribut ist erforderlich wenn Beschreibung angezeigt wird!';
    }
  } else if (tab?.componentType === tabComponentTypeEnum.sensorStatus) {
    const error = validateSensorStatusValues(tab);
    if (error) {
      errorsOccured.typeError = error;
    }
  }
  return errorsOccured;
}

const findInvalidMapWidgetIndices = (
  mapWidgetValues: MapModalWidget[],
): number[] => {
  return mapWidgetValues.reduce((invalidIndices, widget, index) => {
    if (widget?.componentType && mapWidgetNeedsSubType(widget)) {
      if (!widget.componentSubType) {
        invalidIndices.push(index);
        return invalidIndices;
      }
    }

    if (widget.componentType === tabComponentTypeEnum.image) {
      if (widget.componentSubType === widgetImageSourceEnum.url) {
        if (!widget.imageUrl) {
          invalidIndices.push(index);
        } else if (widget.imageUrl && !validateUrl(widget.imageUrl)) {
          invalidIndices.push(index);
        }
      } else if (widget.componentSubType === widgetImageSourceEnum.sensor) {
        if (!widget.attributes) invalidIndices.push(index);
      }
      return invalidIndices;
    } else if (widget.componentType === tabComponentTypeEnum.value) {
      if (!widget.attributes) invalidIndices.push(index);
      return invalidIndices;
    } else if (widget.componentType === tabComponentTypeEnum.diagram) {
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
    } else if (widget.componentType === 'Button') {
      if (!widget.jumpoffUrl && !widget.jumpoffAttribute) {
        invalidIndices.push(index);
      }
      return invalidIndices;
    }

    return invalidIndices;
  }, [] as number[]);
};

function validateChartValues(tab: Tab): string | undefined {
  if (tab.chartMinimum === undefined) return 'Minimum ist erforderlich!';
  if (tab.chartMaximum === undefined) return 'Maximum ist erforderlich!';
  if (tab.rangeStaticValuesMin === undefined)
    return 'Statische Werte ist erforderlich!';

  if (
    tab.chartMinimum !== undefined &&
    tab.chartMaximum !== undefined &&
    tab.rangeStaticValuesMin &&
    tab.rangeStaticValuesMin.length > 0 &&
    tab.rangeStaticValuesMax &&
    tab.rangeStaticValuesMax.length > 0
  ) {
    // Validate each value in rangeStaticValuesMin and rangeStaticValuesMax
    for (let i = 0; i < tab.rangeStaticValuesMax.length; i++) {
      const maxValue = tab.rangeStaticValuesMax[i];
      const minValue = tab.rangeStaticValuesMin[i];

      // no values can be less than chartMinimum
      if (minValue < tab.chartMinimum) {
        return `Wert ${minValue} muss größer oder gleich ${tab.chartMinimum} sein.`;
      }
      if (maxValue < tab.chartMinimum) {
        return `Wert ${maxValue} muss größer oder gleich ${tab.chartMinimum} sein.`;
      }

      // no values can be more than chartMaximum
      if (minValue > tab.chartMaximum) {
        return `Wert ${minValue} muss kleiner oder gleich ${tab.chartMaximum} sein.`;
      }
      if (maxValue > tab.chartMaximum) {
        return `Wert ${maxValue} muss kleiner oder gleich ${tab.chartMaximum} sein.`;
      }

      // rangeStaticValuesMax[i] must be less than rangeStaticValuesMin[i + 1]
      if (i < tab.rangeStaticValuesMax.length - 1) {
        if (maxValue >= tab.rangeStaticValuesMin[i + 1]) {
          return `Wert ${tab.rangeStaticValuesMin[i + 1]} muss größer oder gleich ${maxValue} sein.`;
        }
      }
    }
  }

  return undefined;
}

function validateSensorStatusValues(tab: Tab): string | undefined {
  if (tab.sensorStatusMinThreshold === undefined)
    return 'Minimum ist erforderlich!';
  if (
    tab.sensorStatusLightCount == 3 &&
    tab.sensorStatusMaxThreshold === undefined
  )
    return 'Maximum ist erforderlich!';

  if (tab.sensorStatusMaxThreshold !== undefined) {
    const isMinNum = Number(tab.sensorStatusMinThreshold);
    const isMaxNum = Number(tab.sensorStatusMaxThreshold);

    // Both number and min larger than max
    if (!isNaN(isMinNum) && !isNaN(isMaxNum) && isMinNum >= isMaxNum) {
      return `Wert ${tab.sensorStatusMaxThreshold} muss größer oder gleich ${tab.sensorStatusMinThreshold} sein.`;
      // One of them not a number
    } else if (
      (!isNaN(isMinNum) && isNaN(isMaxNum)) ||
      (isNaN(isMinNum) && !isNaN(isMaxNum))
    ) {
      return `Die Bedingungen müssen vom gleichen Typ sein.`;
    }
  }

  return undefined;
}

function tabNeedsSubType(tab: Tab): boolean {
  const typesWithSubType = [
    tabComponentTypeEnum.information,
    tabComponentTypeEnum.diagram,
    tabComponentTypeEnum.interactiveComponent,
    tabComponentTypeEnum.slider,
    'Button',
  ];

  return typesWithSubType.includes(tab.componentType as tabComponentTypeEnum);
}

function mapWidgetNeedsSubType(mapWidgetValues: MapModalWidget): boolean {
  const typesWithSubType = [
    tabComponentTypeEnum.information,
    tabComponentTypeEnum.diagram,
    tabComponentTypeEnum.interactiveComponent,
    tabComponentTypeEnum.image,
    'Button',
  ];

  return typesWithSubType.includes(
    mapWidgetValues.componentType as tabComponentTypeEnum,
  );
}
