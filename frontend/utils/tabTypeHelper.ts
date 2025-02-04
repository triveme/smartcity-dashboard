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
