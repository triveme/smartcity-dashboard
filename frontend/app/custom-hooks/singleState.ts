import { CorporateInfo } from '@/types';
import { useState } from 'react';

const initialWizardState: CorporateInfo = {
  dashboardFontColor: '#fff',
  dashboardPrimaryColor: '#2B3244',
  dashboardSecondaryColor: '#2B3244',
  fontColor: '#fff',
  fontFamily: 'Arial',
  headerFontColor: '#fff',
  headerPrimaryColor: '#3D4760',
  headerSecondaryColor: '#3D4760',
  headerTitleAdmin: 'SmartCity Management',
  headerTitleDashboards: 'SmartCity Dashboards',
  menuActiveColor: '#3D4760',
  menuActiveFontColor: '#fff',
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
  widgetPrimaryColor: '#3D4760',
  widgetSecondaryColor: '#3D4760',
  sidebarLogos: [],
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
