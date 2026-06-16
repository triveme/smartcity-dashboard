'use client';

import { ReactElement, useState, CSSProperties, useEffect } from 'react';
import DashboardIcons from '../Icons/DashboardIcon';
import React from 'react';
import { useAuth } from 'react-oidc-context';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import { downloadCSV, getAvailableWidgets } from '@/utils/downloadHelper';
import PageHeadline from '../PageHeadline';
import {
  CorporateInfo,
  CurrentAreaConfig,
  tabComponentSubTypeEnum,
  timeframeEnum,
} from '@/types';
import CheckBox from '../CheckBox';
import HorizontalDivider from '../HorizontalDivider';
import eventBus, {
  VISIBLE_CHART_DATA_DOWNLOAD_EVENT,
  Event,
} from '@/app/EventBus';
import WizardSelectBox from '../WizardSelectBox';
import WizardLabel from '../WizardLabel';
import {
  timeFrameWithoutLive,
  timeFrameWithoutLiveWithExakt,
} from '@/utils/enumMapper';
import WizardDropdownSelection from '../WizardDropdownSelection';
import Modal from '../Modal/Modal';

type DataExportButtonProps = {
  id: string;
  type: string;
  menuStyle?: CSSProperties;
  headerFontColor?: string;
  headerPrimaryColor?: string;
  panelFontColor?: string;
  widgetFontColor?: string;
  ciColors: CorporateInfo;
};

type AvailabelWidgetType = {
  id: string;
  name: string;
  panelName?: string;
  componentSubType?: string;
};

