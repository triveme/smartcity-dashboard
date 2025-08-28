import { Dispatch, JSX, SetStateAction, useEffect, useState } from 'react';

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
import ComponentsCiWizard from './ComponentsCiWizard';

type Props = {
  corporateInfo: CorporateInfo | undefined;
  state: ReturnType<typeof useWizardState>['state'];
  updateState: ReturnType<typeof useWizardState>['updateState'];
  headerLogoId: string | null;
  setHeaderLogoId: Dispatch<SetStateAction<string | null>>;
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
    { name: 'Component', icon: 'Cogs', size: 'sm' },
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
            corporateInfo={corporateInfo}
            titleBar={state.titleBar}
            setTitleBar={(value): void => updateState('titleBar', value)}
            menuCornerColor={state.menuCornerColor}
            setMenuCornerColor={(value): void =>
              updateState('menuCornerColor', value)
            }
            menuCornerFontColor={state.menuCornerFontColor}
            setMenuCornerFontColor={(value): void =>
              updateState('menuCornerFontColor', value)
            }
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
            menuFontColor={state.menuFontColor}
            setMenuFontColor={(color): void =>
              updateState('menuFontColor', color)
            }
            menuHoverColor={state.menuHoverColor}
            setMenuHoverColor={(color): void =>
              updateState('menuHoverColor', color)
            }
            menuHoverFontColor={state.menuHoverFontColor}
            setMenuHoverFontColor={(color): void =>
              updateState('menuHoverFontColor', color)
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
            menuArrowDirection={state.menuArrowDirection}
            setMenuArrowDirection={(direction): void =>
              updateState('menuArrowDirection', direction)
            }
            errors={errors}
            borderColor={corporateInfo?.panelBorderColor || '#2B3244'}
            backgroundColor={corporateInfo?.dashboardPrimaryColor || '#2B3244'}
            iconColor={corporateInfo?.dashboardFontColor || '#fff'}
            showInfoButtonsOnMobile={state.showInfoButtonsOnMobile}
            setShowInfoButtonsOnMobile={(value): void =>
              updateState('showInfoButtonsOnMobile', value)
            }
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
            dashboardHeadlineFontSize={state.dashboardHeadlineFontSize}
            setDashboardHeadlineFontSize={(value): void =>
              updateState('dashboardHeadlineFontSize', value)
            }
            iconColor={corporateInfo?.dashboardFontColor || '#fff'}
            borderColor={corporateInfo?.panelBorderColor || '#2B3244'}
            backgroundColor={corporateInfo?.dashboardPrimaryColor || '#2B3244'}
            dashboardInformationTextFontColor={
              corporateInfo?.informationTextFontColor || '#FFFFFF'
            }
            dashboardInformationTextFontSize={
              corporateInfo?.informationTextFontSize || '11px'
            }
            setDashboardInformationTextFontColor={(fontColor): void =>
              updateState('informationTextFontColor', fontColor)
            }
            setDashboardInformationTextFontSize={(fontSize): void =>
              updateState('informationTextFontSize', fontSize)
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
            panelBorderRadius={state.panelBorderRadius}
            setPanelBorderRadius={(value): void =>
              updateState('panelBorderRadius', value)
            }
            panelHeadlineFontSize={state.panelHeadlineFontSize}
            setPanelHeadlineFontSize={(value): void =>
              updateState('panelHeadlineFontSize', value)
            }
            isPanelHeadlineBold={state.isPanelHeadlineBold}
            setIsPanelHeadlineBold={(value): void =>
              updateState('isPanelHeadlineBold', value)
            }
            iconColor={corporateInfo?.dashboardFontColor || '#fff'}
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
            widgetHeadlineFontSize={state.widgetHeadlineFontSize}
            setWidgetHeadlineFontSize={(value): void =>
              updateState('widgetHeadlineFontSize', value)
            }
            widgetSubheadlineFontSize={state.widgetSubheadlineFontSize}
            setWidgetSubheadlineFontSize={(value): void =>
              updateState('widgetSubheadlineFontSize', value)
            }
            isWidgetHeadlineBold={state.isWidgetHeadlineBold}
            setIsWidgetHeadlineBold={(value): void =>
              updateState('isWidgetHeadlineBold', value)
            }
            iconColor={corporateInfo?.dashboardFontColor || '#fff'}
            borderColor={corporateInfo?.panelBorderColor || '#2B3244'}
            backgroundColor={corporateInfo?.dashboardPrimaryColor || '#2B3244'}
          />
        )}
        {activeTab === 'Component' && (
          <ComponentsCiWizard
            informationTextFontSize={state.informationTextFontSize}
            setInformationTextFontSize={(value): void =>
              updateState('informationTextFontSize', value)
            }
            informationTextFontColor={state.informationTextFontColor}
            setInformationTextFontColor={(value): void =>
              updateState('informationTextFontColor', value)
            }
            iconWithLinkFontSize={state.iconWithLinkFontSize}
            setIconWithLinkFontSize={(value): void =>
              updateState('iconWithLinkFontSize', value)
            }
            iconWithLinkFontColor={state.iconWithLinkFontColor}
            setIconWithLinkFontColor={(value): void =>
              updateState('iconWithLinkFontColor', value)
            }
            iconWithLinkIconSize={state.iconWithLinkIconSize}
            setIconWithLinkIconSize={(value): void =>
              updateState('iconWithLinkIconSize', value)
            }
            iconWithLinkIconColor={state.iconWithLinkIconColor}
            setIconWithLinkIconColor={(value): void =>
              updateState('iconWithLinkIconColor', value)
            }
            degreeChart180FontSize={state.degreeChart180FontSize}
            setDegreeChart180FontSize={(value): void =>
              updateState('degreeChart180FontSize', value)
            }
            degreeChart180FontColor={state.degreeChart180FontColor}
            setDegreeChart180FontColor={(value): void =>
              updateState('degreeChart180FontColor', value)
            }
            degreeChart180BgColor={state.degreeChart180BgColor}
            setDegreeChart180BgColor={(value): void =>
              updateState('degreeChart180BgColor', value)
            }
            degreeChart180FillColor={state.degreeChart180FillColor}
            setDegreeChart180FillColor={(value): void =>
              updateState('degreeChart180FillColor', value)
            }
            degreeChart180UnitFontSize={state.degreeChart180UnitFontSize}
            setDegreeChart180UnitFontSize={(value): void =>
              updateState('degreeChart180UnitFontSize', value)
            }
            degreeChart360FontSize={state.degreeChart360FontSize}
            setDegreeChart360FontSize={(value): void =>
              updateState('degreeChart360FontSize', value)
            }
            degreeChart360FontColor={state.degreeChart360FontColor}
            setDegreeChart360FontColor={(value): void =>
              updateState('degreeChart360FontColor', value)
            }
            degreeChart360BgColor={state.degreeChart360BgColor}
            setDegreeChart360BgColor={(value): void =>
              updateState('degreeChart360BgColor', value)
            }
            degreeChart360FillColor={state.degreeChart360FillColor}
            setDegreeChart360FillColor={(value): void =>
              updateState('degreeChart360FillColor', value)
            }
            degreeChart360UnitFontSize={state.degreeChart360UnitFontSize}
            setDegreeChart360UnitFontSize={(value): void =>
              updateState('degreeChart360UnitFontSize', value)
            }
            sliderCurrentFontColor={state.sliderCurrentFontColor}
            setSliderCurrentFontColor={(value): void =>
              updateState('sliderCurrentFontColor', value)
            }
            sliderMaximumFontColor={state.sliderMaximumFontColor}
            setSliderMaximumFontColor={(value): void =>
              updateState('sliderMaximumFontColor', value)
            }
            sliderGeneralFontColor={state.sliderGeneralFontColor}
            setSliderGeneralFontColor={(value): void =>
              updateState('sliderGeneralFontColor', value)
            }
            sliderCurrentColor={state.sliderCurrentColor}
            setSliderCurrentColor={(value): void =>
              updateState('sliderCurrentColor', value)
            }
            sliderMaximumColor={state.sliderMaximumColor}
            setsliderMaximumColor={(value): void =>
              updateState('sliderMaximumColor', value)
            }
            stageableChartTicksFontSize={state.stageableChartTicksFontSize}
            setStageableChartTicksFontSize={(value): void =>
              updateState('stageableChartTicksFontSize', value)
            }
            stageableChartTicksFontColor={state.stageableChartTicksFontColor}
            setStageableChartTicksFontColor={(value): void =>
              updateState('stageableChartTicksFontColor', value)
            }
            stageableChartFontSize={state.stageableChartFontSize}
            setStageableChartFontSize={(value): void =>
              updateState('stageableChartFontSize', value)
            }
            stageableChartFontColor={state.stageableChartFontColor}
            setStageableChartFontColor={(value): void =>
              updateState('stageableChartFontColor', value)
            }
            pieChartFontSize={state.pieChartFontSize}
            setPieChartFontSize={(value): void =>
              updateState('pieChartFontSize', value)
            }
            pieChartFontColor={state.pieChartFontColor}
            setPieChartFontColor={(value): void =>
              updateState('pieChartFontColor', value)
            }
            pieChartCurrentValuesColors={state.pieChartCurrentValuesColors}
            setPieChartCurrentValuesColors={(value): void =>
              updateState('pieChartCurrentValuesColors', value)
            }
            lineChartAxisTicksFontSize={state.lineChartAxisTicksFontSize}
            setLineChartAxisTicksFontSize={(value): void =>
              updateState('lineChartAxisTicksFontSize', value)
            }
            lineChartAxisLabelSize={state.lineChartAxisLabelSize}
            setLineChartAxisLabelSize={(value): void =>
              updateState('lineChartAxisLabelSize', value)
            }
            lineChartAxisLabelFontColor={state.lineChartAxisLabelFontColor}
            setLineChartAxisLabelFontColor={(value): void =>
              updateState('lineChartAxisLabelFontColor', value)
            }
            lineChartLegendFontSize={state.lineChartLegendFontSize}
            setLineChartLegendFontSize={(value): void =>
              updateState('lineChartLegendFontSize', value)
            }
            lineChartLegendFontColor={state.lineChartLegendFontColor}
            setLineChartLegendFontColor={(value): void =>
              updateState('lineChartLegendFontColor', value)
            }
            lineChartTicksFontColor={state.lineChartTicksFontColor}
            setLineChartTicksFontColor={(value): void =>
              updateState('lineChartTicksFontColor', value)
            }
            lineChartAxisLineColor={state.lineChartAxisLineColor}
            setLineChartAxisLineColor={(value): void =>
              updateState('lineChartAxisLineColor', value)
            }
            lineChartFilterColor={state.lineChartFilterColor}
            setLineChartFilterColor={(value): void =>
              updateState('lineChartFilterColor', value)
            }
            lineChartFilterTextColor={state.lineChartFilterTextColor}
            setLineChartFilterTextColor={(value): void =>
              updateState('lineChartFilterTextColor', value)
            }
            lineChartCurrentValuesColors={state.lineChartCurrentValuesColors}
            setLineChartCurrentValuesColors={(value): void =>
              updateState('lineChartCurrentValuesColors', value)
            }
            lineChartGridColor={state.lineChartGridColor}
            setLineChartGridColor={(value): void =>
              updateState('lineChartGridColor', value)
            }
            barChartAxisTicksFontSize={state.barChartAxisTicksFontSize}
            setBarChartAxisTicksFontSize={(value): void =>
              updateState('barChartAxisTicksFontSize', value)
            }
            barChartAxisLabelSize={state.barChartAxisLabelSize}
            setBarChartAxisLabelSize={(value): void =>
              updateState('barChartAxisLabelSize', value)
            }
            barChartAxisLabelFontColor={state.barChartAxisLabelFontColor}
            setBarChartAxisLabelFontColor={(value): void =>
              updateState('barChartAxisLabelFontColor', value)
            }
            barChartFilterColor={state.barChartFilterColor}
            setBarChartFilterColor={(value): void =>
              updateState('barChartFilterColor', value)
            }
            barChartFilterTextColor={state.barChartFilterTextColor}
            setBarChartFilterTextColor={(value): void =>
              updateState('barChartFilterTextColor', value)
            }
            barChartLegendFontSize={state.barChartLegendFontSize}
            setBarChartLegendFontSize={(value): void =>
              updateState('barChartLegendFontSize', value)
            }
            barChartLegendFontColor={state.barChartLegendFontColor}
            setBarChartLegendFontColor={(value): void =>
              updateState('barChartLegendFontColor', value)
            }
            barChartTicksFontColor={state.barChartTicksFontColor}
            setBarChartTicksFontColor={(value): void =>
              updateState('barChartTicksFontColor', value)
            }
            barChartAxisLineColor={state.barChartAxisLineColor}
            setBarChartAxisLineColor={(value): void =>
              updateState('barChartAxisLineColor', value)
            }
            barChartCurrentValuesColors={state.barChartCurrentValuesColors}
            setBarChartCurrentValuesColors={(value): void =>
              updateState('barChartCurrentValuesColors', value)
            }
            barChartGridColor={state.barChartGridColor}
            setBarChartGridColor={(value): void =>
              updateState('barChartGridColor', value)
            }
            measurementChartBigValueFontSize={
              state.measurementChartBigValueFontSize
            }
            setMeasurementChartBigValueFontSize={(value): void =>
              updateState('measurementChartBigValueFontSize', value)
            }
            measurementChartBigValueFontColor={
              state.measurementChartBigValueFontColor
            }
            setMeasurementChartBigValueFontColor={(value): void =>
              updateState('measurementChartBigValueFontColor', value)
            }
            measurementChartTopButtonBgColor={
              state.measurementChartTopButtonBgColor
            }
            setMeasurementChartTopButtonBgColor={(value): void =>
              updateState('measurementChartTopButtonBgColor', value)
            }
            measurementChartTopButtonInactiveBgColor={
              state.measurementChartTopButtonInactiveBgColor
            }
            setMeasurementChartTopButtonInactiveBgColor={(value): void =>
              updateState('measurementChartTopButtonInactiveBgColor', value)
            }
            measurementChartTopButtonhHeaderSecondaryColor={
              state.headerSecondaryColor
            }
            measurementChartTopButtonHoverColor={
              state.measurementChartTopButtonHoverColor
            }
            setMeasurementChartTopButtonHoverColor={(value): void =>
              updateState('measurementChartTopButtonHoverColor', value)
            }
            measurementChartTopButtonFontColor={
              state.measurementChartTopButtonFontColor
            }
            setMeasurementChartTopButtonFontColor={(value): void =>
              updateState('measurementChartTopButtonFontColor', value)
            }
            measurementChartCardsBgColor={state.measurementChartCardsBgColor}
            setMeasurementChartCardsBgColor={(value): void =>
              updateState('measurementChartCardsBgColor', value)
            }
            measurementChartCardsFontColor={
              state.measurementChartCardsFontColor
            }
            setMeasurementChartCardsFontColor={(value): void =>
              updateState('measurementChartCardsFontColor', value)
            }
            measurementChartCardsIconColors={
              state.measurementChartCardsIconColors
            }
            setMeasurementChartCardsIconColors={(value): void =>
              updateState('measurementChartCardsIconColors', value)
            }
            measurementChartBarColor={state.measurementChartBarColor}
            setMeasurementChartBarColor={(value): void =>
              updateState('measurementChartBarColor', value)
            }
            measurementChartLabelFontColor={
              state.measurementChartLabelFontColor
            }
            setMeasurementChartLabelFontColor={(value): void =>
              updateState('measurementChartLabelFontColor', value)
            }
            measurementChartGridColor={state.measurementChartGridColor}
            setMeasurementChartGridColor={(value): void =>
              updateState('measurementChartGridColor', value)
            }
            measurementChartAxisLineColor={state.measurementChartAxisLineColor}
            setMeasurementChartAxisLineColor={(value): void =>
              updateState('measurementChartAxisLineColor', value)
            }
            measurementChartAxisTicksFontColor={
              state.measurementChartAxisTicksFontColor
            }
            setMeasurementChartAxisTicksFontColor={(value): void =>
              updateState('measurementChartAxisTicksFontColor', value)
            }
            measurementChartAxisLabelFontColor={
              state.measurementChartAxisLabelFontColor
            }
            setMeasurementChartAxisLabelFontColor={(value): void =>
              updateState('measurementChartAxisLabelFontColor', value)
            }
            measurementChartCurrentValuesColors={
              state.measurementChartCurrentValuesColors
            }
            setMeasurementChartCurrentValuesColors={(value): void =>
              updateState('measurementChartCurrentValuesColors', value)
            }
            coloredSliderBigValueFontSize={state.coloredSliderBigValueFontSize}
            setColoredSliderBigValueFontSize={(value): void =>
              updateState('coloredSliderBigValueFontSize', value)
            }
            coloredSliderBigValueFontColor={
              state.coloredSliderBigValueFontColor
            }
            setColoredSliderBigValueFontColor={(value): void =>
              updateState('coloredSliderBigValueFontColor', value)
            }
            coloredSliderLabelFontSize={state.coloredSliderLabelFontSize}
            setColoredSliderLabelFontSize={(value): void =>
              updateState('coloredSliderLabelFontSize', value)
            }
            coloredSliderLabelFontColor={state.coloredSliderLabelFontColor}
            setColoredSliderLabelFontColor={(value): void =>
              updateState('coloredSliderLabelFontColor', value)
            }
            coloredSliderArrowColor={state.coloredSliderArrowColor}
            setColoredSliderArrowColor={(value): void =>
              updateState('coloredSliderArrowColor', value)
            }
            coloredSliderUnitFontSize={state.coloredSliderUnitFontSize}
            setColoredSliderUnitFontSize={(value): void =>
              updateState('coloredSliderUnitFontSize', value)
            }
            wertFontSize={state.wertFontSize}
            setWertFontSize={(value): void =>
              updateState('wertFontSize', value)
            }
            wertUnitFontSize={state.wertUnitFontSize}
            setWertUnitFontSize={(value): void =>
              updateState('wertUnitFontSize', value)
            }
            wertFontColor={state.wertFontColor}
            setWertFontColor={(value): void =>
              updateState('wertFontColor', value)
            }
            iconColor={corporateInfo?.dashboardFontColor || '#fff'}
            borderColor={corporateInfo?.panelBorderColor || '#2B3244'}
            backgroundColor={corporateInfo?.dashboardPrimaryColor || '#2B3244'}
            weatherWarningBgColor={
              corporateInfo?.weatherWarningBgColor || '#3D4760'
            }
            setWeatherWarningBgColor={function (color: string): void {
              updateState('weatherWarningBgColor', color);
            }}
            weatherWarningHeadlineColor={
              corporateInfo?.weatherWarningHeadlineColor || '#E74C3C'
            }
            setWeatherWarningHeadlineColor={function (color: string): void {
              updateState('weatherWarningHeadlineColor', color);
            }}
            weatherInstructionsColor={
              corporateInfo?.weatherInstructionsColor || '#000000'
            }
            setWeatherInstructionsColor={function (color: string): void {
              updateState('weatherInstructionsColor', color);
            }}
            weatherAlertDescriptionColor={
              corporateInfo?.weatherAlertDescriptionColor || '#000000'
            }
            setWeatherAlertDescriptionColor={function (color: string): void {
              updateState('weatherAlertDescriptionColor', color);
            }}
            weatherDateColor={corporateInfo?.weatherDateColor || '#FFFFFF'}
            setWeatherDateColor={function (color: string): void {
              updateState('weatherDateColor', color);
            }}
            weatherWarningButtonBackgroundColor={
              corporateInfo?.weatherWarningButtonBackgroundColor || '#2C3E50'
            }
            setWeatherWarningButtonBackgroundColor={function (
              color: string,
            ): void {
              updateState('weatherWarningButtonBackgroundColor', color);
            }}
            weatherWarningButtonIconColor={
              corporateInfo?.weatherWarningButtonIconColor || '#FFFFFF'
            }
            setWeatherWarningButtonIconColor={function (color: string): void {
              updateState('weatherWarningButtonIconColor', color);
            }}
            // ListView
            listviewBackgroundColor={state.listviewBackgroundColor}
            setListviewBackgroundColor={(value): void =>
              updateState('listviewBackgroundColor', value)
            }
            listviewItemBackgroundColor={state.listviewItemBackgroundColor}
            setListviewItemBackgroundColor={(value): void =>
              updateState('listviewItemBackgroundColor', value)
            }
            listviewItemBorderColor={state.listviewItemBorderColor}
            setListviewItemBorderColor={(value): void =>
              updateState('listviewItemBorderColor', value)
            }
            listviewItemBorderRadius={state.listviewItemBorderRadius}
            setListviewItemBorderRadius={(value): void =>
              updateState('listviewItemBorderRadius', value)
            }
            listviewItemBorderSize={state.listviewItemBorderSize}
            setListviewItemBorderSize={(value): void =>
              updateState('listviewItemBorderSize', value)
            }
            listviewTitleFontColor={state.listviewTitleFontColor}
            setListviewTitleFontColor={(value): void =>
              updateState('listviewTitleFontColor', value)
            }
            listviewTitleFontSize={state.listviewTitleFontSize}
            setListviewTitleFontSize={(value): void =>
              updateState('listviewTitleFontSize', value)
            }
            listviewTitleFontWeight={state.listviewTitleFontWeight}
            setListviewTitleFontWeight={(value): void =>
              updateState('listviewTitleFontWeight', value)
            }
            listviewDescriptionFontColor={state.listviewDescriptionFontColor}
            setListviewDescriptionFontColor={(value): void =>
              updateState('listviewDescriptionFontColor', value)
            }
            listviewDescriptionFontSize={state.listviewDescriptionFontSize}
            setListviewDescriptionFontSize={(value): void =>
              updateState('listviewDescriptionFontSize', value)
            }
            listviewCounterFontColor={state.listviewCounterFontColor}
            setListviewCounterFontColor={(value): void =>
              updateState('listviewCounterFontColor', value)
            }
            listviewCounterFontSize={state.listviewCounterFontSize}
            setListviewCounterFontSize={(value): void =>
              updateState('listviewCounterFontSize', value)
            }
            listviewFilterButtonBackgroundColor={
              state.listviewFilterButtonBackgroundColor
            }
            setListviewFilterButtonBackgroundColor={(value): void =>
              updateState('listviewFilterButtonBackgroundColor', value)
            }
            listviewFilterButtonBorderColor={
              state.listviewFilterButtonBorderColor
            }
            setListviewFilterButtonBorderColor={(value): void =>
              updateState('listviewFilterButtonBorderColor', value)
            }
            listviewFilterButtonFontColor={state.listviewFilterButtonFontColor}
            setListviewFilterButtonFontColor={(value): void =>
              updateState('listviewFilterButtonFontColor', value)
            }
            listviewFilterButtonHoverBackgroundColor={
              state.listviewFilterButtonHoverBackgroundColor
            }
            setListviewFilterButtonHoverBackgroundColor={(value): void =>
              updateState('listviewFilterButtonHoverBackgroundColor', value)
            }
            listviewArrowIconColor={state.listviewArrowIconColor}
            setListviewArrowIconColor={(value): void =>
              updateState('listviewArrowIconColor', value)
            }
            listviewBackButtonBackgroundColor={
              state.listviewBackButtonBackgroundColor
            }
            setListviewBackButtonBackgroundColor={(value): void =>
              updateState('listviewBackButtonBackgroundColor', value)
            }
            listviewBackButtonHoverBackgroundColor={
              state.listviewBackButtonHoverBackgroundColor
            }
            setListviewBackButtonHoverBackgroundColor={(value): void =>
              updateState('listviewBackButtonHoverBackgroundColor', value)
            }
            listviewBackButtonFontColor={state.listviewBackButtonFontColor}
            setListviewBackButtonFontColor={(value): void =>
              updateState('listviewBackButtonFontColor', value)
            }
            listviewMapButtonBackgroundColor={
              state.listviewMapButtonBackgroundColor
            }
            setListviewMapButtonBackgroundColor={(value): void =>
              updateState('listviewMapButtonBackgroundColor', value)
            }
            listviewMapButtonHoverBackgroundColor={
              state.listviewMapButtonHoverBackgroundColor
            }
            setListviewMapButtonHoverBackgroundColor={(value): void =>
              updateState('listviewMapButtonHoverBackgroundColor', value)
            }
            listviewMapButtonFontColor={state.listviewMapButtonFontColor}
            setListviewMapButtonFontColor={(value): void =>
              updateState('listviewMapButtonFontColor', value)
            }
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
