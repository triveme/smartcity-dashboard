import { Widget, WidgetWithChildren, tabComponentTypeEnum } from '@/types';
import { WizardErrors } from '@/types/errors';
import { validateTab } from './tabValidator';
import { validateQueryConfig } from './queryConfigValidator';

export function validateWidgetWithChildren(
  widgetWithChildren: WidgetWithChildren,
): WizardErrors {
  let errorsOccured: WizardErrors = validateWidget(widgetWithChildren.widget);
  errorsOccured = { ...errorsOccured, ...validateTab(widgetWithChildren.tab) };
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
  if (!widget.height)
    errorsOccured.widgetHeightError = 'Höhe muss ausgefüllt werden!';
  if (widget.height && widget.height < 400)
    errorsOccured.widgetHeightError = 'Die Höhe muss mehr als 400 betragen!';
  if (widget.visibility === 'protected') {
    if (widget.readRoles.length === 0)
      errorsOccured.readRolesError = 'Leserechte müssen ausgefüllt werden!';
    if (widget.writeRoles.length === 0)
      errorsOccured.writeRolesError =
        'Schreibberechtigungen müssen ausgefüllt sein!';
  }
  return errorsOccured;
}

export function validateMapWidgetsAttributesSelected(
  widgetWithChildren: WidgetWithChildren,
): WizardErrors {
  const errorsOccured: WizardErrors = {};

  const mapWidgetValues = widgetWithChildren.tab.mapWidgetValues || [];
  const requiredAttributes = widgetWithChildren.queryConfig?.attributes || [];

  mapWidgetValues.forEach((widget) => {
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
