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
      updateState('dashboardFontColor', corporateInfo.dashboardFontColor);
      updateState('dashboardPrimaryColor', corporateInfo.dashboardPrimaryColor);
      updateState(
        'dashboardSecondaryColor',
        corporateInfo.dashboardSecondaryColor,
      );
      updateState(
        'dashboardHeadlineFontSize',
        corporateInfo.dashboardHeadlineFontSize,
      );
      updateState('fontColor', corporateInfo.fontColor);
      updateState('fontFamily', corporateInfo.fontFamily);
      updateState('headerFontColor', corporateInfo.headerFontColor);
      updateState('headerPrimaryColor', corporateInfo.headerPrimaryColor);
      updateState('headerSecondaryColor', corporateInfo.headerSecondaryColor);
      updateState('headerTitleAdmin', corporateInfo.headerTitleAdmin);
      updateState('headerTitleDashboards', corporateInfo.headerTitleDashboards);
      updateState('menuActiveColor', corporateInfo.menuActiveColor);
      updateState('menuActiveFontColor', corporateInfo.menuActiveFontColor);
      updateState('menuArrowDirection', corporateInfo.menuArrowDirection);
      updateState('menuCornerColor', corporateInfo.menuCornerColor);
      updateState('menuCornerFontColor', corporateInfo.menuCornerFontColor);
      updateState('menuFontColor', corporateInfo.menuFontColor);
      updateState('menuHoverColor', corporateInfo.menuHoverColor);
      updateState('menuPrimaryColor', corporateInfo.menuPrimaryColor);
      updateState('menuSecondaryColor', corporateInfo.menuSecondaryColor);
      updateState(
        'useColorTransitionHeader',
        corporateInfo.useColorTransitionHeader,
      );
      updateState(
        'useColorTransitionMenu',
        corporateInfo.useColorTransitionMenu,
      );
      updateState('panelBorderColor', corporateInfo.panelBorderColor);
      updateState('panelBorderRadius', corporateInfo.panelBorderRadius);
      updateState('panelBorderSize', corporateInfo.panelBorderSize);
      updateState('panelFontColor', corporateInfo.panelFontColor);
      updateState('panelPrimaryColor', corporateInfo.panelPrimaryColor);
      updateState('panelSecondaryColor', corporateInfo.panelSecondaryColor);
      updateState('panelHeadlineFontSize', corporateInfo.panelHeadlineFontSize);
      updateState('scrollbarColor', corporateInfo.scrollbarColor);
      updateState('scrollbarBackground', corporateInfo.scrollbarBackground);
      updateState('saveButtonColor', corporateInfo.saveButtonColor);
      updateState('saveHoverButtonColor', corporateInfo.saveHoverButtonColor);
      updateState('cancelButtonColor', corporateInfo.cancelButtonColor);
      updateState(
        'cancelHoverButtonColor',
        corporateInfo.cancelHoverButtonColor,
      );
      updateState('showHeaderLogo', corporateInfo.showHeaderLogo);
      updateState('showMenuLogo', corporateInfo.showMenuLogo);
      updateState('titleBar', corporateInfo.titleBar);
      updateState('widgetBorderColor', corporateInfo.widgetBorderColor);
      updateState('widgetBorderRadius', corporateInfo.widgetBorderRadius);
      updateState('widgetBorderSize', corporateInfo.widgetBorderSize);
      updateState('widgetFontColor', corporateInfo.widgetFontColor);
      updateState('widgetPrimaryColor', corporateInfo.widgetPrimaryColor);
      updateState('widgetSecondaryColor', corporateInfo.widgetSecondaryColor);
      updateState(
        'widgetHeadlineFontSize',
        corporateInfo.widgetHeadlineFontSize,
      );
      updateState(
        'widgetSubheadlineFontSize',
        corporateInfo.widgetSubheadlineFontSize,
      );

      updateState(
        'informationTextFontSize',
        corporateInfo.informationTextFontSize,
      );
      updateState(
        'informationTextFontColor',
        corporateInfo.informationTextFontColor,
      );

      updateState('iconWithLinkFontSize', corporateInfo.iconWithLinkFontSize);
      updateState('iconWithLinkFontColor', corporateInfo.iconWithLinkFontColor);
      updateState('iconWithLinkIconSize', corporateInfo.iconWithLinkIconSize);
      updateState('iconWithLinkIconColor', corporateInfo.iconWithLinkIconColor);

      updateState('isPanelHeadlineBold', corporateInfo.isPanelHeadlineBold);
      updateState('isWidgetHeadlineBold', corporateInfo.isWidgetHeadlineBold);

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

      updateState('pieChartFontSize', corporateInfo.pieChartFontSize);
      updateState('pieChartFontColor', corporateInfo.pieChartFontColor);
      updateState(
        'pieChartCurrentValuesColors',
        corporateInfo.pieChartCurrentValuesColors,
      );

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
        'lineChartLegendFontColor',
        corporateInfo.lineChartLegendFontColor,
      );
      updateState(
        'lineChartLegendFontSize',
        corporateInfo.lineChartLegendFontSize,
      );
      updateState(
        'lineChartTicksFontColor',
        corporateInfo.lineChartTicksFontColor,
      );
      updateState(
        'lineChartAxisLineColor',
        corporateInfo.lineChartAxisLineColor,
      );
      updateState(
        'lineChartCurrentValuesColors',
        corporateInfo.lineChartCurrentValuesColors,
      );
      updateState('lineChartGridColor', corporateInfo.lineChartGridColor);
      updateState('lineChartFilterColor', corporateInfo.lineChartFilterColor);

      updateState(
        'barChartAxisTicksFontSize',
        corporateInfo.barChartAxisTicksFontSize,
      );
      updateState('barChartAxisLabelSize', corporateInfo.barChartAxisLabelSize);
      updateState(
        'barChartLegendFontSize',
        corporateInfo.barChartLegendFontSize,
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

      updateState('wertFontSize', corporateInfo.wertFontSize);
      updateState('wertUnitFontSize', corporateInfo.wertUnitFontSize);
      updateState('wertFontColor', corporateInfo.wertFontSize);

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

  if (isLoading) return <div>Loading...</div>;
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
