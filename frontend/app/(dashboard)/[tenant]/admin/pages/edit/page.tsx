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
  getDashboardByIdWithContent,
  postDashboard,
  updateDashboard,
} from '@/api/dashboard-service';
import {
  deletePanel,
  getPanelsByDashboardId,
  postPanel,
  updatePanel,
} from '@/api/panel-service';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import { WizardErrors } from '@/types/errors';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage, isUserMatchingTenant } from '@/utils/tenantHelper';

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
  const [dashboardUrl, setDashboardUrl] = useState('');
  const [dashboardVisibility, setDashboardVisibility] = useState(
    visibilityEnum.public,
  );
  const [dashboardReadRoles, setDashboardReadRoles] = useState<string[]>([]);
  const [dashboardWriteRoles, setDashboardWriteRoles] = useState<string[]>([]);
  const [dashboardIcon, setDashboardIcon] = useState('');
  const [dashboardType, setDashboardType] = useState('');
  const [canFetch, setCanFetch] = useState(false);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [selectedTab, setSelectedTab] = useState<Tab>();
  const [errors, setErrors] = useState<WizardErrors>({});
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    marginLeft: isCollapsed ? '80px' : '250px',
    maxWidth: 'auto',
    width: 'auto',
  };
  useEffect(() => {
    if (itemId) {
      setCanFetch(true);
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
      getDashboardByIdWithContent(auth?.user?.access_token, itemId!),
    enabled: !!itemId,
  });
  const {
    data: panelData,
    refetch: refetchPanel,
    isError: panelIsError,
    error: panelError,
  } = useQuery({
    queryKey: ['panel', itemId],
    queryFn: () => getPanelsByDashboardId(auth?.user?.access_token, itemId!),
    enabled: canFetch,
  });

  useEffect(() => {
    if (panelData && panelData.length > 0) {
      setPanels(panelData);
    }
  }, [panelData]);
  useEffect(() => {
    if (dashboardData) {
      setDashboardName(dashboardData.name || '');
      setDashboardUrl(dashboardData.url || '');
      setDashboardVisibility(dashboardData.visibility);
      setDashboardReadRoles(dashboardData.readRoles || []);
      setDashboardWriteRoles(dashboardData.writeRoles || []);
      setDashboardIcon(dashboardData.icon || '');
      setPanels(dashboardData.panels || []);
      setDashboardType(dashboardData.type || '');
    }
  }, [dashboardData]);

  useEffect(() => {
    if (panelIsError) {
      openSnackbar('Error: ' + panelError, 'error');
    }

    if (dashboardIsError) {
      openSnackbar('Error: ' + dashboardError, 'error');
    }
  }, [panelIsError, dashboardIsError]);
  const handleCreateDashboardClick = async (): Promise<void> => {
    let dashboardResponse: Dashboard;
    const dashboard: Dashboard = {
      name: dashboardName,
      url: dashboardUrl,
      icon: dashboardIcon,
      visibility: dashboardVisibility,
      readRoles: dashboardReadRoles,
      writeRoles: dashboardWriteRoles,
      id: itemId || undefined,
      type: dashboardType,
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
        height: panels[i].height,
        width: panels[i].width,
        position: panels[i].position,
        info: panels[i].info,
        generalInfo: panels[i].generalInfo,
        showGeneralInfo: panels[i].showGeneralInfo,
        dashboardId: dashboardId,
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
      refetchPanel();
    }
  };
  const handleCancelClick = (): void => {
    if (!itemId) {
      if (panels.length > 0) {
        panels.map(async (panel) => {
          if (panel.id) {
            await deletePanel(auth?.user?.access_token, panel.id);
          }
        });
      }
    }
    router.back();
  };
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
            refetchPanel={refetchPanel}
            canFetch={canFetch}
            dashboardType={dashboardType}
            selectedTab={selectedTab}
            fontColor={data?.dashboardFontColor || '#fff'}
            backgroundColor={data?.dashboardPrimaryColor || '#2B3244'}
            borderColor={data?.widgetBorderColor || '#2B3244'}
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
            dashboardType={dashboardType}
            setDashboardType={setDashboardType}
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