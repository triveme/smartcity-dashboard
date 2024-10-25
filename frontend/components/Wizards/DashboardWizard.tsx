'use client';
import { ReactElement, useEffect, useState } from 'react';

import WizardDropdownSelection from '@/ui/WizardDropdownSelection';
import WizardLabel from '@/ui/WizardLabel';
import WizardTextfield from '@/ui/WizardTextfield';
import HorizontalDivider from '@/ui/HorizontalDivider';
import IconSelection from '@/ui/Icons/IconSelection';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from 'react-oidc-context';
import { jwtDecode } from 'jwt-decode';

import { getWidgets } from '@/api/widget-service';
import { getTabByWidgetId } from '@/api/tab-service';
import SearchableDropdown from '@/ui/SearchableDropdown';
import { Panel, Tab, tabComponentTypeEnum, Widget } from '@/types';
import { EMPTY_PANEL } from '@/utils/objectHelper';
import { deletePanel, postPanel } from '@/api/panel-service';
import { postWidgetToPanelRelation } from '@/api/widgetPanelRelation-service';
import { visibilityEnum } from '@/types';
import RoleSelection from '@/components/RoleSelecton';
import WizardSuffixUrlTextfield from '@/ui/WizardSuffixUrlTextfield';
import { WizardErrors } from '@/types/errors';
import { visibilityOptions } from '@/utils/enumMapper';
import CheckBox from '@/ui/CheckBox';
import ColorPickerComponent from '@/ui/ColorPickerComponent';

type DashboardWizardProps = {
  dashboardName: string;
  setDashboardName: (name: string) => void;
  dashboardFontColor: string;
  setDashboardFontColor: (name: string) => void;
  dashboardUrl: string;
  setDashboardUrl: (url: string) => void;
  dashboardVisibility: string;
  setDashboardVisibility: (dashboardVisibility: visibilityEnum) => void;
  dashboardReadRoles: string[];
  setDashboardReadRoles: (dashboardReadRoles: string[]) => void;
  dashboardWriteRoles: string[];
  setDashboardWriteRoles: (dashboardWriteRoles: string[]) => void;
  dashboardIcon: string;
  setDashboardIcon: (icon: string) => void;
  dashboardType: string;
  setDashboardType: (type: string) => void;
  dashboardAllowDataExport: boolean;
  setDashboardAllowDataExport: (type: boolean) => void;
  selectedTab: Tab | undefined;
  setSelectedTab: (tab: Tab) => void;
  panels: Panel[] | undefined;
  setPanels: (panel: Panel[]) => void;
  tenant: string | undefined;
  errors: WizardErrors | undefined;
  setErrors: (errors: WizardErrors) => void;
  iconColor: string;
  borderColor: string;
  backgroundColor: string;
  hoverColor: string;
};

