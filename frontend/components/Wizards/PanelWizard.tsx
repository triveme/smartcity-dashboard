'use client';

import { ReactElement, useState } from 'react';
import { useAuth } from 'react-oidc-context';

import CancelButton from '@/ui/Buttons/CancelButton';
import SaveButton from '@/ui/Buttons/SaveButton';
import PageHeadline from '@/ui/PageHeadline';
import WizardLabel from '@/ui/WizardLabel';
import WizardTextfield from '@/ui/WizardTextfield';
import { Panel, tabComponentSubTypeEnum, tabComponentTypeEnum } from '@/types';
import { postPanel, updatePanel, deletePanel } from '@/api/panel-service';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import ValueSelectionSlider from '@/ui/ValueSelectionSlider';
import WizardSelectBox from '@/ui/WizardSelectBox';

type PanelWizardProps = {
  isCreate: boolean;
  activePanel: Panel;
  panels: Panel[];
  onClose: () => void;
  handlePanelChange: (panels: Panel[]) => void;
  fontColor: string;
  backgroundColor: string;
  borderColor: string;
};

export default function PanelWizard(props: PanelWizardProps): ReactElement {
  const {
    isCreate,
    activePanel,
    panels,
    onClose,
    handlePanelChange,
    fontColor,
    borderColor,
    backgroundColor,
  } = props;

  const [panelName, setPanelName] = useState(activePanel?.name || '');
  const [panelWidth, setPanelWidth] = useState(activePanel?.width || 6);
  const [panelInfoMsg, setPanelInfoMsg] = useState(activePanel?.info || '');
  const [panelGeneralInfo, setPanelGeneralInfo] = useState(
    activePanel?.generalInfo || '',
  );
  const [panelShowGeneralInfo, setPanelShowGeneralInfo] = useState(
    activePanel?.showGeneralInfo || false,
  );
  const [panelPosition] = useState(activePanel?.position || panels.length);
  const [error, setError] = useState('');
  const [generalInfoError, setGeneralInfoError] = useState('');
  const auth = useAuth();
  const { openSnackbar } = useSnackbar();

  const handleSavePanelClick = async (): Promise<void> => {
    let hasError = false;

    if (!panelName) {
      setError('Einige Felder müssen ausgefüllt werden!');
      openSnackbar('Einige Felder müssen ausgefüllt werden!', 'warning');
      hasError = true;
    } else {
      setError('');
    }

    if (panelShowGeneralInfo && !panelGeneralInfo) {
      setGeneralInfoError(
        'Allgemeine Infobeschreibung muss ausgefüllt werden!',
      );
      openSnackbar(
        'Allgemeine Infobeschreibung muss ausgefüllt werden!',
        'warning',
      );
      hasError = true;
    } else {
      setGeneralInfoError('');
    }

    if (hasError) return;

    try {
      const updatedPanel: Panel = {
        name: panelName,
        height: activePanel?.height || 400,
        width: panelWidth,
        id: activePanel.id,
        position: panelPosition,
        info: panelInfoMsg,
        generalInfo: panelGeneralInfo,
        showGeneralInfo: panelShowGeneralInfo,
      };

      if (updatedPanel.id) {
        await updatePanel(auth.user?.access_token, updatedPanel);
        openSnackbar('Das Panel wurde erfolgreich aktualisiert!', 'success');
      } else {
        await postPanel(auth.user?.access_token, updatedPanel);
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
    <div className="fixed inset-0 bg-[#1E1E1E] bg-opacity-70 flex justify-center items-center z-50">
      <div
        className="p-10 rounded-lg w-2/3 flex flex-col justify-between"
        style={{ backgroundColor: backgroundColor, color: fontColor }}
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
              error={error}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
          </div>
          <div className="flex flex-col w-full pb-2">
            <WizardLabel label="Breite" />
            <div className="flex gap-4">
              <ValueSelectionSlider
                value={panelWidth}
                minValue={4}
                maxValue={12}
                onChange={(value: number | string): void =>
                  setPanelWidth(value as number)
                }
                borderColor={borderColor}
              />
            </div>
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
              if (!value) setGeneralInfoError('');
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
                error={generalInfoError}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />
            </div>
          )}
        </div>
        <div className="flex justify-end pt-4">
          <CancelButton
            closeWindow={true}
            onClick={async (): Promise<void> => {
              if (isCreate && activePanel?.id) {
                await deletePanel(auth.user?.access_token, activePanel.id);
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
