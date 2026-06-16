'use client';

import { ReactElement, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import DashboardIcons from '../Icons/DashboardIcon';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import { downloadCSV } from '@/utils/downloadHelper';
import Modal from '../Modal/Modal';
import { CorporateInfo, CurrentAreaConfig, timeframeEnum } from '@/types';
import CheckBox from '../CheckBox';
import eventBus, {
  Event,
  VISIBLE_CHART_DATA_DOWNLOAD_EVENT,
} from '@/app/EventBus';
import WizardSelectBox from '../WizardSelectBox';
import {
  timeFrameWithoutLive,
  timeFrameWithoutLiveWithExakt,
} from '@/utils/enumMapper';
import WizardDropdownSelection from '../WizardDropdownSelection';
import WizardLabel from '../WizardLabel';

type SmallDataExportButtonProps = {
  id: string;
  type: string;
  widgetPrimaryColor?: string;
  widgetFontColor?: string;
  ciColors: CorporateInfo;
};

export default function SmallDataExportButton(
  props: SmallDataExportButtonProps,
): ReactElement {
  const { id, type, widgetPrimaryColor, widgetFontColor, ciColors } = props;
  const { openSnackbar } = useSnackbar();
  const [isDisabled, setIsDisabled] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allWidgetsCurrentAreaConfig, setAllWidgetsCurrentAreaConfing] =
    useState<CurrentAreaConfig[]>([]);
  const [widgetCurrentAreaConfig, setWidgetCurrentAreaConfing] =
    useState<CurrentAreaConfig>();

  const widgetStyle = {
    backgroundColor: widgetPrimaryColor ?? '#3D4760',
    color: widgetFontColor || '#FFF',
  };

  const buttonStyle = {
    backgroundColor: ciColors.headerPrimaryColor || '#2B3244',
    color: ciColors.headerFontColor || 'FFF',
    fontSize: '1rem',
    borderRadius: ciColors.panelBorderRadius,
    borderWidth: '1px',
    borderColor: ciColors.headerFontColor,
  };

  const auth = useAuth();
  const accessToken = auth.user?.access_token || '';

  useEffect(() => {
    eventBus.on(VISIBLE_CHART_DATA_DOWNLOAD_EVENT, handleSetVisibleChartData);

    return () => {
      eventBus.off(
        VISIBLE_CHART_DATA_DOWNLOAD_EVENT,
        handleSetVisibleChartData,
      );
    };
  }, [isModalOpen]);

  useEffect(() => {
    const widgetConfig = allWidgetsCurrentAreaConfig.find(
      (item) => item.id === id,
    );
    setWidgetCurrentAreaConfing(widgetConfig);
  }, [id, allWidgetsCurrentAreaConfig]);

  const handleSetVisibleChartData = (dataFromEvent: Event) => {
    const config = dataFromEvent.data as CurrentAreaConfig;
    setAllWidgetsCurrentAreaConfing((prev) => {
      const alreadyExists = prev && prev.some((item) => item.id === config.id);
      if (alreadyExists) {
        return prev.map((item) => (item.id === config.id ? config : item));
      }
      return [...prev, config];
    });
  };

  const handleDownloadCSV = async (): Promise<void> => {
    if (
      widgetCurrentAreaConfig?.changeTimeFramePeriod &&
      widgetCurrentAreaConfig?.timeFramePeriod === ''
    ) {
      openSnackbar('Zeitraum ist erforderlich', 'warning');
      return;
    }
    setIsLoading(true);
    setIsDisabled(true);
    await downloadCSV(
      accessToken,
      id,
      type,
      openSnackbar,
      widgetCurrentAreaConfig as CurrentAreaConfig,
    );
    setIsLoading(false);
    setIsDisabled(false);
    handleCloseModal();
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <button
        style={{ color: widgetStyle.color }}
        onClick={handleOpenModal}
        disabled={isDisabled}
      >
        <DashboardIcons
          iconName="Download"
          color={`${widgetStyle.color}`}
          size="lg"
        />
      </button>
      {isModalOpen && (
        <Modal onClose={handleCloseModal} ciColors={ciColors}>
          <div>
            <CheckBox
              label="Möchten Sie die Daten für den aktuellen Bereich herunterladen?"
              value={widgetCurrentAreaConfig?.downloadCurrentArea ?? false}
              handleSelectChange={(value) =>
                setWidgetCurrentAreaConfing((prev) => {
                  return {
                    ...prev,
                    downloadCurrentArea: value,
                    changeTimeFramePeriod: value
                      ? false
                      : (prev?.changeTimeFramePeriod ?? false),
                  } as CurrentAreaConfig;
                })
              }
            />
          </div>
          <div className="mt-4">
            <CheckBox
              label="Zeitspannenauswahl?"
              value={widgetCurrentAreaConfig?.changeTimeFramePeriod ?? false}
              handleSelectChange={(value) => {
                setWidgetCurrentAreaConfing((prev) => {
                  return {
                    ...prev,
                    changeTimeFramePeriod: value,
                    downloadCurrentArea: value
                      ? false
                      : (prev?.downloadCurrentArea ?? false),
                  } as CurrentAreaConfig;
                });
              }}
            />
          </div>
          {widgetCurrentAreaConfig?.changeTimeFramePeriod &&
            (widgetCurrentAreaConfig?.authDataType !== 'usi' ? (
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label="Zeitbereich" />
                <WizardDropdownSelection
                  currentValue={
                    timeFrameWithoutLive.find(
                      (option) =>
                        option.value ===
                        widgetCurrentAreaConfig?.timeFramePeriod,
                    )?.label || ''
                  }
                  selectableValues={timeFrameWithoutLive.map(
                    (option) => option.label,
                  )}
                  onSelect={(label: string | number): void => {
                    const enumValue = timeFrameWithoutLive.find(
                      (option) => option.label === label,
                    )?.value;
                    setWidgetCurrentAreaConfing((prev) => {
                      return {
                        ...prev,
                        timeFramePeriod: enumValue as timeframeEnum,
                      } as CurrentAreaConfig;
                    });
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
                          widgetCurrentAreaConfig?.timeFramePeriod,
                      )?.label || ''
                    }
                    selectableValues={timeFrameWithoutLiveWithExakt.map(
                      (option) => option.label,
                    )}
                    onSelect={(label: string | number): void => {
                      const enumValue = timeFrameWithoutLiveWithExakt.find(
                        (option) => option.label === label,
                      )?.value;
                      setWidgetCurrentAreaConfing((prev) => {
                        return {
                          ...prev,
                          timeFramePeriod: enumValue as timeframeEnum,
                        } as CurrentAreaConfig;
                      });
                    }}
                    iconColor={ciColors.dashboardFontColor}
                    borderColor={ciColors.panelBorderColor}
                    backgroundColor={ciColors.headerPrimaryColor}
                  />
                </div>
              </>
            ))}

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <DashboardIcons iconName="Spinner" color={buttonStyle.color} />
              <p
                className="mt-4 text-base"
                style={{ color: widgetFontColor || '#FFFFFF' }}
              >
                Daten werden exportiert...
                <br />
                Je nach Größe kann es etwas dauern.
              </p>
            </div>
          )}
          <div className="mt-4 flex flex-row justify-center justify-center items-center gap-3">
            <button
              className="p-4 h-10 w-38 rounded-lg flex justify-center items-center"
              onClick={handleCloseModal}
              style={buttonStyle}
              disabled={isDisabled}
            >
              <div className="flex items-center">
                <div className="hidden sm:block">Abbrechen</div>
              </div>
            </button>
            <button
              className="p-4 h-10 w-38 rounded-lg flex justify-center items-center"
              onClick={handleDownloadCSV}
              style={buttonStyle}
              disabled={isDisabled}
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
