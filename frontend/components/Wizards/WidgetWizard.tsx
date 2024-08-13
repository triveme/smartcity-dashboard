'use client';

import { ReactElement, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from 'react-oidc-context';
import { env } from 'next-runtime-env';
import { jwtDecode } from 'jwt-decode';

import WizardTextfield from '@/ui/WizardTextfield';
import WizardLabel from '@/ui/WizardLabel';
import WizardDropdownSelection from '@/ui/WizardDropdownSelection';
import HorizontalDivider from '@/ui/HorizontalDivider';
import DashboardWidgetPreview from '../Previews/DashboardWidgetPreview';
import ValueSelectionSlider from '@/ui/ValueSelectionSlider';
import IconSelection from '@/ui/Icons/IconSelection';
import RoleSelection from '@/components/RoleSelecton';
import {
  aggregationEnum,
  QueryConfig,
  ReportConfig,
  tabComponentSubTypeEnum,
  tabComponentTypeEnum,
  timeframeEnum,
  visibilityEnum,
  WidgetWithChildren,
} from '@/types';
import {
  getWidgets,
  getWidgetWithChildrenById,
  postWidgetWithChildren,
  updateWidgetWithChildren,
} from '@/api/widget-service';
import { Tab, Widget } from '@/types';
import CancelButton from '@/ui/Buttons/CancelButton';
import SaveButton from '@/ui/Buttons/SaveButton';
import TabWizard from './TabWizard';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import QueryConfigWizard from './QueryConfigWizard';
import {
  EMPTY_QUERY_CONFIG,
  EMPTY_REPORT_CONFIG,
  EMPTY_WIDGET,
} from '@/utils/objectHelper';
import { WizardErrors } from '@/types/errors';
import { validateWidgetWithChildren } from '@/validators/widgetValidator';
import CollapseButton from '@/ui/Buttons/CollapseButton';
import { visibilityOptions } from '@/utils/enumMapper';
import {
  getReportConfigByQueryId,
  postReportConfig,
  updateReportConfig,
} from '@/api/report-service';

type WidgetWizardProps = {
  iconColor: string;
  borderColor: string;
  backgroundColor: string;
};

export default function WidgetWizard(props: WidgetWizardProps): ReactElement {
  const { iconColor, borderColor, backgroundColor } = props;
  const paramsSearch = useSearchParams();
  const itemId = paramsSearch.get('id');
  const params = useParams();
  const NEXT_PUBLIC_MULTI_TENANCY = env('NEXT_PUBLIC_MULTI_TENANCY');
  const tenant =
    NEXT_PUBLIC_MULTI_TENANCY === 'true'
      ? (params.tenant as string)
      : undefined;
  const { openSnackbar } = useSnackbar();
  const router = useRouter();

  // WIDGET
  const [widget, setWidget] = useState<Widget>(EMPTY_WIDGET);
  const [generalFormIsOpen, setGeneralFormIsOpen] = useState(
    !itemId ? true : false,
  );

  // QUERY CONFIG
  const [queryConfig, setQueryConfig] =
    useState<QueryConfig>(EMPTY_QUERY_CONFIG);
  const [widgetHasQueryConfig, setWidgetHasQueryConfig] =
    useState<boolean>(false);
  //ReportConfig
  const [reportConfig, setReportConfig] =
    useState<ReportConfig>(EMPTY_REPORT_CONFIG);
  // TAB
  const [tab, setTab] = useState<Tab>();

  // ERROR State
  const [errors, setErrors] = useState<WizardErrors>({});

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

  const {
    data: widgetWithChildrenData,
    isError: widgetWithChildrenByIdIsError,
    error: widgetWithChildrenByIdError,
  } = useQuery({
    queryKey: ['widget', itemId],
    queryFn: () => getWidgetWithChildrenById(auth?.user?.access_token, itemId!),
    enabled: !!itemId,
  });

  const { data: reportConfigData } = useQuery({
    queryKey: ['reportConfig'],
    queryFn: () =>
      getReportConfigByQueryId(
        auth?.user?.access_token,
        widgetWithChildrenData?.tab?.queryId || undefined,
      ),
    enabled: !!(
      widgetWithChildrenData?.tab?.queryId &&
      widgetWithChildrenData.queryConfig?.isReporting
    ),
  });

  useEffect(() => {
    if (reportConfigData) {
      setReportConfig(reportConfigData || EMPTY_REPORT_CONFIG);
    }
  }, [reportConfigData]);

  const {
    refetch: refetchWidgets,
    isError: widgetsIsError,
    error: widgetsError,
  } = useQuery({
    queryKey: ['widgets'],
    queryFn: () => getWidgets(auth?.user?.access_token, tenant),
  });

  useEffect(() => {
    if (widgetWithChildrenData) {
      setWidget(widgetWithChildrenData.widget);
      setQueryConfig(widgetWithChildrenData.queryConfig!);
      setTab(widgetWithChildrenData.tab);
    }
  }, [widgetWithChildrenData]);

  useEffect(() => {
    if (widgetsIsError) {
      openSnackbar('Error: ' + widgetsError, 'error');
    }
    if (widgetWithChildrenByIdIsError) {
      openSnackbar('Error: ' + widgetWithChildrenByIdError, 'error');
    }
  }, [widgetsIsError, widgetWithChildrenByIdError]);

  useEffect(() => {
    if (
      !tab?.componentType ||
      tab?.componentType === tabComponentTypeEnum.default ||
      tab?.componentType === tabComponentTypeEnum.information ||
      tab?.componentType === tabComponentTypeEnum.image ||
      tab?.componentType === tabComponentTypeEnum.iframe
    ) {
      setWidgetHasQueryConfig(false);
    } else {
      setWidgetHasQueryConfig(true);
    }
  }, [tab?.componentType]);

  const handleCreateWidgetClick = async (): Promise<void> => {
    if (tab) {
      if (
        tab.componentSubType === tabComponentSubTypeEnum.degreeChart180 ||
        tab.componentSubType === tabComponentSubTypeEnum.degreeChart360 ||
        tab.componentSubType === tabComponentSubTypeEnum.stageableChart
      ) {
        if (!tab?.chartMinimum) {
          tab.chartMinimum = 0;
        }
        if (!tab?.chartMaximum) {
          tab.chartMaximum = 100;
        }
      }
      // Default settings for map
      if (tab.componentType === tabComponentTypeEnum.map) {
        queryConfig.aggrMode = aggregationEnum.none;
        queryConfig.timeframe = timeframeEnum.day;
      }
      // Default settings for measurement component
      if (
        tab.componentType === tabComponentTypeEnum.diagram &&
        tab.componentSubType === tabComponentSubTypeEnum.measurement
      ) {
        queryConfig.aggrMode = aggregationEnum.average;
        queryConfig.timeframe = timeframeEnum.month;
        queryConfig.aggrPeriod = timeframeEnum.day;
      }
      // Default settings for value and single value charts
      if (
        tab.componentType === tabComponentTypeEnum.value ||
        tab.componentType === tabComponentTypeEnum.slider ||
        tab.componentSubType === tabComponentSubTypeEnum.pieChart ||
        tab.componentSubType === tabComponentSubTypeEnum.degreeChart180 ||
        tab.componentSubType === tabComponentSubTypeEnum.degreeChart360 ||
        tab.componentSubType === tabComponentSubTypeEnum.stageableChart
      ) {
        queryConfig.aggrMode = aggregationEnum.none;
        queryConfig.timeframe = timeframeEnum.live;
      }
    }

    const tWidgetWithChildren: WidgetWithChildren = {
      widget: widget,
      tab: tab || ({} as Tab),
      queryConfig: widgetHasQueryConfig ? queryConfig : undefined,
    };

    const textfieldErrorMessages: string[] = [];
    const errorsOccured: WizardErrors =
      validateWidgetWithChildren(tWidgetWithChildren);

    if (Object.keys(errorsOccured).length) {
      for (const key in errorsOccured) {
        // exclude key from printing message, index only needed for static values error checking
        if (key !== 'mapModalWidgetIndexError') {
          const error = errorsOccured[key] as string;
          textfieldErrorMessages.unshift(error);
        }
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
      let savedWidgetWithChildren: WidgetWithChildren;
      if (widget.id) {
        savedWidgetWithChildren = await updateWidgetWithChildren(
          auth?.user?.access_token,
          tWidgetWithChildren,
          tenant,
        );
        openSnackbar('Element erfolgreich aktualisiert!', 'success');
      } else {
        savedWidgetWithChildren = await postWidgetWithChildren(
          auth?.user?.access_token,
          tWidgetWithChildren,
          tenant,
        );
        openSnackbar('Element erfolgreich erstellt!', 'success');
      }

      // Get the queryId from the saved widget
      const queryId = savedWidgetWithChildren.tab.queryId;

      // Update the reportConfig with the queryId
      if (queryConfig.isReporting && queryId) {
        if (!reportConfig.id) {
          reportConfig.queryId = queryId;
          await postReportConfig(auth?.user?.access_token, reportConfig);
          openSnackbar('ReportConfig erfolgreich gespeichert!', 'success');
        } else {
          await updateReportConfig(
            auth?.user?.access_token,
            reportConfig.id,
            reportConfig,
          );
          openSnackbar('ReportConfig erfolgreich gespeichert!', 'success');
        }
      }

      await refetchWidgets();
      router.back();
    } catch (error) {
      openSnackbar('Speichern fehlgeschlagen.', 'error');
    }
  };

  const handleSetTab = (
    update: (prevTab: Tab | undefined) => Partial<Tab>,
  ): void => {
    setTab((prevTab) => ({ ...prevTab, ...update(prevTab) }));
  };

  const handleSetQueryConfig = (
    update: (prevQueryConfig: QueryConfig | undefined) => Partial<QueryConfig>,
  ): void => {
    setQueryConfig((prevQueryConfig) => ({
      ...prevQueryConfig!,
      ...update(prevQueryConfig),
    }));
  };

  const handleWidgetChange = (update: Partial<Widget>): void => {
    setWidget((prevWidget) => ({ ...prevWidget, ...update }));
  };

  function getWidgetType(tab: Tab): string {
    return tab?.componentType === tabComponentTypeEnum.diagram
      ? tab?.componentSubType || ''
      : tab?.componentType || '';
  }
  return (
    <>
      <div className="flex justify-start items-start content-center grow py-4">
        <div className="basis-3/5 h-full">
          <div className="flex flex-col w-full pb-2">
            <div className="flex gap-2 place-items-center">
              <WizardLabel label="Allgemeine Information" />
              <CollapseButton
                isOpen={generalFormIsOpen}
                setIsOpen={setGeneralFormIsOpen}
              />
            </div>
          </div>

          <div className="flex flex-col pr-8">
            {generalFormIsOpen && (
              <>
                <div className="flex flex-col w-full pb-2">
                  <WizardLabel label="Name" />
                  <WizardTextfield
                    value={widget.name}
                    onChange={(value: string | number): void =>
                      handleWidgetChange({ name: value as string })
                    }
                    error={errors && errors.nameError}
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
                <div className="flex flex-col w-full pb-2">
                  <WizardLabel label="Höhe / Breite" />
                  <div className="flex">
                    <WizardTextfield
                      value={widget.height}
                      onChange={(value): void => {
                        handleWidgetChange({ height: value as number });
                      }}
                      error={errors && errors.widgetHeightError}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                    <ValueSelectionSlider
                      value={widget.width}
                      minValue={4}
                      maxValue={12}
                      onChange={(value: number | string): void =>
                        handleWidgetChange({ width: value as number })
                      }
                      borderColor={borderColor}
                    />
                  </div>
                </div>
                <div className="flex flex-col w-full">
                  <div className="flex flex-col w-full">
                    <WizardLabel label="Sichtbarkeit" />
                    <WizardDropdownSelection
                      currentValue={
                        visibilityOptions.find(
                          (option) => option.value === widget?.visibility,
                        )?.label || ''
                      }
                      selectableValues={visibilityOptions.map(
                        (option) => option.label,
                      )}
                      onSelect={(label: string | number): void => {
                        const enumValue = visibilityOptions.find(
                          (option) => option.label === label,
                        )?.value;
                        handleWidgetChange({
                          visibility: enumValue as visibilityEnum,
                        });
                      }}
                      iconColor={iconColor}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                    <div className="flex flex-col w-full">
                      {widget.visibility == visibilityEnum.protected && (
                        <>
                          <WizardLabel label="Rollen und Rechte" />
                          <RoleSelection
                            label="Lese-Rechte"
                            selectedRoles={widget.readRoles}
                            roleOptions={roleOptions}
                            onChange={(selectedReadRoles: string[]): void => {
                              handleWidgetChange({
                                readRoles: selectedReadRoles,
                              });
                            }}
                            error={errors && errors.readRolesError}
                            iconColor={iconColor}
                            borderColor={borderColor}
                            backgroundColor={backgroundColor}
                          />
                          <RoleSelection
                            label="Schreibe-Rechte"
                            selectedRoles={widget.writeRoles}
                            roleOptions={roleOptions}
                            onChange={(selectedWriteRoles: string[]): void => {
                              handleWidgetChange({
                                writeRoles: selectedWriteRoles,
                              });
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
                      <WizardLabel label="Icon" />
                      <IconSelection
                        activeIcon={widget.icon}
                        handleIconSelect={(value: string): void => {
                          handleWidgetChange({ icon: value });
                        }}
                        iconColor={iconColor}
                        borderColor={borderColor}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
            <HorizontalDivider />
            <TabWizard
              tab={tab || {}}
              setTab={handleSetTab}
              errors={errors}
              iconColor={iconColor}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
            {widgetHasQueryConfig && (
              <>
                <HorizontalDivider />
                <QueryConfigWizard
                  errors={errors}
                  key={getWidgetType(tab || {})}
                  widgetType={getWidgetType(tab || {})}
                  queryConfig={queryConfig}
                  setQueryConfig={handleSetQueryConfig}
                  reportConfig={reportConfig}
                  setReportConfig={setReportConfig}
                  iconColor={iconColor}
                  borderColor={borderColor}
                  backgroundColor={backgroundColor}
                />
              </>
            )}
          </div>
        </div>
        <div className="fixed top-64 right-4 max-w-[30%] w-2/5">
          <DashboardWidgetPreview
            widget={widget}
            tab={tab || {}}
            hideControlIcons={true}
          />
        </div>
      </div>
      <div className="flex justify-end py-4">
        <CancelButton />
        <SaveButton handleSaveClick={handleCreateWidgetClick} />
      </div>
    </>
  );
}
