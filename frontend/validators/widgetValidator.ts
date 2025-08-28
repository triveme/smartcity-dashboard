import {
  Widget,
  WidgetWithChildren,
  tabComponentSubTypeEnum,
  tabComponentTypeEnum,
  widgetImageSourceEnum,
} from '@/types';
import { WizardErrors } from '@/types/errors';
import { validateTab } from './tabValidator';
import { validateQueryConfig } from './queryConfigValidator';

export function validateWidgetWithChildren(
  widgetWithChildren: WidgetWithChildren,
  origin: string,
): WizardErrors {
  let errorsOccured: WizardErrors = {};

  errorsOccured = {
    ...errorsOccured,
    ...validateWidget(widgetWithChildren.widget),
    ...validateTab(widgetWithChildren.tab),
    ...validateWidgetHeightBasedOnComponentType(widgetWithChildren),
  };

  if (widgetWithChildren.queryConfig && widgetWithChildren?.tab.componentType) {
    if (
      widgetWithChildren?.tab.componentType !==
        tabComponentTypeEnum.information &&
      widgetWithChildren?.tab.componentType !== tabComponentTypeEnum.image &&
      widgetWithChildren?.tab.componentType !== tabComponentTypeEnum.iframe
    ) {
      errorsOccured = {
        ...errorsOccured,
        ...validateQueryConfig(
          widgetWithChildren.queryConfig,
          widgetWithChildren.tab.componentType,
          false,
          origin,
          widgetWithChildren.tab.componentSubType,
        ),
      };
    }
  }

  if (
    widgetWithChildren?.tab.componentType === tabComponentTypeEnum.map &&
    widgetWithChildren.queryConfig
  ) {
    const tab = widgetWithChildren.tab;
    if (
      (tab.mapAllowPopups &&
        tab.mapWidgetValues &&
        tab.mapWidgetValues.length > 0) ||
      tab.mapAllowFilter
    ) {
      if (
        widgetWithChildren.queryConfig?.attributes &&
        widgetWithChildren.queryConfig?.attributes.length === 0
      ) {
        errorsOccured.attributeError = 'Attribut ist erforderlich!';
      }
    }

    if (widgetWithChildren.tab.mapAllowPopups) {
      errorsOccured = {
        ...errorsOccured,
        ...validateMapWidgetsAttributesSelected(widgetWithChildren),
      };
    }

    if (widgetWithChildren.tab.mapAllowFilter) {
      errorsOccured = {
        ...errorsOccured,
        ...validateMapFilterAttributeSelected(widgetWithChildren),
      };
    }
  }

  return errorsOccured;
}

export function validateWidget(widget: Widget): WizardErrors {
  const errorsOccured: WizardErrors = {};
  if (!widget.name) errorsOccured.nameError = 'Name muss ausgefüllt werden!';
  if (widget.visibility === 'protected') {
    if (widget.readRoles.length === 0)
      errorsOccured.readRolesError = 'Leserechte müssen ausgefüllt werden!';
    if (widget.writeRoles.length === 0)
      errorsOccured.writeRolesError =
        'Schreibberechtigungen müssen ausgefüllt sein!';
  }
  return errorsOccured;
}

export function validateWidgetHeightBasedOnComponentType(
  widgetWithChildren: WidgetWithChildren,
): WizardErrors {
  const errorsOccured: WizardErrors = {};
  const { widget, tab } = widgetWithChildren;

  if (typeof widget.height === 'string' && widget.height === '') {
    errorsOccured.widgetHeightError = 'Höhe muss ausgefüllt werden!';
    return errorsOccured;
  }

  // Skip validation if height is 0 (height 0 will be auto)
  if (allowedWidgetHeightAuto(tab.componentType as tabComponentTypeEnum)) {
    if (Number(widget.height) === 0) {
      return errorsOccured;
    }
  }

  const minimumWidgetHeight = getMinHeightBasedOnComponentType(
    tab.componentType as tabComponentTypeEnum,
    tab.componentSubType as tabComponentSubTypeEnum,
  );

  if (widget.height < minimumWidgetHeight) {
    errorsOccured.widgetHeightError = `Die Höhe muss mehr als ${minimumWidgetHeight} betragen!`;
  }

  return errorsOccured;
}

function getMinHeightBasedOnComponentType(
  tabComponentType: tabComponentTypeEnum,
  tabComponentSubType: tabComponentSubTypeEnum,
): number {
  const largeComponentTypes = [
    tabComponentTypeEnum.diagram,
    tabComponentTypeEnum.map,
    tabComponentTypeEnum.listview,
  ];
  const mediumComponentTypes = [tabComponentTypeEnum.slider];

  if (largeComponentTypes.includes(tabComponentType)) {
    if (
      tabComponentSubType === tabComponentSubTypeEnum.degreeChart180 ||
      tabComponentSubType === tabComponentSubTypeEnum.degreeChart360
    ) {
      return 200;
    }
    return 400;
  } else if (mediumComponentTypes.includes(tabComponentType)) {
    return 200;
  } else {
    return 50;
  }
}

function allowedWidgetHeightAuto(
  tabComponentType: tabComponentTypeEnum,
): boolean {
  const allowedWidgetType = [
    tabComponentTypeEnum.information,
    tabComponentTypeEnum.value,
  ];
  if (allowedWidgetType.includes(tabComponentType)) {
    return true;
  }
  return false;
}

export function validateMapWidgetsAttributesSelected(
  widgetWithChildren: WidgetWithChildren,
): WizardErrors {
  const errorsOccured: WizardErrors = {};

  const mapWidgetValues = widgetWithChildren.tab.mapWidgetValues || [];
  const requiredAttributes = widgetWithChildren.queryConfig?.attributes || [];

  mapWidgetValues.forEach((widget) => {
    // exit checking for map widget type image and subType URL,
    // information and button
    if (
      (widget.componentType === tabComponentTypeEnum.image &&
        widget.componentSubType === widgetImageSourceEnum.url) ||
      widget.componentType === tabComponentTypeEnum.information ||
      widget.componentType === 'Button'
    ) {
      return errorsOccured;
    }

    const attr = widget.attributes;

    if (
      requiredAttributes.length > 0 &&
      (attr === undefined || attr === '' || !requiredAttributes.includes(attr))
    ) {
      errorsOccured.attributeError =
        'In Karten-Widgets ausgewählte Attribute müssen in der Abfragekonfiguration ausgewählt werden';
    }
  });

  return errorsOccured;
}

export function validateMapFilterAttributeSelected(
  widgetWithChildren: WidgetWithChildren,
): WizardErrors {
  const errorsOccured: WizardErrors = {};

  const mapFilterAttribute = widgetWithChildren.tab.mapFilterAttribute || '';
  const requiredAttributes = widgetWithChildren.queryConfig?.attributes || [];

  if (!mapFilterAttribute) {
    errorsOccured.mapFilterAttributeError = 'Filterattribut ist erforderlich!';
    return errorsOccured;
  }

  if (!requiredAttributes.includes(mapFilterAttribute)) {
    errorsOccured.attributeError =
      'Im Filterattribut ausgewähltes Attribut muss in der Abfragekonfiguration ausgewählt werden';
  }

  return errorsOccured;
}
