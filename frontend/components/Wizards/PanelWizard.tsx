'use client';

import { ReactElement, useEffect, useMemo, useState } from 'react';
import Cookies from 'js-cookie';

import CancelButton from '@/ui/Buttons/CancelButton';
import SaveButton from '@/ui/Buttons/SaveButton';
import PageHeadline from '@/ui/PageHeadline';
import WizardLabel from '@/ui/WizardLabel';
import WizardTextfield from '@/ui/WizardTextfield';
import {
  GroupingElement,
  Panel,
  tabComponentSubTypeEnum,
  tabComponentTypeEnum,
} from '@/types';
import { postPanel, updatePanel, deletePanel } from '@/api/panel-service';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import WizardSelectBox from '@/ui/WizardSelectBox';
import WizardDropdownSelection from '@/ui/WizardDropdownSelection';
import { widthTypes } from '@/utils/enumMapper';
import IconSelection from '@/ui/Icons/IconSelection';
import { getTenantOfPage } from '@/utils/tenantHelper';
import { useQuery } from '@tanstack/react-query';
import { WizardErrors } from '@/types/errors';
import { getMenuGroupingElements } from '@/api/menu-service';
import ColorPickerComponent from '@/ui/ColorPickerComponent';

type PanelWizardProps = {
  isCreate: boolean;
  activePanel: Panel;
  panels: Panel[];
  onClose: () => void;
  handlePanelChange: (panels: Panel[]) => void;
  fontColor: string;
  iconColor: string;
  backgroundColor: string;
  borderColor: string;
};

type DashboardDropdown = {
  name: string;
  url: string;
};

