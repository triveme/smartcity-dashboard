'use client';

import { ReactElement, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import { useQuery } from '@tanstack/react-query';

import PageHeadline from '@/ui/PageHeadline';
import CancelButton from '@/ui/Buttons/CancelButton';
import SaveButton from '@/ui/Buttons/SaveButton';
import DashboardWizard from '@/components/Wizards/DashboardWizard';
import DashboardPreview from '@/components/Previews/DashboardPreview';
import { Dashboard, Panel, Tab, visibilityEnum } from '@/types';
import {
  getDashboardByIdWithStructure,
  postDashboard,
  updateDashboard,
} from '@/api/dashboard-service';
import { deletePanel, postPanel, updatePanel } from '@/api/panel-service';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import { WizardErrors } from '@/types/errors';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage, isUserMatchingTenant } from '@/utils/tenantHelper';
import DashboardIcons from '@/ui/Icons/DashboardIcon';

export default function Pages(): ReactElement {
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

  const paramsSearch = useSearchParams();
  const itemId = paramsSearch.get('id');

  const { openSnackbar } = useSnackbar();

  const [dashboardName, setDashboardName] = useState('');
  const [dashboardFontColor, setDashboardFontColor] = useState('');
  const [dashboardUrl, setDashboardUrl] = useState('');
  const [dashboardVisibility, setDashboardVisibility] = useState(
    visibilityEnum.public,
  );
  const [dashboardReadRoles, setDashboardReadRoles] = useState<string[]>([]);
  const [dashboardWriteRoles, setDashboardWriteRoles] = useState<string[]>([]);
  const [dashboardIcon, setDashboardIcon] = useState('');
  const [dashboardType, setDashboardType] = useState('');
  const [dashboardAllowShare, setDashboardAllowShare] = useState(false);
  const [dashboardAllowDataExport, setDashboardAllowDataExport] =
    useState(false);
  const [canFetch, setCanFetch] = useState(false);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [selectedTab, setSelectedTab] = useState<Tab>();
  const [errors, setErrors] = useState<WizardErrors>({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isInitDone, setIsInitDone] = useState(!itemId ? true : false);

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

  const { data } = useQuery({
    queryKey: ['corporate-info'],
    queryFn: () => getCorporateInfosWithLogos(tenant),
    enabled: false,
  });

  //Dynamic Styling
  const dashboardStyle = {
    backgroundColor: data?.dashboardPrimaryColor || '#2B3244',
    color: data?.dashboardFontColor || '#FFFFFF',
    marginLeft: isCollapsed ? '80px' : '250px',
    maxWidth: 'auto',
    width: 'auto',
  };

  useEffect(() => {
    if (itemId) {
      setCanFetch(true);
    } else {
      setIsInitDone(true);
    }
  }, [itemId]);

  const {
    data: dashboardData,
    refetch: refetchDashboards,
    isError: dashboardIsError,
    error: dashboardError,
  } = useQuery({
    queryKey: ['dashboard', itemId],
    queryFn: () =>
      getDashboardByIdWithStructure(auth?.user?.access_token, itemId!),
    enabled: !!itemId,
  });

  useEffect(() => {
    if (
      dashboardData &&
      dashboardData.panels &&
      dashboardData.panels.length > 0
    ) {
      setPanels(dashboardData.panels);
    }
  }, [dashboardData]);

  useEffect(() => {
    if (dashboardData) {
      setDashboardName(dashboardData.name || '');
      setDashboardUrl(dashboardData.url || '');
      setDashboardVisibility(dashboardData.visibility);
      setDashboardReadRoles(dashboardData.readRoles || []);
      setDashboardWriteRoles(dashboardData.writeRoles || []);
      setDashboardIcon(dashboardData.icon || '');
      // setPanels(dashboardData.panels || []);
      setDashboardType(dashboardData.type || '');
      setPanels(dashboardData.panels || []);
      setDashboardType(dashboardData.type || 'Allgemein');
      setDashboardAllowShare(dashboardData.allowShare || false);
      setDashboardAllowDataExport(dashboardData.allowDataExport || false);
      if (dashboardData.headlineColor) {
        setDashboardFontColor(dashboardData.headlineColor);
      } else {
        setDashboardFontColor(data?.dashboardFontColor || '#FFFFFF');
      }
      setIsInitDone(true);
      return;
    }
    if (data) {
      setDashboardFontColor(data?.dashboardFontColor || '#FFFFFF');
    }
  }, [dashboardData, data]);

  useEffect(() => {
    if (dashboardIsError) {
      openSnackbar('Error: ' + dashboardError, 'error');
    }
  }, [dashboardIsError]);

  const handleCreateDashboardClick = async (): Promise<void> => {
    let dashboardResponse: Dashboard;
    const dashboard: Dashboard = {
      name: dashboardName,
      headlineColor: dashboardFontColor,
      url: dashboardUrl,
      icon: dashboardIcon,
      visibility: dashboardVisibility,
      readRoles: dashboardReadRoles,
      writeRoles: dashboardWriteRoles,
      id: itemId || undefined,
      type: dashboardType,
      allowShare: dashboardAllowShare,
      allowDataExport: dashboardAllowDataExport,
    };

    const textfieldErrorMessages: string[] = [];
    const errorsOccured: WizardErrors = {};

    if (!dashboardName)
      errorsOccured.nameError = 'Name muss ausgefüllt werden!';
    if (!dashboardUrl) errorsOccured.urlError = 'Url muss ausgefüllt werden!';
    if (dashboardUrl && dashboardUrl.length < 3)
      errorsOccured.urlError = 'Url muss mindestens drei Zeichen lang sein!';
    if (dashboardVisibility === 'protected') {
      if (dashboardReadRoles.length === 0)
        errorsOccured.readRolesError = 'Leserechte müssen ausgefüllt werden!';
      if (dashboardWriteRoles.length === 0)
        errorsOccured.writeRolesError =
          'Schreibberechtigungen müssen ausgefüllt sein!';
    }

    if (Object.keys(errorsOccured).length) {
      for (const key in errorsOccured) {
        const error = errorsOccured[key] as string;
        textfieldErrorMessages.unshift(error);
      }
    }

    if (textfieldErrorMessages.length > 0) {
      for (const message of textfieldErrorMessages) {
        openSnackbar(message, 'warning');
      }
      setErrors(errorsOccured);
      return;
    }

    try {
      if (itemId) {
        dashboardResponse = await updateDashboard(
          auth?.user?.access_token,
          dashboard,
          tenant,
        );
        openSnackbar('Dashboard wurde erfolgreich aktualisiert!', 'success');
      } else {
        dashboardResponse = await postDashboard(
          auth?.user?.access_token,
          dashboard,
          tenant as string,
        );
        openSnackbar('Dashboard wurde erfolgreich erstellt!', 'success');
      }
      if (dashboardResponse.id) {
        await editPanels(dashboardResponse.id);
      }
      if (canFetch) {
        refetchDashboards();
      }
      router.back();
    } catch (error) {
      openSnackbar('Dashboard konnte nicht gespeichert werden.', 'error');
    }
  };

  const editPanels = async (dashboardId: string): Promise<void> => {
    const editedPanels: Panel[] = [];
    for (let i = 0; i < panels.length; i++) {
      const element: Panel = {
        id: panels[i].id || undefined,
        name: panels[i].name,
        dashboardId: dashboardId,
        generalInfo: panels[i].generalInfo,
        headlineColor: panels[i].headlineColor,
        height: panels[i].height,
        info: panels[i].info,
        jumpoffIcon: panels[i].jumpoffIcon,
        jumpoffLabel: panels[i].jumpoffLabel,
        jumpoffUrl: panels[i].jumpoffUrl,
        position: panels[i].position,
        showGeneralInfo: panels[i].showGeneralInfo,
        showJumpoffButton: panels[i].showJumpoffButton,
        openJumpoffLinkInNewTab: panels[i].openJumpoffLinkInNewTab,
        width: panels[i].width,
      };
      editedPanels.push(element);
    }
    for (let j = 0; j < editedPanels.length; j++) {
      const tPanel = editedPanels[j];
      if (tPanel.id) {
        await updatePanel(auth.user?.access_token, tPanel);
      } else {
        await postPanel(auth.user?.access_token, tPanel);
      }
    }
    if (canFetch) {
      refetchDashboards();
    }
  };

  const handleCancelClick = async (): Promise<void> => {
    // for newly created dashboard, on cancel delete all panels
    if (!itemId) {
      if (panels.length > 0) {
        await Promise.all(
          panels.map(async (panel) => {
            if (panel.id) {
              await deletePanel(auth?.user?.access_token, panel.id);
            }
          }),
        );
      }
    } else {
      // for existing dashboard, on cancel delete newly created panels
      if (panels.length > 0) {
        await Promise.all(
          panels.map(async (panel) => {
            if (!panel.dashboardId && panel.id) {
              await deletePanel(auth?.user?.access_token, panel.id);
            }
          }),
        );
      }
    }
    router.back();
  };

  if (!isInitDone) {
    return (
      <div
        style={dashboardStyle}
        className="flex flex-row min-h-screen justify-center items-center text-2xl"
      >
        <DashboardIcons iconName="Spinner" color={dashboardStyle.color} />
      </div>
    );
  }

  return (
    <div
      style={dashboardStyle}
      className="h-full flex flex-col justify-between p-10"
    >
      <div>
        <PageHeadline
          headline={`Dashboard ${dashboardName}`}
          fontColor={data?.dashboardFontColor}
        />
      </div>
      <div className="flex justify-between items-start content-center grow py-4 gap-4">
        <div
          className="basis-3/5 h-full p-4 rounded-lg"
          style={{
            backgroundColor: `${data?.dashboardPrimaryColor || '#2B3244'}`,
            borderColor: data?.panelBorderColor || '#2B3244',
            borderWidth: data?.panelBorderSize || '4px',
            borderRadius: data?.panelBorderRadius || '4px',
          }}
        >
          <DashboardPreview
            panels={panels}
            handlePanelChange={setPanels}
            dashboardType={dashboardType}
            selectedTab={selectedTab}
            fontColor={data?.dashboardFontColor || '#fff'}
            iconColor={data?.dashboardFontColor || '#fff'}
            backgroundColor={data?.dashboardPrimaryColor || '#2B3244'}
            borderColor={data?.widgetBorderColor || '#2B3244'}
            panelHeadlineColor={data?.panelFontColor || '#FFFFFF'}
          />
        </div>
        <div
          className="basis-2/5 h-full p-4 rounded-lg"
          style={{
            borderColor: data?.panelBorderColor || '#2B3244',
            borderWidth: data?.panelBorderSize || '4px',
            borderRadius: data?.panelBorderRadius || '4px',
            color: data?.dashboardFontColor || '#FFFFFF',
          }}
        >
          <DashboardWizard
            dashboardName={dashboardName}
            setDashboardName={setDashboardName}
            dashboardFontColor={dashboardFontColor}
            setDashboardFontColor={setDashboardFontColor}
            dashboardUrl={dashboardUrl}
            setDashboardIcon={setDashboardIcon}
            dashboardVisibility={dashboardVisibility}
            setDashboardVisibility={setDashboardVisibility}
            dashboardReadRoles={dashboardReadRoles}
            setDashboardReadRoles={setDashboardReadRoles}
            dashboardWriteRoles={dashboardWriteRoles}
            setDashboardWriteRoles={setDashboardWriteRoles}
            dashboardIcon={dashboardIcon}
            setDashboardUrl={setDashboardUrl}
            dashboardType={dashboardType || 'Allgemein'}
            setDashboardType={setDashboardType}
            dashboardAllowShare={dashboardAllowShare}
            setDashboardAllowShare={setDashboardAllowShare}
            dashboardAllowDataExport={dashboardAllowDataExport}
            setDashboardAllowDataExport={setDashboardAllowDataExport}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            panels={panels}
            setPanels={setPanels}
            tenant={tenant}
            errors={errors}
            setErrors={setErrors}
            iconColor={data?.dashboardFontColor || '#fff'}
            backgroundColor={data?.dashboardPrimaryColor || '#2B3244'}
            borderColor={data?.widgetBorderColor || '#2B3244'}
            hoverColor={data?.menuHoverColor || '#59647D'}
            dashboardMap={
              dashboardData?.type === 'Karte'
                ? dashboardData?.panels[0]?.widgets[0]
                : undefined
            }
            originalDashboardType={dashboardData?.type || 'Allgemein'}
          />
        </div>
      </div>
      <div className="flex justify-end py-4">
        <CancelButton onClick={handleCancelClick} closeWindow={true} />
        <SaveButton handleSaveClick={handleCreateDashboardClick} />
      </div>
    </div>
  );
}
