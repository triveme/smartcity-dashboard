import { CorporateInfo, menuArrowDirectionEnum } from '@/types';
import { useState } from 'react';

const initialWizardState: CorporateInfo = {
  dashboardFontColor: '#fff',
  dashboardPrimaryColor: '#2B3244',
  dashboardSecondaryColor: '#2B3244',
  dashboardHeadlineFontSize: '24px',
  fontColor: '#fff',
  fontFamily: 'Arial',
  headerFontColor: '#fff',
  headerPrimaryColor: '#3D4760',
  headerSecondaryColor: '#3D4760',
  headerTitleAdmin: 'SmartCity Management',
  headerTitleDashboards: 'SmartCity Dashboards',
  menuActiveColor: '#3D4760',
  menuActiveFontColor: '#fff',
  menuArrowDirection: menuArrowDirectionEnum.TopDown,
  menuCornerColor: '#3D4760',
  menuCornerFontColor: '#fff',
  menuFontColor: '#fff',
  menuHoverColor: '#3D4760',
  menuPrimaryColor: '#3D4760',
  menuSecondaryColor: '#1d2330',
  useColorTransitionHeader: false,
  useColorTransitionMenu: false,
  panelBorderColor: '#3D4760',
  panelBorderRadius: '4px',
  panelBorderSize: '4px',
  panelFontColor: '#fff',
  panelHeadlineFontSize: '24px',
  panelPrimaryColor: '#3D4760',
  panelSecondaryColor: '#3D4760',
  scrollbarColor: '#3D4760',
  scrollbarBackground: '#3D4760',
  saveButtonColor: '#91D9FF',
  saveHoverButtonColor: '#82C3E5',
  cancelButtonColor: '#8388A4',
  cancelHoverButtonColor: '#6C7188',
  showHeaderLogo: true,
  showMenuLogo: true,
  titleBar: 'name',
  widgetBorderColor: '#3D4760',
  widgetBorderRadius: '4px',
  widgetBorderSize: '4px',
  widgetFontColor: '#fff',
  widgetHeadlineFontSize: '16px',
  widgetSubheadlineFontSize: '14px',
  widgetPrimaryColor: '#3D4760',
  widgetSecondaryColor: '#3D4760',
  sidebarLogos: [],

  informationTextFontSize: '11',
  informationTextFontColor: '#3D4760',
  iconWithLinkFontSize: '11',
  iconWithLinkFontColor: '#3D4760',
  iconWithLinkIconSize: '11',
  iconWithLinkIconColor: '#3D4760',
  isPanelHeadlineBold: true,
  isWidgetHeadlineBold: true,

  degreeChart180FontSize: '11',
  degreeChart180FontColor: '#3D4760',
  degreeChart180BgColor: '#3D4760',
  degreeChart180FillColor: '#3D4760',
  degreeChart180UnitFontSize: '30',

  degreeChart360FontSize: '11',
  degreeChart360FontColor: '#3D4760',
  degreeChart360BgColor: '#3D4760',
  degreeChart360FillColor: '#3D4760',
  degreeChart360UnitFontSize: '11',

  sliderCurrentFontColor: '#000000',
  sliderMaximumFontColor: '#FFFFFF',
  sliderGeneralFontColor: '#FFFFFF',
  sliderCurrentColor: '#DC2626',
  sliderMaximumColor: '#000000',

  stageableChartTicksFontSize: '11',
  stageableChartTicksFontColor: '#3D4760',
  stageableChartFontSize: '11',
  stageableChartFontColor: '#3D4760',

  pieChartFontSize: '11',
  pieChartFontColor: '#3D4760',
  pieChartCurrentValuesColors: [
    '#4CAF50',
    '#2196F3',
    '#FF9800',
    '#F44336',
    '#9C27B0',
  ],

  lineChartAxisTicksFontSize: '11',
  lineChartAxisLabelSize: '11',
  lineChartAxisLabelFontColor: '#fffff',
  lineChartFilterColor: '#F1B434',
  lineChartFilterTextColor: '#1D2330',
  lineChartLegendFontSize: '11',
  lineChartLegendFontColor: '#FFFFF',
  lineChartTicksFontColor: '#3D4760',
  lineChartAxisLineColor: '#3D4760',
  lineChartCurrentValuesColors: ['#FFA500', '#FF4500', '#00FF00'],
  lineChartGridColor: '#3D4760',

  barChartAxisTicksFontSize: '11',
  barChartAxisLabelSize: '11',
  barChartAxisLabelFontColor: '#FFFFF',
  barChartFilterColor: '#F1B434',
  barChartFilterTextColor: '#1D2330',
  barChartLegendFontSize: '11',
  barChartLegendFontColor: '#FFFFFF',
  barChartTicksFontColor: '#3D4760',
  barChartAxisLineColor: '#3D4760',
  barChartCurrentValuesColors: ['#FFA500', '#FF4500', '#00FF00'],
  barChartGridColor: '#3D4760',

  measurementChartBigValueFontSize: '11',
  measurementChartBigValueFontColor: '#fffff',

  measurementChartTopButtonBgColor: '#fffff',
  measurementChartTopButtonInactiveBgColor: '#3D4760',
  measurementChartTopButtonHoverColor: '#3D4760',
  measurementChartTopButtonFontColor: '#fffff',

  measurementChartCardsBgColor: '#fffff',
  measurementChartCardsFontColor: '#fffff',
  measurementChartCardsIconColors: ['#3D4760', '#3D4760', '#3D4760'],

  measurementChartBarColor: '#3D4760',
  measurementChartLabelFontColor: '#3D4760',
  measurementChartGridColor: '#3D4760',
  measurementChartAxisLineColor: '#3D4760',
  measurementChartAxisTicksFontColor: '#3D4760',
  measurementChartAxisLabelFontColor: '#3D4760',
  measurementChartCurrentValuesColors: [
    '#0000FF',
    '#0000FF',
    '#0000FF',
    '#0000FF',
    '#0000FF',
    '#0000FF',
    '#0000FF',
    '#0000FF',
    '#0000FF',
    '#0000FF',
  ],

  coloredSliderBigValueFontSize: '11',
  coloredSliderBigValueFontColor: '#3D4760',
  coloredSliderLabelFontSize: '11',
  coloredSliderLabelFontColor: '#3D4760',
  coloredSliderArrowColor: '#3D4760',
  coloredSliderUnitFontSize: '11',

  wertFontSize: '20',
  wertUnitFontSize: '15',
  wertFontColor: '#FFFFF',

  weatherWarningBgColor: '#3D4760',
  weatherWarningHeadlineColor: '#E74C3C',
  weatherInstructionsColor: '#000000',
  weatherAlertDescriptionColor: '#000000',
  weatherDateColor: '#FFFFF',
  weatherWarningButtonBackgroundColor: '#2C3E50',
  weatherWarningButtonIconColor: '#FFFFF',
};

type UseWizardStateReturn = {
  state: CorporateInfo;
  updateState: <K extends keyof CorporateInfo>(
    key: K,
    value: CorporateInfo[K],
  ) => void;
};

const useWizardState = (): UseWizardStateReturn => {
  const [state, setState] = useState<CorporateInfo>(initialWizardState);

  const updateState = <K extends keyof CorporateInfo>(
    key: K,
    value: CorporateInfo[K],
  ): void => {
    setState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  return { state, updateState };
};

export default useWizardState;