export default function DataExportButton(
  props: DataExportButtonProps,
): ReactElement {
  const {
    id,
    type,
    menuStyle,
    headerFontColor,
    headerPrimaryColor,
    panelFontColor,
    widgetFontColor,
    ciColors,
  } = props;

  const auth = useAuth();
  const accessToken = auth.user?.access_token || '';
  const { openSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableWidgets, setAvailableWidgets] = useState<
    AvailabelWidgetType[]
  >([]);
  const [selectedWidgetIds, setSelectedWidgetIds] = useState<string[]>([]);
  const [currentAreaConfig, setCurrentAreaConfing] = useState<
    CurrentAreaConfig[]
  >([]);
  const [selectTimeArea, setSelectTimeArea] = useState(false);

  const allSelected =
    availableWidgets.length > 0 &&
    selectedWidgetIds.length === availableWidgets.length;

  const modalStyle: CSSProperties = {
    height: 'auto',
    backgroundColor: ciColors.panelPrimaryColor ?? '#3D4760',
    borderRadius: ciColors.panelBorderRadius,
    borderWidth: ciColors.panelBorderSize,
    borderColor: ciColors.panelBorderColor,
    color: ciColors.panelFontColor,
  };

  const downloadButtonStyle = {
    backgroundColor: headerPrimaryColor || '#2B3244',
    color: headerFontColor || 'FFF',
    fontSize: '1rem',
    borderRadius: ciColors.panelBorderRadius,
    borderWidth: '1px',
    borderColor: headerFontColor,
  };

  const dataexportButtonStyle = {
    backgroundColor: headerPrimaryColor || '#2B3244',
    color: headerFontColor || 'FFF',
    fontSize: '1rem',
  };

  useEffect(() => {
    eventBus.on(VISIBLE_CHART_DATA_DOWNLOAD_EVENT, handleSetVisibleChartData);

    return () => {
      eventBus.off(
        VISIBLE_CHART_DATA_DOWNLOAD_EVENT,
        handleSetVisibleChartData,
      );
    };
  }, [isModalOpen]);

  const handleSetVisibleChartData = (dataFromEvent: Event) => {
    const config = dataFromEvent.data as CurrentAreaConfig;
    setCurrentAreaConfing((prev) => {
      const alreadyExists = prev && prev.some((item) => item.id === config.id);
      if (alreadyExists) {
        return prev.map((item) => (item.id === config.id ? config : item));
      }
      return [...prev, config];
    });
  };

  const handleDownloadCSV = async (): Promise<void> => {
    if (selectedWidgetIds.length === 0) {
      return;
    }

    for (const currentAreaConfigElement of currentAreaConfig) {
      const currentAreaConfigElementId = currentAreaConfigElement.id;
      if (
        !currentAreaConfigElementId ||
        !selectedWidgetIds.includes(currentAreaConfigElementId)
      ) {
        continue;
      }

      const widget = availableWidgets.find(
        (widget) => widget.id === currentAreaConfigElementId,
      );
      if (
        currentAreaConfigElement.changeTimeFramePeriod &&
        currentAreaConfigElement.timeFramePeriod === ''
      ) {
        openSnackbar(
          `Zeitraum ist erforderlich : Widget - ${widget?.name}`,
          'warning',
        );
        return;
      }
    }

    setIsLoading(true);
    await downloadCSV(
      accessToken,
      id,
      type,
      openSnackbar,
      currentAreaConfig,
      selectedWidgetIds,
    );
    setIsLoading(false);
    handleCloseModal();
  };

  const getAllAvalilableWidgets = async (): Promise<void> => {
    const widgets = await getAvailableWidgets(accessToken, type, id);
    if (type === 'dashboard') {
      if (!widgets || !('panels' in widgets)) {
        return;
      }

      const result = widgets.panels.flatMap((panel) => {
        return panel.widgets.map((widget) => {
          return {
            id: widget.id as string,
            name: widget.name,
            panelName: panel.name,
            componentSubType: widget.tabs.map((tab) => tab.componentSubType)[0],
          };
        });
      });

      setAvailableWidgets(result);
    }
    if (type === 'widget') {
      if (!widgets || !('widget' in widgets)) {
        return;
      }
      const result = [
        {
          id: widgets.widget.id as string,
          name: widgets.widget.name,
        },
      ];

      setAvailableWidgets(result);
    }
  };

  const handleToggleWidget = (id: string, checked: boolean): void => {
    setSelectedWidgetIds((prev) =>
      checked
        ? prev.includes(id)
          ? prev
          : [...prev, id]
        : prev.filter((x) => x !== id),
    );
  };

  const handleToggleAll = (isSelected: boolean): void => {
    if (isSelected) {
      const allIds = availableWidgets.map((w) => w.id);
      setSelectedWidgetIds(allIds);
    } else {
      setSelectedWidgetIds([]);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    getAllAvalilableWidgets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, id, type]);

  return (
    <div>
      <button
        className="p-4 h-10 w-38 rounded-lg flex justify-center items-center"
        onClick={handleOpenModal}
        style={menuStyle ? menuStyle : dataexportButtonStyle}
        disabled={isLoading}
      >
        <div className="flex items-center">
          <DashboardIcons
            iconName="Download"
            color={menuStyle ? menuStyle.color : downloadButtonStyle.color}
          />
          <div className="ml-2 hidden sm:block">Datenexport</div>
        </div>
      </button>
      {/* Loading Modal */}
      {isModalOpen && (
        <Modal onClose={handleCloseModal} ciColors={ciColors}>
          <div className="mb-4">
            <PageHeadline
              headline="Data Export Manager"
              fontColor={panelFontColor || '#FFFFFF'}
            />
          </div>
          <div className="flex flex-col justify-center w-full">
            <CheckBox
              label={allSelected ? 'Alle abwählen' : 'Alle auswählen'}
              value={allSelected}
              handleSelectChange={(isSelected) => handleToggleAll(isSelected)}
            />
            <HorizontalDivider />
          </div>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <DashboardIcons
                iconName="Spinner"
                color={menuStyle ? menuStyle.color : downloadButtonStyle.color}
              />
              <p
                className="mt-4 text-base"
                style={{ color: widgetFontColor || '#FFFFFF' }}
              >
                Daten werden exportiert...
                <br />
                Je nach Größe des Dashboards kann es etwas dauern.
              </p>
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto">
              {availableWidgets.map((widget, indx) => {
                const itemCofig = currentAreaConfig.find(
                  (item) => item.id === widget.id,
                );

                const currentAreaConfigElement = currentAreaConfig.find(
                  (e) => e.id === widget.id,
                );

                return (
                  <div
                    key={indx}
                    className="flex flex-col justify-center w-full"
                  >
                    <div>
                      <CheckBox
                        label={`${widget.panelName ? widget.panelName + ' -' : ''} ${widget.name}`}
                        value={selectedWidgetIds.includes(widget.id)}
                        handleSelectChange={(isSelected) =>
                          handleToggleWidget(widget.id, isSelected)
                        }
                      />
                    </div>
                    {(widget.componentSubType ===
                      tabComponentSubTypeEnum.lineChart ||
                      widget.componentSubType ===
                        tabComponentSubTypeEnum.barChart ||
                      widget.componentSubType ===
                        tabComponentSubTypeEnum.barChartHorizontal) &&
                      selectedWidgetIds.includes(widget.id) && (
                        <div className="ml-5">
                          <div className="mt-4">
                            <CheckBox
                              label="Möchten Sie die Daten für den aktuellen Bereich herunterladen?"
                              value={itemCofig?.downloadCurrentArea ?? false}
                              handleSelectChange={(value) => {
                                setCurrentAreaConfing((prev) =>
                                  prev.map((item) =>
                                    item.id === widget.id
                                      ? {
                                          ...item,
                                          downloadCurrentArea: value,
                                          changeTimeFramePeriod: value
                                            ? false
                                            : (item?.changeTimeFramePeriod ??
                                              false),
                                        }
                                      : item,
                                  ),
                                );
                              }}
                            />
                          </div>
                          <div className="mt-4">
                            <CheckBox
                              label="Zeitspannenauswahl?"
                              value={itemCofig?.changeTimeFramePeriod ?? false}
                              handleSelectChange={(value) => {
                                setCurrentAreaConfing((prev) =>
                                  prev.map((item) =>
                                    item.id === widget.id
                                      ? {
                                          ...item,
                                          changeTimeFramePeriod: value,
                                          downloadCurrentArea: value
                                            ? false
                                            : (item?.downloadCurrentArea ??
                                              false),
                                        }
                                      : item,
                                  ),
                                );
                              }}
                            />
                          </div>
                          {itemCofig?.changeTimeFramePeriod &&
                            (currentAreaConfigElement?.authDataType !==
                            'usi' ? (
                              <div className="flex flex-col w-full pb-2">
                                <WizardLabel label="Zeitbereich" />
                                <WizardDropdownSelection
                                  currentValue={
                                    timeFrameWithoutLive.find(
                                      (option) =>
                                        option.value ===
                                        currentAreaConfigElement?.timeFramePeriod,
                                    )?.label || ''
                                  }
                                  selectableValues={timeFrameWithoutLive.map(
                                    (option) => option.label,
                                  )}
                                  onSelect={(label: string | number): void => {
                                    const enumValue = timeFrameWithoutLive.find(
                                      (option) => option.label === label,
                                    )?.value;
                                    setCurrentAreaConfing((prev) =>
                                      prev.map((item) =>
                                        item.id === widget.id
                                          ? ({
                                              ...item,
                                              timeFramePeriod:
                                                enumValue as timeframeEnum,
                                            } as CurrentAreaConfig)
                                          : item,
                                      ),
                                    );
                                  }}
                                  iconColor={ciColors.dashboardFontColor}
                                  borderColor={ciColors.panelBorderColor}
                                  backgroundColor={ciColors.headerPrimaryColor}
                                />
                              </div>
                            ) : (
                              <>
                                <div className="flex flex-col w-full pb-2">
                                  <WizardLabel label="Zeitbereich" />
                                  <WizardDropdownSelection
                                    currentValue={
                                      timeFrameWithoutLiveWithExakt.find(
                                        (option) =>
                                          option.value ===
                                          currentAreaConfigElement?.timeFramePeriod,
                                      )?.label || ''
                                    }
                                    selectableValues={timeFrameWithoutLiveWithExakt.map(
                                      (option) => option.label,
                                    )}
                                    onSelect={(
                                      label: string | number,
                                    ): void => {
                                      const enumValue =
                                        timeFrameWithoutLiveWithExakt.find(
                                          (option) => option.label === label,
                                        )?.value;
                                      setCurrentAreaConfing((prev) =>
                                        prev.map((item) =>
                                          item.id === widget.id
                                            ? ({
                                                ...item,
                                                timeFramePeriod:
                                                  enumValue as timeframeEnum,
                                              } as CurrentAreaConfig)
                                            : item,
                                        ),
                                      );
                                    }}
                                    iconColor={ciColors.dashboardFontColor}
                                    borderColor={ciColors.panelBorderColor}
                                    backgroundColor={
                                      ciColors.headerPrimaryColor
                                    }
                                  />
                                </div>
                              </>
                            ))}
                        </div>
                      )}
                    <HorizontalDivider />
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-4 flex flex-row justify-center justify-center items-center gap-3">
            <button
              className="p-4 h-10 w-38 rounded-lg flex justify-center items-center"
              onClick={handleCloseModal}
              style={menuStyle ? menuStyle : downloadButtonStyle}
              disabled={isLoading}
            >
              <div className="flex items-center">
                <div className="hidden sm:block">Abbrechen</div>
              </div>
            </button>
            <button
              className="p-4 h-10 w-38 rounded-lg flex justify-center items-center"
              onClick={handleDownloadCSV}
              style={menuStyle ? menuStyle : downloadButtonStyle}
              disabled={
                isLoading || selectedWidgetIds.length > 0 ? false : true
              }
            >
              <div className="flex items-center">
                <div className="hidden sm:block">Download</div>
              </div>
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