export default function DashboardWizard(
  props: DashboardWizardProps,
): ReactElement {
  const {
    dashboardName,
    setDashboardName,
    dashboardFontColor,
    setDashboardFontColor,
    dashboardUrl,
    setDashboardUrl,
    dashboardVisibility,
    setDashboardVisibility,
    dashboardReadRoles,
    setDashboardReadRoles,
    dashboardWriteRoles,
    setDashboardWriteRoles,
    dashboardIcon,
    setDashboardIcon,
    dashboardType,
    setDashboardType,
    dashboardAllowDataExport,
    setDashboardAllowDataExport,
    setSelectedTab,
    panels,
    setPanels,
    tenant,
    errors,
    iconColor,
    borderColor,
    backgroundColor,
    hoverColor,
  } = props;

  // Keycloak roles
  const auth = useAuth();
  const [roleOptions, setRoleOptions] = useState([]);

  useEffect(() => {
    if (auth && auth.user && auth.user?.access_token) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const decoded: any = jwtDecode(auth?.user?.access_token);
      const roles = decoded.roles || decoded.realm_access?.roles;
      setRoleOptions(roles);
    }
  }, [auth]);

  const [selectedWidgetInDropdown, setSelectedWidgetInDropdown] = useState('');
  const [allWidgets, setAllWidgets] = useState<Widget[]>([]);
  const [mapWidgets, setMapWidgets] = useState<string[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<Widget>();
  const [tabs, setTabs] = useState<Tab[]>([]);
  const { data: widgets } = useQuery({
    queryKey: ['widgets'],
    queryFn: () => getWidgets(auth?.user?.access_token, tenant),
  });

  useEffect(() => {
    if (widgets) {
      setAllWidgets(widgets);
    }
  }, [widgets]);

  useEffect(() => {
    allWidgets.map((widget) => {
      if (widget.name === selectedWidgetInDropdown) {
        setSelectedWidget(widget);
      }
    });
  }, [selectedWidgetInDropdown]);

  // Limit widgets that have a tab.componentType === map
  useEffect(() => {
    const fetchTabs = async (): Promise<void> => {
      const karteTypes: string[] = [];
      const tabs: Tab[] = [];

      for (const widget of allWidgets) {
        if (widget.id !== undefined) {
          try {
            const data = await getTabByWidgetId(
              auth?.user?.access_token,
              widget.id,
            );

            if (data.componentType === tabComponentTypeEnum.map) {
              tabs.push(data);
              karteTypes.push(widget.name);
            }
          } catch (error) {
            console.error(
              `Failed to fetch tab data for widget ${widget.id}:`,
              error,
            );
          }
        }
      }
      setMapWidgets(karteTypes);
      setTabs(tabs);
    };

    if (allWidgets && allWidgets.length > 0) {
      fetchTabs();
    }
  }, [allWidgets, auth?.user?.access_token]);

  useEffect(() => {
    tabs.map((tab) => {
      if (tab.widgetId === selectedWidget?.id) {
        setSelectedTab(tab);
      }
    });
  }, [selectedWidget]);

  const clearPanels = async (): Promise<void> => {
    try {
      if (panels && panels.length > 0 && panels[0].name === '') {
        for (let i = 0; i < panels.length; i++) {
          await deletePanel(auth.user?.access_token, panels[i].id!);
        }
        setPanels([]);
      }
    } catch (error) {
      console.error('Failed to delete panel:', error);
    }
  };

  useEffect(() => {
    const fetchPanel = async (): Promise<void> => {
      await clearPanels();
      if (dashboardType === 'Karte') {
        try {
          const newPanel = await postPanel(
            auth.user?.access_token,
            EMPTY_PANEL,
          );
          setPanels([newPanel]);
        } catch (error) {
          console.error('Failed to post panel:', error);
        }
      }
    };

    fetchPanel();
  }, [dashboardType, auth.user?.access_token, setPanels]);

  useEffect(() => {
    const handleWidgetClick = async (): Promise<void> => {
      const match =
        allWidgets && allWidgets.length
          ? allWidgets?.find(
              (widget: Widget) => widget.name === selectedWidgetInDropdown,
            )
          : undefined;
      if (match && match.id && panels && panels.length > 0 && panels[0].id) {
        await postWidgetToPanelRelation(
          auth?.user?.access_token,
          match.id!,
          panels[0].id,
          0,
        );
      }
    };
    handleWidgetClick();
  }, [selectedWidget]);

  return (
    <div>
      <div className="flex flex-col w-full pb-2">
        <WizardLabel label="Name" />
        <div className="flex flex-row items-center gap-4">
          <div className="flex grow">
            <WizardTextfield
              value={dashboardName}
              onChange={(value: string | number): void =>
                setDashboardName(value.toString())
              }
              error={errors && errors.nameError}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
          </div>
          <ColorPickerComponent
            currentColor={dashboardFontColor}
            handleColorChange={setDashboardFontColor}
            label={'Schriftfarbe des Dashboardnamens'}
          />
        </div>
      </div>
      <div className="flex flex-col w-full pb-2">
        <WizardLabel label="Url" />
        <WizardSuffixUrlTextfield
          value={dashboardUrl}
          onChange={(value: string | number): void =>
            setDashboardUrl(value.toString())
          }
          error={errors && errors.urlError}
          borderColor={borderColor}
        />
      </div>
      <div className="flex flex-col w-full pb-2">
        <WizardLabel label="Sichtbarkeit" />
        <WizardDropdownSelection
          currentValue={
            visibilityOptions.find(
              (option) => option.value === dashboardVisibility,
            )?.label || ''
          }
          selectableValues={visibilityOptions.map((option) => option.label)}
          onSelect={(label: string | number): void => {
            const enumValue = visibilityOptions.find(
              (option) => option.label === label,
            )?.value;
            setDashboardVisibility(enumValue as visibilityEnum);
          }}
          iconColor={iconColor}
          borderColor={borderColor}
          backgroundColor={backgroundColor}
        />

        {dashboardVisibility == visibilityEnum.protected && (
          <>
            <WizardLabel label="Rollen und Rechte" />
            <RoleSelection
              label="Lese-Rechte"
              roleOptions={roleOptions}
              selectedRoles={dashboardReadRoles}
              onChange={(selectedReadRoles: string[]): void => {
                setDashboardReadRoles(selectedReadRoles);
              }}
              error={errors && errors.readRolesError}
              iconColor={iconColor}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
            <RoleSelection
              label="Schreibe-Rechte"
              roleOptions={roleOptions}
              selectedRoles={dashboardWriteRoles}
              onChange={(selectedWriteRoles: string[]): void => {
                setDashboardWriteRoles(selectedWriteRoles);
              }}
              error={errors && errors.writeRolesError}
              iconColor={iconColor}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
          </>
        )}
      </div>
      <div className="flex flex-col w-full pb-2">
        <WizardLabel label="Type" />
        <WizardDropdownSelection
          currentValue={dashboardType}
          selectableValues={['Allgemein', 'Karte']}
          onSelect={(value: string | number): void =>
            setDashboardType(value.toString())
          }
          iconColor={iconColor}
          borderColor={borderColor}
          backgroundColor={backgroundColor}
        />
      </div>
      {dashboardType === 'Karte' && (
        <div className="flex flex-col w-full pb-2 z-0">
          <SearchableDropdown
            value={selectedWidget?.name || ''}
            options={
              mapWidgets && mapWidgets.length > 0
                ? mapWidgets?.map((karteName) => karteName)
                : []
            }
            onSelect={setSelectedWidgetInDropdown}
            backgroundColor={backgroundColor}
            borderColor={borderColor}
            hoverColor={hoverColor}
          />
        </div>
      )}
      <div className="flex flex-col w-full pb-2">
        <WizardLabel label="Icon" />
        <IconSelection
          activeIcon={dashboardIcon}
          handleIconSelect={(value: string): void =>
            setDashboardIcon(value.toString())
          }
          iconColor={iconColor}
          borderColor={borderColor}
        />
      </div>
      <div className="flex flex-col w-full py-2">
        <CheckBox
          label="Datenexport zulassen"
          value={dashboardAllowDataExport}
          handleSelectChange={setDashboardAllowDataExport}
        />
      </div>
      <HorizontalDivider />
    </div>
  );
}