export default function PanelWizard(props: PanelWizardProps): ReactElement {
  const {
    isCreate,
    activePanel,
    panels,
    onClose,
    handlePanelChange,
    fontColor,
    iconColor,
    borderColor,
    backgroundColor,
  } = props;

  const cookie = Cookies.get('access_token');
  const accessToken = cookie || '';
  const tenant = getTenantOfPage();
  const { openSnackbar } = useSnackbar();

  const [panelName, setPanelName] = useState(activePanel?.name || '');
  const [panelWidth, setPanelWidth] = useState<number>(activePanel?.width || 6);
  const [panelInfoMsg, setPanelInfoMsg] = useState(activePanel?.info || '');
  const [panelJumpoffDashboard, setPanelJumpoffDashboard] = useState('');
  const [panelJumpoffUrl, setPanelJumpoffUrl] = useState('');
  const [panelPosition] = useState(activePanel?.position || panels.length);
  const [panelGeneralInfo, setPanelGeneralInfo] = useState(
    activePanel?.generalInfo || '',
  );
  const [panelShowGeneralInfo, setPanelShowGeneralInfo] = useState(
    activePanel?.showGeneralInfo || false,
  );
  const [panelShowJumpoffButton, setPanelShowJumpoffButton] = useState(
    activePanel?.showJumpoffButton || false,
  );
  const [panelJumpoffLabel, setPanelJumpoffLabel] = useState(
    activePanel?.jumpoffLabel || '',
  );
  const [panelJumpoffIcon, setPanelJumpoffIcon] = useState(
    activePanel?.jumpoffIcon || '',
  );
  const [panelHeadlinecolor, setPanelHeadlinecolor] = useState(
    activePanel?.headlineColor || '',
  );

  const [errors, setErrors] = useState<WizardErrors>({});

  const { data: groupingElementsData, isLoading } = useQuery({
    queryKey: ['menu'],
    queryFn: () => getMenuGroupingElements(tenant, accessToken!),
  });

  function createDashboardUrls(
    groupingElements: GroupingElement[],
    parentUrl: string = '',
    isTopLevel: boolean = true,
  ): DashboardDropdown[] {
    let dashboardUrls: DashboardDropdown[] = isTopLevel
      ? [{ name: '', url: '' }]
      : [];

    for (const element of groupingElements) {
      if (!element.isDashboard && element.children) {
        const currentUrl = parentUrl
          ? `${parentUrl}/${element.url}`
          : element.url ?? '';
        dashboardUrls = dashboardUrls.concat(
          createDashboardUrls(element.children, currentUrl, false),
        );
      } else if (element.isDashboard && element.name && element.url) {
        dashboardUrls.push({
          name: element.name,
          url: `${parentUrl}/${element.url}`,
        });
      }
    }

    return dashboardUrls;
  }

  const dashboardDropdown = useMemo(() => {
    if (groupingElementsData && groupingElementsData.length > 0) {
      return createDashboardUrls(groupingElementsData);
    }
    return [];
  }, [groupingElementsData]);

  useEffect(() => {
    if (dashboardDropdown.length > 0) {
      const selectedDashboard = dashboardDropdown.find(
        (dashboard) => dashboard.url === activePanel?.jumpoffUrl,
      );
      if (selectedDashboard) {
        setPanelJumpoffDashboard(
          `${selectedDashboard.name} | ${selectedDashboard.url}`,
        );
        setPanelJumpoffUrl(selectedDashboard.url);
      } else {
        setPanelJumpoffDashboard('');
        setPanelJumpoffUrl('');
      }
    }
  }, [dashboardDropdown, activePanel?.jumpoffUrl]);

  const handleSavePanelClick = async (): Promise<void> => {
    const textfieldErrorMessages: string[] = [];
    const errorsOccured: WizardErrors = {};

    if (panelShowGeneralInfo && !panelGeneralInfo)
      errorsOccured.panelGeneralInfoError =
        'Allgemeine Infobeschreibung muss ausgefüllt werden!';
    if (panelShowJumpoffButton) {
      if (!panelJumpoffLabel)
        errorsOccured.panelJumpoffLabel =
          'Button-Beschriftung muss ausgefüllt werden!!';
      if (!panelJumpoffUrl)
        errorsOccured.panelJumpoffUrl = 'Jumpoff-URL muss ausgefüllt werden!';
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
      const updatedPanel: Panel = {
        name: panelName,
        generalInfo: panelGeneralInfo,
        headlineColor: panelHeadlinecolor,
        height: activePanel?.height || 400,
        id: activePanel.id,
        info: panelInfoMsg,
        jumpoffIcon: panelJumpoffIcon,
        jumpoffLabel: panelJumpoffLabel,
        jumpoffUrl: panelJumpoffUrl,
        position: panelPosition,
        showGeneralInfo: panelShowGeneralInfo,
        showJumpoffButton: panelShowJumpoffButton,
        width: panelWidth,
      };

      if (updatedPanel.id) {
        await updatePanel(accessToken, updatedPanel);
        openSnackbar('Das Panel wurde erfolgreich aktualisiert!', 'success');
      } else {
        await postPanel(accessToken, updatedPanel);
        openSnackbar('Das Panel wurde erfolgreich erstellt!', 'success');
      }

      handlePanelChange(
        [...panels.filter((p) => p.id !== updatedPanel.id), updatedPanel].sort(
          (a, b) => a.position - b.position,
        ),
      );

      onClose();
    } catch (error) {
      openSnackbar('Das Panel konnte nicht gespeichert werden.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1E1E1E] bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div
        className="p-10 rounded-lg w-2/3 flex flex-col justify-between"
        style={{
          backgroundColor: backgroundColor,
          color: fontColor,
          overflowY: 'auto',
          maxHeight: 'calc(100vh - 2rem)',
        }}
      >
        <div>
          <PageHeadline headline="Panel hinzufügen" fontColor={fontColor} />
        </div>
        <div className="w-full h-full flex flex-col ">
          <div className="flex flex-col w-full pb-2">
            <WizardLabel label="Name" />
            <WizardTextfield
              value={panelName}
              onChange={(value: string | number): void =>
                setPanelName(value.toString())
              }
              error={errors.nameError}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
            <ColorPickerComponent
              currentColor={panelHeadlinecolor || fontColor}
              handleColorChange={setPanelHeadlinecolor}
              label={'Schriftfarbe des Panelnamens'}
            />
          </div>
          <div className="flex flex-col w-full pb-2">
            <WizardLabel label="Breite" />
            <WizardDropdownSelection
              currentValue={
                widthTypes.find((option) => option.value === panelWidth)
                  ?.label || ''
              }
              selectableValues={widthTypes.map((option) => option.label)}
              onSelect={(value: number | string): void => {
                const selectedOption = widthTypes.find(
                  (option) => option.label === value,
                );
                if (selectedOption) {
                  setPanelWidth(selectedOption.value);
                }
              }}
              iconColor={iconColor}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
          </div>
          <div className="flex flex-col w-full pb-2">
            <WizardLabel label="Info-Nachricht" />
            <WizardTextfield
              value={panelInfoMsg}
              onChange={(value: string | number): void =>
                setPanelInfoMsg(value.toString())
              }
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
          </div>
          <WizardSelectBox
            label="Allgemeine Informationen anzeigen"
            checked={panelShowGeneralInfo}
            onChange={(value: boolean): void => {
              setPanelShowGeneralInfo(value);
            }}
          />
          {panelShowGeneralInfo && (
            <div className="flex flex-col w-full pb-2">
              <WizardLabel label="Allgemeine Infobeschreibung" />
              <WizardTextfield
                value={panelGeneralInfo}
                onChange={(value: string | number): void =>
                  setPanelGeneralInfo(value.toString())
                }
                componentType={tabComponentTypeEnum.information}
                subComponentType={tabComponentSubTypeEnum.text}
                error={errors.panelGeneralInfoError}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />
            </div>
          )}
          <WizardSelectBox
            label="Jumpoff-Button aktivieren"
            checked={panelShowJumpoffButton}
            onChange={(value: boolean): void => {
              setPanelShowJumpoffButton(value);
            }}
          />
          {panelShowJumpoffButton && (
            <>
              <div className="flex flex-row w-full gap-x-4 pb-2">
                <div className="flex flex-col w-1/2">
                  <WizardLabel label="Icon" />
                  <IconSelection
                    activeIcon={panelJumpoffIcon || ''}
                    handleIconSelect={setPanelJumpoffIcon}
                    iconColor={fontColor}
                    borderColor={borderColor}
                  />
                </div>
                <div className="flex flex-col w-1/2">
                  <WizardLabel label="Button-Beschriftung" />
                  <WizardTextfield
                    value={panelJumpoffLabel}
                    onChange={(value: string | number): void =>
                      setPanelJumpoffLabel(value.toString())
                    }
                    error={errors.panelJumpoffLabel}
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                  />
                </div>
              </div>
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label="Dashboard zu Jumpoff (Dashboard-Name | URL)" />
                {!isLoading ? (
                  <WizardDropdownSelection
                    currentValue={panelJumpoffDashboard}
                    selectableValues={dashboardDropdown.map((option) =>
                      option.name ? `${option.name} | ${option.url}` : '',
                    )}
                    onSelect={(value: string | number): void => {
                      // skip the first element in the array, assign second element to selectedUrl
                      const [, selectedUrl] = value.toString().split(' | ');
                      setPanelJumpoffDashboard(value.toString());
                      setPanelJumpoffUrl(selectedUrl);
                    }}
                    iconColor={fontColor}
                    backgroundColor={backgroundColor}
                    borderColor={borderColor}
                    error={errors.panelJumpoffUrl}
                  />
                ) : (
                  <div>Loading...</div>
                )}
              </div>
            </>
          )}
        </div>
        <div className="flex justify-end pt-4">
          <CancelButton
            closeWindow={true}
            onClick={async (): Promise<void> => {
              if (isCreate && activePanel?.id) {
                await deletePanel(accessToken, activePanel.id);
                handlePanelChange(
                  panels.filter((panel) => panel.id !== activePanel.id),
                );
              }
              onClose();
            }}
          />
          <SaveButton handleSaveClick={handleSavePanelClick} />
        </div>
      </div>
    </div>
  );
}
