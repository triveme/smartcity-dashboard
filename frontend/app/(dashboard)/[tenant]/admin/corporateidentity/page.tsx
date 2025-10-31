'use client';

import { CSSProperties, ReactElement, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import CorporateInfoWizard from '@/components/Wizards/CorporateInfoWizard';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import { CorporateInfo, SidebarLogo } from '@/types';
import {
  postCorporateInfo,
  updateCorporateInfo,
} from '@/api/corporateInfo-service';
import { WizardErrors } from '@/types/errors';
import useWizardState from '@/app/custom-hooks/singleState';
import { getTenantOfPage, isUserMatchingTenant } from '@/utils/tenantHelper';
import { getCorporateInfosWithLogos } from '@/app/actions';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import Loading from '@/app/(dashboard)/loading';

export default function CorporateIdentity(): ReactElement {
  const auth = useAuth();
  const tenant = getTenantOfPage();
  let isPageAllowed = true;

  if (tenant) {
    isPageAllowed = isUserMatchingTenant(auth.user!.access_token, tenant);
  }

  if (!isPageAllowed) {
    return (
      <div className="pl-64">Nicht authorisiert für diesen Mandanten!</div>
    );
  }

  const router = useRouter();
  const { openSnackbar } = useSnackbar();

  const [corporateInfo, setCorporateInfo] = useState<CorporateInfo>();
  const [headerLogoId, setHeaderLogoId] = useState<string | null>(null);
  const [sidebarLogos, setSidebarLogos] = useState<SidebarLogo[]>([]);

  const [errors, setErrors] = useState<WizardErrors>({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isInitDone, setIsInitDone] = useState(false);

  const { state, updateState } = useWizardState();
  // Tracking window size and adjust sidebar visibility
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = (): void => {
        setIsCollapsed(window.innerWidth < 768);
      };

      window.addEventListener('resize', handleResize);
      handleResize();
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const {
    data: fetchedCorporateInfo,
    refetch: refetchCorporateInfo,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['corporate-info'],
    queryFn: () => getCorporateInfosWithLogos(tenant),
    enabled: false,
  });

  const dashboardStyle: CSSProperties = {
    backgroundColor: fetchedCorporateInfo?.dashboardPrimaryColor || '#2B3244',
    marginLeft: isCollapsed ? '80px' : '256px',
  };

  useEffect(() => {
    if (fetchedCorporateInfo) {
      setCorporateInfo(fetchedCorporateInfo);
      setHeaderLogoId(fetchedCorporateInfo.headerLogoId || null);
      setSidebarLogos(fetchedCorporateInfo.sidebarLogos || []);
    } else {
      refetchCorporateInfo();
    }
  }, [fetchedCorporateInfo]);

  useEffect(() => {
    if (corporateInfo) {
      // LAYOUT - HEADER
      updateState('headerPrimaryColor', corporateInfo.headerPrimaryColor);
      updateState(
        'useColorTransitionHeader',
        corporateInfo.useColorTransitionHeader,
      );
      updateState('headerSecondaryColor', corporateInfo.headerSecondaryColor);
      updateState('menuCornerColor', corporateInfo.menuCornerColor);
      updateState('menuCornerFontColor', corporateInfo.menuCornerFontColor);

      // LAYOUT - MENU
      updateState('menuPrimaryColor', corporateInfo.menuPrimaryColor);
      updateState(
        'useColorTransitionMenu',
        corporateInfo.useColorTransitionMenu,
      );
      updateState('menuSecondaryColor', corporateInfo.menuSecondaryColor);
      updateState('menuFontColor', corporateInfo.menuFontColor);
      updateState('menuActiveFontColor', corporateInfo.menuActiveFontColor);
      updateState('menuHoverFontColor', corporateInfo.menuHoverFontColor);
      updateState('menuActiveColor', corporateInfo.menuActiveColor);
      updateState('menuHoverColor', corporateInfo.menuHoverColor);
      updateState('menuArrowDirection', corporateInfo.menuArrowDirection);

      // MENU - SCROLLBAR
      updateState('scrollbarColor', corporateInfo.scrollbarColor);
      updateState('scrollbarBackground', corporateInfo.scrollbarBackground);

      // MENU - BUTTONS
      updateState('saveButtonColor', corporateInfo.saveButtonColor);
      updateState('saveHoverButtonColor', corporateInfo.saveHoverButtonColor);
      updateState('cancelButtonColor', corporateInfo.cancelButtonColor);
      updateState(
        'cancelHoverButtonColor',
        corporateInfo.cancelHoverButtonColor,
      );

      // DASHBOARD
      updateState('dashboardPrimaryColor', corporateInfo.dashboardPrimaryColor);
      updateState(
        'dashboardSecondaryColor',
        corporateInfo.dashboardSecondaryColor,
      );
      updateState(
        'dashboardHeadlineFontSize',
        corporateInfo.dashboardHeadlineFontSize,
      );

      // PANEL
      updateState('panelPrimaryColor', corporateInfo.panelPrimaryColor);
      updateState('panelSecondaryColor', corporateInfo.panelSecondaryColor);
      updateState('panelBorderColor', corporateInfo.panelBorderColor);
      updateState('panelBorderSize', corporateInfo.panelBorderSize);
      updateState('panelBorderRadius', corporateInfo.panelBorderRadius);
      updateState('panelHeadlineFontSize', corporateInfo.panelHeadlineFontSize);
      updateState('isPanelHeadlineBold', corporateInfo.isPanelHeadlineBold);

      // WIDGET
      updateState('widgetPrimaryColor', corporateInfo.widgetPrimaryColor);
      updateState('widgetSecondaryColor', corporateInfo.widgetSecondaryColor);
      updateState('widgetBorderColor', corporateInfo.widgetBorderColor);
      updateState('widgetBorderSize', corporateInfo.widgetBorderSize);
      updateState('widgetBorderRadius', corporateInfo.widgetBorderRadius);
      updateState(
        'widgetHeadlineFontSize',
        corporateInfo.widgetHeadlineFontSize,
      );
      updateState(
        'widgetSubheadlineFontSize',
        corporateInfo.widgetSubheadlineFontSize,
      );
      updateState('isWidgetHeadlineBold', corporateInfo.isWidgetHeadlineBold);

      // COMPONENT - INFO TEXT
      updateState(
        'informationTextFontSize',
        corporateInfo.informationTextFontSize,
      );
      updateState(
        'informationTextFontColor',
        corporateInfo.informationTextFontColor,
      );

      // COMPONENT - INFO ICON WITH LINK
      updateState('iconWithLinkFontSize', corporateInfo.iconWithLinkFontSize);
      updateState('iconWithLinkFontColor', corporateInfo.iconWithLinkFontColor);
      updateState('iconWithLinkIconSize', corporateInfo.iconWithLinkIconSize);
      updateState('iconWithLinkIconColor', corporateInfo.iconWithLinkIconColor);

      // COMPONENT - CHART 180
      updateState(
        'degreeChart180FontSize',
        corporateInfo.degreeChart180FontSize,
      );
      updateState(
        'degreeChart180FontColor',
        corporateInfo.degreeChart180FontColor,
      );
      updateState('degreeChart180BgColor', corporateInfo.degreeChart180BgColor);
      updateState(
        'degreeChart180FillColor',
        corporateInfo.degreeChart180FillColor,
      );
      updateState(
        'degreeChart180UnitFontSize',
        corporateInfo.degreeChart180UnitFontSize,
      );

      // COMPONENT - CHART 360
      updateState(
        'degreeChart360FontSize',
        corporateInfo.degreeChart360FontSize,
      );
      updateState(
        'degreeChart360FontColor',
        corporateInfo.degreeChart360FontColor,
      );
      updateState('degreeChart360BgColor', corporateInfo.degreeChart360BgColor);
      updateState(
        'degreeChart360FillColor',
        corporateInfo.degreeChart360FillColor,
      );
      updateState(
        'degreeChart360UnitFontSize',
        corporateInfo.degreeChart360UnitFontSize,
      );

      // COMPONENT - CHART STAGEABLE
      updateState(
        'stageableChartTicksFontSize',
        corporateInfo.stageableChartTicksFontSize,
      );
      updateState(
        'stageableChartTicksFontColor',
        corporateInfo.stageableChartTicksFontColor,
      );
      updateState(
        'stageableChartFontSize',
        corporateInfo.stageableChartFontSize,
      );
      updateState(
        'stageableChartFontColor',
        corporateInfo.stageableChartFontColor,
      );

      // COMPONENT - CHART LINE
      updateState(
        'lineChartAxisTicksFontSize',
        corporateInfo.lineChartAxisTicksFontSize,
      );
      updateState(
        'lineChartAxisLabelSize',
        corporateInfo.lineChartAxisLabelSize,
      );
      updateState(
        'lineChartAxisLabelFontColor',
        corporateInfo.lineChartAxisLabelFontColor,
      );
      updateState(
        'lineChartLegendFontSize',
        corporateInfo.lineChartLegendFontSize,
      );
      updateState(
        'lineChartLegendFontColor',
        corporateInfo.lineChartLegendFontColor,
      );
      updateState(
        'lineChartTicksFontColor',
        corporateInfo.lineChartTicksFontColor,
      );
      updateState(
        'lineChartAxisLineColor',
        corporateInfo.lineChartAxisLineColor,
      );
      updateState('lineChartGridColor', corporateInfo.lineChartGridColor);
      updateState('lineChartFilterColor', corporateInfo.lineChartFilterColor);
      updateState(
        'lineChartFilterTextColor',
        corporateInfo.lineChartFilterTextColor,
      );
      updateState(
        'lineChartCurrentValuesColors',
        corporateInfo.lineChartCurrentValuesColors,
      );

      // COMPONENT - CHART BAR
      updateState(
        'barChartAxisTicksFontSize',
        corporateInfo.barChartAxisTicksFontSize,
      );
      updateState('barChartAxisLabelSize', corporateInfo.barChartAxisLabelSize);
      updateState(
        'barChartAxisLabelFontColor',
        corporateInfo.barChartAxisLabelFontColor,
      );
      updateState(
        'barChartLegendFontSize',
        corporateInfo.barChartLegendFontSize,
      );
      updateState(
        'barChartLegendFontColor',
        corporateInfo.barChartLegendFontColor,
      );
      updateState(
        'barChartTicksFontColor',
        corporateInfo.barChartTicksFontColor,
      );
      updateState(
        'barChartCurrentValuesColors',
        corporateInfo.barChartCurrentValuesColors,
      );
      updateState('barChartAxisLineColor', corporateInfo.barChartAxisLineColor);
      updateState('barChartGridColor', corporateInfo.barChartGridColor);
      updateState('barChartFilterColor', corporateInfo.barChartFilterColor);
      updateState(
        'barChartFilterTextColor',
        corporateInfo.barChartFilterTextColor,
      );

      // COMPONENT - CHART PIE
      updateState('pieChartFontSize', corporateInfo.pieChartFontSize);
      updateState('pieChartFontColor', corporateInfo.pieChartFontColor);
      updateState(
        'pieChartCurrentValuesColors',
        corporateInfo.pieChartCurrentValuesColors,
      );

      // COMPONENT - CHART MEASUREMENT
      updateState(
        'measurementChartBigValueFontSize',
        corporateInfo.measurementChartBigValueFontSize,
      );
      updateState(
        'measurementChartBigValueFontColor',
        corporateInfo.measurementChartBigValueFontColor,
      );
      updateState(
        'measurementChartTopButtonBgColor',
        corporateInfo.measurementChartTopButtonBgColor,
      );
      updateState(
        'measurementChartTopButtonInactiveBgColor',
        corporateInfo.measurementChartTopButtonInactiveBgColor,
      );
      updateState(
        'measurementChartTopButtonHoverColor',
        corporateInfo.measurementChartTopButtonHoverColor,
      );
      updateState(
        'measurementChartTopButtonFontColor',
        corporateInfo.measurementChartTopButtonFontColor,
      );
      updateState(
        'measurementChartCardsBgColor',
        corporateInfo.measurementChartCardsBgColor,
      );
      updateState(
        'measurementChartCardsFontColor',
        corporateInfo.measurementChartCardsFontColor,
      );
      updateState(
        'measurementChartCardsIconColors',
        corporateInfo.measurementChartCardsIconColors,
      );
      updateState(
        'measurementChartBarColor',
        corporateInfo.measurementChartBarColor,
      );
      updateState(
        'measurementChartLabelFontColor',
        corporateInfo.measurementChartLabelFontColor,
      );
      updateState(
        'measurementChartGridColor',
        corporateInfo.measurementChartGridColor,
      );
      updateState(
        'measurementChartAxisLineColor',
        corporateInfo.measurementChartAxisLineColor,
      );
      updateState(
        'measurementChartAxisTicksFontColor',
        corporateInfo.measurementChartAxisTicksFontColor,
      );
      updateState(
        'measurementChartAxisLabelFontColor',
        corporateInfo.measurementChartAxisLabelFontColor,
      );
      updateState(
        'measurementChartCurrentValuesColors',
        corporateInfo.measurementChartCurrentValuesColors,
      );

      // COMPONENT - SLIDER COLORED
      updateState(
        'coloredSliderBigValueFontSize',
        corporateInfo.coloredSliderBigValueFontSize,
      );
      updateState(
        'coloredSliderBigValueFontColor',
        corporateInfo.coloredSliderBigValueFontColor,
      );
      updateState(
        'coloredSliderLabelFontSize',
        corporateInfo.coloredSliderLabelFontSize,
      );
      updateState(
        'coloredSliderLabelFontColor',
        corporateInfo.coloredSliderLabelFontColor,
      );
      updateState(
        'coloredSliderArrowColor',
        corporateInfo.coloredSliderArrowColor,
      );
      updateState(
        'coloredSliderUnitFontSize',
        corporateInfo.coloredSliderUnitFontSize,
      );

      // COMPONENT - SLIDER OVERVIEW
      updateState('sliderCurrentColor', corporateInfo.sliderCurrentColor);
      updateState('sliderMaximumColor', corporateInfo.sliderMaximumColor);
      updateState(
        'sliderCurrentFontColor',
        corporateInfo.sliderCurrentFontColor,
      );
      updateState(
        'sliderMaximumFontColor',
        corporateInfo.sliderMaximumFontColor,
      );
      updateState(
        'sliderGeneralFontColor',
        corporateInfo.sliderGeneralFontColor,
      );

      // COMPONENT - WEATHER WARNING
      updateState('weatherWarningBgColor', corporateInfo.weatherWarningBgColor);
      updateState(
        'weatherWarningHeadlineColor',
        corporateInfo.weatherWarningHeadlineColor,
      );
      updateState(
        'weatherWarningButtonBackgroundColor',
        corporateInfo.weatherWarningButtonBackgroundColor,
      );
      updateState(
        'weatherWarningButtonIconColor',
        corporateInfo.weatherWarningButtonIconColor,
      );
      updateState(
        'weatherInstructionsColor',
        corporateInfo.weatherInstructionsColor,
      );
      updateState(
        'weatherAlertDescriptionColor',
        corporateInfo.weatherAlertDescriptionColor,
      );
      updateState('weatherDateColor', corporateInfo.weatherDateColor);

      // COMPONENT - VALUE
      updateState('wertFontSize', corporateInfo.wertFontSize);
      updateState('wertUnitFontSize', corporateInfo.wertUnitFontSize);
      updateState('wertFontColor', corporateInfo.wertFontSize);

      // COMPONENT - LISTVIEW
      updateState(
        'listviewBackgroundColor',
        corporateInfo.listviewBackgroundColor,
      );
      updateState(
        'listviewItemBackgroundColor',
        corporateInfo.listviewItemBackgroundColor,
      );
      updateState(
        'listviewItemBorderColor',
        corporateInfo.listviewItemBorderColor,
      );
      updateState(
        'listviewItemBorderRadius',
        corporateInfo.listviewItemBorderRadius,
      );
      updateState(
        'listviewItemBorderSize',
        corporateInfo.listviewItemBorderSize,
      );
      updateState(
        'listviewTitleFontColor',
        corporateInfo.listviewTitleFontColor,
      );
      updateState('listviewTitleFontSize', corporateInfo.listviewTitleFontSize);
      updateState(
        'listviewTitleFontWeight',
        corporateInfo.listviewTitleFontWeight,
      );
      updateState(
        'listviewDescriptionFontColor',
        corporateInfo.listviewDescriptionFontColor,
      );
      updateState(
        'listviewDescriptionFontSize',
        corporateInfo.listviewDescriptionFontSize,
      );
      updateState(
        'listviewCounterFontColor',
        corporateInfo.listviewCounterFontColor,
      );
      updateState(
        'listviewCounterFontSize',
        corporateInfo.listviewCounterFontSize,
      );
      updateState(
        'listviewFilterButtonBackgroundColor',
        corporateInfo.listviewFilterButtonBackgroundColor,
      );
      updateState(
        'listviewFilterButtonBorderColor',
        corporateInfo.listviewFilterButtonBorderColor,
      );
      updateState(
        'listviewFilterButtonFontColor',
        corporateInfo.listviewFilterButtonFontColor,
      );
      updateState(
        'listviewFilterButtonHoverBackgroundColor',
        corporateInfo.listviewFilterButtonHoverBackgroundColor,
      );
      updateState(
        'listviewArrowIconColor',
        corporateInfo.listviewArrowIconColor,
      );
      updateState(
        'listviewBackButtonBackgroundColor',
        corporateInfo.listviewBackButtonBackgroundColor,
      );
      updateState(
        'listviewBackButtonHoverBackgroundColor',
        corporateInfo.listviewBackButtonHoverBackgroundColor,
      );
      updateState(
        'listviewBackButtonFontColor',
        corporateInfo.listviewBackButtonFontColor,
      );
      updateState(
        'listviewMapButtonBackgroundColor',
        corporateInfo.listviewMapButtonBackgroundColor,
      );
      updateState(
        'listviewMapButtonHoverBackgroundColor',
        corporateInfo.listviewMapButtonHoverBackgroundColor,
      );
      updateState(
        'listviewMapButtonFontColor',
        corporateInfo.listviewMapButtonFontColor,
      );
      updateState(
        'dateSelectorBorderColor',
        corporateInfo.dateSelectorBorderColor,
      );
      updateState(
        'dateSelectorBackgroundColorSelected',
        corporateInfo.dateSelectorBackgroundColorSelected,
      );
      updateState(
        'dateSelectorFontColorSelected',
        corporateInfo.dateSelectorFontColorSelected,
      );
      updateState(
        'dateSelectorFontColorUnselected',
        corporateInfo.dateSelectorFontColorUnselected,
      );

      // LOGO
      updateState('showHeaderLogo', corporateInfo.showHeaderLogo);
      updateState('showMenuLogo', corporateInfo.showMenuLogo);

      // FONTS
      updateState('headerFontColor', corporateInfo.headerFontColor);
      updateState('fontFamily', corporateInfo.fontFamily);
      updateState('dashboardFontColor', corporateInfo.dashboardFontColor);
      updateState('panelFontColor', corporateInfo.panelFontColor);
      updateState('widgetFontColor', corporateInfo.widgetFontColor);
      updateState('fontColor', corporateInfo.fontColor);

      // STUFF
      updateState('headerTitleAdmin', corporateInfo.headerTitleAdmin);
      updateState('headerTitleDashboards', corporateInfo.headerTitleDashboards);
      updateState('titleBar', corporateInfo.titleBar);

      // SHOW INFO BUTTONS FOR MOBILE
      updateState(
        'showInfoButtonsOnMobile',
        corporateInfo.showInfoButtonsOnMobile,
      );

      setIsInitDone(true);
    }
  }, [corporateInfo]);

  const handleSaveCorporateInfoClick = async (): Promise<void> => {
    // Combine state and other fields into `combinedCorporateInfo`
    const combinedCorporateInfo: CorporateInfo = {
      id: corporateInfo?.id,
      ...state, // Merge state from custom hook
      sidebarLogos: sidebarLogos,
      headerLogoId: headerLogoId,
    };

    // Validate and collect errors
    const textfieldErrorMessages: string[] = [];
    const errorsOccured: WizardErrors = {};
    if (!combinedCorporateInfo.titleBar)
      errorsOccured.titleError = 'Titel muss ausgefüllt werden!';

    if (Object.keys(errorsOccured).length) {
      for (const key in errorsOccured) {
        const error = errorsOccured[key] as string;
        textfieldErrorMessages.unshift(error);
      }
    }

    // Set errors and show snackbar messages if needed
    setErrors(errorsOccured);
    if (textfieldErrorMessages.length > 0) {
      for (const message of textfieldErrorMessages) {
        openSnackbar(message, 'warning');
      }
      return;
    }

    try {
      // Save the corporate information
      if (corporateInfo && corporateInfo.id) {
        await updateCorporateInfo(
          auth.user?.access_token,
          combinedCorporateInfo,
        );
        openSnackbar(
          'Unternehmensinformationen erfolgreich aktualisiert!',
          'success',
        );
      } else {
        await postCorporateInfo(
          auth.user?.access_token,
          combinedCorporateInfo,
          tenant,
        );
        openSnackbar(
          'Unternehmensinformationen erfolgreich erstellt!',
          'success',
        );
      }

      // Refetch corporate info and refresh the page
      refetchCorporateInfo();
      router.refresh();
    } catch (error) {
      openSnackbar(
        'Unternehmensinformationen konnten nicht gespeichert werden.',
        'error',
      );
    }
  };

  if (isLoading) return <Loading />;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div style={dashboardStyle} className="p-10 h-full">
      {isInitDone ? (
        <CorporateInfoWizard
          corporateInfo={corporateInfo}
          state={state}
          updateState={updateState}
          handleSaveCorporateInfoClick={handleSaveCorporateInfoClick}
          headerLogoId={headerLogoId}
          setHeaderLogoId={setHeaderLogoId}
          sidebarLogos={sidebarLogos}
          setSidebarLogos={setSidebarLogos}
          errors={errors}
        />
      ) : (
        <DashboardIcons
          iconName="Spinner"
          color={dashboardStyle.color || '#FFFFFF'}
        />
      )}
    </div>
  );
}
