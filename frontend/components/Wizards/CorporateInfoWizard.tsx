import { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { CorporateInfo, SidebarLogo } from '@/types';
import SaveButton from '@/ui/Buttons/SaveButton';
import PageHeadline from '@/ui/PageHeadline';
import HorizontalDivider from '@/ui/HorizontalDivider';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import { WizardErrors } from '@/types/errors';
import LayoutCiWizard from './LayoutCiWizard';
import DashboardCiWizard from './DashboardCiWizard';
import PanelCiWizard from './PanelCiWizard';
import WidgetCiWizard from './WidgetCiWizard';
import LogoCiWizard from './LogoCiWizard';
import FontCiWizard from './FontCiWizard';
import useWizardState from '../../app/custom-hooks/singleState';
import { SizeProp } from '@fortawesome/fontawesome-svg-core';

type Props = {
  corporateInfo: CorporateInfo | undefined;
  state: ReturnType<typeof useWizardState>['state'];
  updateState: ReturnType<typeof useWizardState>['updateState'];
  headerLogoId: string | undefined;
  setHeaderLogoId: Dispatch<SetStateAction<string | undefined>>;
  sidebarLogos: SidebarLogo[];
  setSidebarLogos: Dispatch<SetStateAction<SidebarLogo[]>>;
  errors: WizardErrors | undefined;
  handleSaveCorporateInfoClick: () => void;
};

type Tab = {
  name: string;
  icon: string;
  size?: SizeProp;
};
type TabsArray = Tab[];

export default function CorporateInfoWizard({
  corporateInfo,
  state,
  updateState,
  headerLogoId,
  setHeaderLogoId,
  sidebarLogos,
  setSidebarLogos,
  errors,
  handleSaveCorporateInfoClick,
}: Props): JSX.Element {
  const [activeTab, setActiveTab] = useState('Layout');
  const tabsArray: TabsArray = [
    { name: 'Layout', icon: 'Clone', size: 'sm' },
    { name: 'Dashboard', icon: 'Bar', size: 'sm' },
    { name: 'Panel', icon: 'File', size: 'sm' },
    { name: 'Widget', icon: 'Gear', size: 'sm' },
    { name: 'Logo', icon: 'Image', size: 'sm' },
    { name: 'Schriftarten', icon: 'Font', size: 'sm' }, // Fonts
  ];

  useEffect(() => {
    if (errors && errors.titleError) {
      setActiveTab(tabsArray[0].name);
    }
  }, [errors]);

  return (
    <div className="flex flex-col h-full">
      <PageHeadline
        headline="Corporate Identity"
        fontColor={corporateInfo?.dashboardFontColor}
      />
      <div className="w-full">
        <div className="flex justify-between w-full">
          <div className="flex flex-row">
            {tabsArray.map((tab) => {
              return (
                <div
                  key={tab.name}
                  className={`px-4 py-2 cursor-pointer flex flex-row items-center rounded-lg`}
                  onClick={(): void => setActiveTab(tab.name)}
                  style={{
                    background:
                      activeTab === tab.name
                        ? corporateInfo?.headerPrimaryColor
                        : 'transparent',
                    color: corporateInfo?.dashboardFontColor || '#fff',
                  }}
                >
                  <div className="mr-2">
                    <DashboardIcons
                      iconName={tab.icon}
                      color={corporateInfo?.dashboardFontColor || '#fff'}
                      size={tab.size}
                    />
                  </div>
                  {tab.name}
                </div>
              );
            })}
          </div>
          <div className="px-4 py-2">
            <SaveButton handleSaveClick={handleSaveCorporateInfoClick} />
          </div>
        </div>
      </div>
      <HorizontalDivider />
      <div
        className="w-full"
        style={{ color: corporateInfo?.dashboardFontColor }}
      >
        {activeTab === 'Layout' && (
          <LayoutCiWizard
            titleBar={state.titleBar}
            setTitleBar={(value): void => updateState('titleBar', value)}
            headerPrimaryColor={state.headerPrimaryColor}
            setHeaderPrimaryColor={(color): void =>
              updateState('headerPrimaryColor', color)
            }
            headerSecondaryColor={state.headerSecondaryColor}
            setHeaderSecondaryColor={(color): void =>
              updateState('headerSecondaryColor', color)
            }
            menuPrimaryColor={state.menuPrimaryColor}
            setMenuPrimaryColor={(color): void =>
              updateState('menuPrimaryColor', color)
            }
            menuSecondaryColor={state.menuSecondaryColor}
            setMenuSecondaryColor={(color): void =>
              updateState('menuSecondaryColor', color)
            }
            menuHoverColor={state.menuHoverColor}
            setMenuHoverColor={(color): void =>
              updateState('menuHoverColor', color)
            }
            menuActiveColor={state.menuActiveColor}
            setMenuActiveColor={(color): void =>
              updateState('menuActiveColor', color)
            }
            menuActiveFontColor={state.menuActiveFontColor}
            setMenuActiveFontColor={(color): void =>
              updateState('menuActiveFontColor', color)
            }
            useColorTransitionHeader={state.useColorTransitionHeader}
            setUseColorTransitionHeader={(value): void =>
              updateState('useColorTransitionHeader', value)
            }
            useColorTransitionMenu={state.useColorTransitionMenu}
            setUseColorTransitionMenu={(value): void =>
              updateState('useColorTransitionMenu', value)
            }
            scrollbarColor={state.scrollbarColor}
            setScrollbarColor={(color): void =>
              updateState('scrollbarColor', color)
            }
            scrollbarBackground={state.scrollbarBackground}
            setScrollbarBackground={(color): void =>
              updateState('scrollbarBackground', color)
            }
            saveButtonColor={state.saveButtonColor}
            setSaveButtonColor={(color): void =>
              updateState('saveButtonColor', color)
            }
            saveHoverButtonColor={state.saveHoverButtonColor}
            setSaveHoverButtonColor={(color): void =>
              updateState('saveHoverButtonColor', color)
            }
            cancelButtonColor={state.cancelButtonColor}
            setCancelButtonColor={(color): void =>
              updateState('cancelButtonColor', color)
            }
            cancelHoverButtonColor={state.cancelHoverButtonColor}
            setCancelHoverButtonColor={(color): void =>
              updateState('cancelHoverButtonColor', color)
            }
            errors={errors}
            borderColor={corporateInfo?.panelBorderColor || '#2B3244'}
            backgroundColor={corporateInfo?.dashboardPrimaryColor || '#2B3244'}
          />
        )}
        {activeTab === 'Dashboard' && (
          <DashboardCiWizard
            dashboardPrimaryColor={state.dashboardPrimaryColor}
            setDashboardPrimaryColor={(color): void =>
              updateState('dashboardPrimaryColor', color)
            }
            dashboardSecondaryColor={state.dashboardSecondaryColor}
            setDashboardSecondaryColor={(color): void =>
              updateState('dashboardSecondaryColor', color)
            }
          />
        )}
        {activeTab === 'Panel' && (
          <PanelCiWizard
            panelPrimaryColor={state.panelPrimaryColor}
            setPanelPrimaryColor={(color): void =>
              updateState('panelPrimaryColor', color)
            }
            panelSecondaryColor={state.panelSecondaryColor}
            setPanelSecondaryColor={(color): void =>
              updateState('panelSecondaryColor', color)
            }
            panelBorderColor={state.panelBorderColor}
            setPanelBorderColor={(color): void =>
              updateState('panelBorderColor', color)
            }
            panelBorderSize={state.panelBorderSize}
            setPanelBorderSize={(value): void =>
              updateState('panelBorderSize', value)
            }
            panelBorderRadius={state.widgetBorderRadius}
            setPanelBorderRadius={(value): void =>
              updateState('panelBorderRadius', value)
            }
            borderColor={corporateInfo?.panelBorderColor || '#2B3244'}
            backgroundColor={corporateInfo?.dashboardPrimaryColor || '#2B3244'}
          />
        )}
        {activeTab === 'Widget' && (
          <WidgetCiWizard
            widgetPrimaryColor={state.widgetPrimaryColor}
            setWidgetPrimaryColor={(color): void =>
              updateState('widgetPrimaryColor', color)
            }
            widgetSecondaryColor={state.widgetSecondaryColor}
            setWidgetSecondaryColor={(color): void =>
              updateState('widgetSecondaryColor', color)
            }
            widgetBorderColor={state.widgetBorderColor}
            setWidgetBorderColor={(color): void =>
              updateState('widgetBorderColor', color)
            }
            widgetBorderSize={state.widgetBorderSize}
            setWidgetBorderSize={(value): void =>
              updateState('widgetBorderSize', value)
            }
            widgetBorderRadius={state.widgetBorderRadius}
            setWidgetBorderRadius={(value): void =>
              updateState('widgetBorderRadius', value)
            }
            borderColor={corporateInfo?.panelBorderColor || '#2B3244'}
            backgroundColor={corporateInfo?.dashboardPrimaryColor || '#2B3244'}
          />
        )}
        {activeTab === 'Logo' && (
          <LogoCiWizard
            corporateInfo={corporateInfo}
            headerLogoId={headerLogoId}
            setHeaderLogoId={setHeaderLogoId}
            showHeaderLogo={state.showHeaderLogo}
            setShowHeaderLogo={(value): void =>
              updateState('showHeaderLogo', value)
            }
            showMenuLogo={state.showMenuLogo}
            setShowMenuLogo={(value): void =>
              updateState('showMenuLogo', value)
            }
            sidebarLogos={sidebarLogos}
            setSidebarLogos={setSidebarLogos}
          />
        )}
        {activeTab === 'Schriftarten' && (
          <FontCiWizard
            headerFontColor={state.headerFontColor}
            setHeaderFontColor={(color): void =>
              updateState('headerFontColor', color)
            }
            menuFontColor={state.menuFontColor}
            setMenuFontColor={(color): void =>
              updateState('menuFontColor', color)
            }
            dashboardFontColor={state.dashboardFontColor}
            setDashboardFontColor={(color): void =>
              updateState('dashboardFontColor', color)
            }
            panelFontColor={state.panelFontColor}
            setPanelFontColor={(color): void =>
              updateState('panelFontColor', color)
            }
            widgetFontColor={state.widgetFontColor}
            setWidgetFontColor={(color): void =>
              updateState('widgetFontColor', color)
            }
            fontColor={state.fontColor}
            setFontColor={(color): void => updateState('fontColor', color)}
            fontFamily={state.fontFamily}
            setFontFamily={(fontFamily): void =>
              updateState('fontFamily', fontFamily)
            }
            dashboardPrimaryColor={
              corporateInfo?.dashboardPrimaryColor || '#2B3244'
            }
            dashboardSecondaryColor={
              corporateInfo?.dashboardSecondaryColor || '#3D4760'
            }
          />
        )}
      </div>
    </div>
  );
}
