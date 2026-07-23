import {
  Tab,
  tabComponentTypeEnum,
  tabComponentSubTypeEnum,
  TabWithCombinedWidgets,
} from '@/types';

export const isTabOfTypeCombinedWidget = (
  tab: Tab,
): tab is TabWithCombinedWidgets => {
  return (
    tab.componentType === tabComponentTypeEnum.combinedComponent ||
    (tab.componentType === tabComponentTypeEnum.map &&
      tab.componentSubType === tabComponentSubTypeEnum.combinedMap)
  );
};

export const isTabWithoutRuntimeData = (tab: Tab): boolean => {
  if (tab.componentType === tabComponentTypeEnum.information) {
    return (
      tab.componentSubType === undefined ||
      tab.componentSubType === tabComponentSubTypeEnum.text ||
      tab.componentSubType === tabComponentSubTypeEnum.iconWithLink
    );
  }

  return [
    tabComponentTypeEnum.image,
    tabComponentTypeEnum.iframe,
    tabComponentTypeEnum.pharmacy,
  ].includes(tab.componentType as tabComponentTypeEnum);
};
