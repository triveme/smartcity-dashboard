'use client';

import { CSSProperties, ReactElement, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

import CorporateInfoWizard from '@/components/Wizards/CorporateInfoWizard';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import { CorporateInfo, SidebarLogo } from '@/types';
import {
  getCorporateInfosWithLogos,
  postCorporateInfo,
  updateCorporateInfo,
} from '@/api/corporateInfo-service';
import { WizardErrors } from '@/types/errors';
import useWizardState from '@/app/custom-hooks/singleState';
import { getTenantOfPage, isUserMatchingTenant } from '@/utils/tenantHelper';

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
  const [headerLogoId, setHeaderLogoId] = useState<string | undefined>(
    undefined,
  );
  const [sidebarLogos, setSidebarLogos] = useState<SidebarLogo[]>([]);

  const [errors, setErrors] = useState<WizardErrors>({});
  const [isCollapsed, setIsCollapsed] = useState(false);

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
      updateState('fontColor', corporateInfo.fontColor);
      updateState('headerFontColor', corporateInfo.headerFontColor);
      updateState('headerPrimaryColor', corporateInfo.headerPrimaryColor);
      updateState('headerSecondaryColor', corporateInfo.headerSecondaryColor);
      updateState('headerTitleAdmin', corporateInfo.headerTitleAdmin);
      updateState('headerTitleDashboards', corporateInfo.headerTitleDashboards);
      updateState('menuActiveColor', corporateInfo.menuActiveColor);
      updateState('menuActiveFontColor', corporateInfo.menuActiveFontColor);
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
    </div>
  );
}
