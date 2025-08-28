import { ReactElement, useEffect, useState } from 'react';

import { GroupingElement } from '@/types';
import PageHeadline from '@/ui/PageHeadline';
import WizardLabel from '@/ui/WizardLabel';
import WizardTextfield from '@/ui/WizardTextfield';
import IconSelection from '@/ui/Icons/IconSelection';
import CancelButton from '@/ui/Buttons/CancelButton';
import SaveButton from '@/ui/Buttons/SaveButton';
import ColorPickerComponent from '@/ui/ColorPickerComponent';
import CheckBox from '@/ui/CheckBox';
import {
  postMenuGroupingElement,
  updateMenuGroupingElement,
} from '@/api/menu-service';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import WizardSuffixUrlTextfield from '@/ui/WizardSuffixUrlTextfield';
import { WizardErrors } from '@/types/errors';
import { useAuth } from 'react-oidc-context';
import { useParams } from 'next/navigation';

type GroupingElementWizardProps = {
  groupingElement: GroupingElement | undefined;
  newPosition: number;
  onClose: () => void;
  fontColor: string;
  backgroundColor: string;
  borderColor: string;
};

export default function GroupingElementWizard(
  props: GroupingElementWizardProps,
): ReactElement {
  const {
    groupingElement,
    newPosition,
    onClose,
    fontColor,
    borderColor,
    backgroundColor,
  } = props;
  const [groupId, setGroupId] = useState<string | undefined>(undefined);
  const [groupName, setGroupName] = useState('');
  const [groupUrl, setGroupUrl] = useState('');
  const [groupIcon, setGroupIcon] = useState('');
  const [groupBackgroundColor, setBackgroundGroupColor] = useState('');
  const [groupFontColor, setGroupFontColor] = useState('');
  const [groupIsGradient, setGroupIsGradient] = useState(false);
  const [errors, setErrors] = useState<WizardErrors>({});
  const { openSnackbar } = useSnackbar();
  const auth = useAuth();

  const handleSaveClick = async (): Promise<void> => {
    const params = useParams();
    const tenant = (params.tenant as string) || undefined;

    const tGroup: GroupingElement = {
      id: groupId || undefined,
      name: groupName,
      url: groupUrl,
      icon: groupIcon,
      backgroundColor: groupBackgroundColor,
      fontColor: groupFontColor,
      gradient: groupIsGradient,
      isDashboard: false,
      children: groupingElement?.children || [],
      parentGroupingElementId: null,
      position: newPosition,
      tenantAbbreviation: tenant || null,
    };

    const textfieldErrorMessages: string[] = [];
    const errorsOccured: WizardErrors = {};
    if (!groupName) {
      errorsOccured.nameError = 'Name is required!';
    }
    if (!groupUrl) {
      errorsOccured.urlError = 'Url is required!';
    }
    if (!groupBackgroundColor) {
      errorsOccured.colorError = 'Color is required!';
    }
    if (Object.keys(errorsOccured).length) {
      textfieldErrorMessages.push('Some fields require value!');
    }
    if (groupUrl.length < 3) {
      errorsOccured.urlError =
        'Url field must be at least three characters long';
      textfieldErrorMessages.push(errorsOccured.urlError);
    }
    if (textfieldErrorMessages.length > 0) {
      for (const message of textfieldErrorMessages) {
        openSnackbar(message, 'warning');
      }
      setErrors(errorsOccured);
      return;
    }
    try {
      if (!tGroup.id) {
        await postMenuGroupingElement(auth?.user?.access_token, tGroup);
        openSnackbar('Element erfolgreich erstellt!', 'success');
      } else {
        await updateMenuGroupingElement(auth?.user?.access_token, tGroup);
        openSnackbar('Element erfolgreich verändert!', 'success');
      }
      onClose();
    } catch (error) {
      openSnackbar('Fehler beim Speichern des Elements.', 'error');
    }
    onClose();
  };

  useEffect(() => {
    if (groupingElement) {
      setGroupId(groupingElement.id || undefined);
      setGroupName(groupingElement.name!);
      setGroupUrl(groupingElement.url!);
      setGroupIcon(groupingElement.icon!);
      setBackgroundGroupColor(groupingElement.backgroundColor || '#FFFFFF');
      setGroupIsGradient(groupingElement.gradient!);
    }
  }, [groupingElement]);

  return (
    <div className="fixed inset-0 bg-[#1E1E1E] bg-opacity-70 flex flex-col justify-center items-center">
      <div className="bg-[#2B3244] p-10 rounded-lg w-2/3 h-2/3 flex flex-col justify-between">
        <PageHeadline headline="Gruppe bearbeiten" fontColor={fontColor} />
        <div className="flex flex-col w-full pb-2">
          <WizardLabel label="Name" />
          <div className="flex flex-row">
            <WizardTextfield
              value={groupName}
              onChange={(value: string | number): void =>
                setGroupName(value.toString())
              }
              error={errors && errors.nameError}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
            <ColorPickerComponent
              currentColor={groupFontColor || fontColor}
              handleColorChange={setGroupFontColor}
              label={'Überschriftfarbe'}
            />
          </div>
        </div>
        <div className="flex flex-col w-full pb-2">
          <WizardLabel label="Url" />
          <WizardSuffixUrlTextfield
            value={groupUrl}
            onChange={(value: string | number): void =>
              setGroupUrl(value.toString())
            }
            error={errors && errors.urlError}
            borderColor={borderColor}
          />
        </div>
        <div className="flex flex-col w-full pb-2">
          <WizardLabel label="Icon" />
          <IconSelection
            activeIcon={groupIcon}
            handleIconSelect={setGroupIcon}
            iconColor={fontColor}
            borderColor={borderColor}
          />
        </div>
        <div className="flex flex-col w-full pb-2">
          <WizardLabel label="Farbe" />
          <div className="flex justify-start">
            <ColorPickerComponent
              currentColor={groupBackgroundColor}
              handleColorChange={setBackgroundGroupColor}
              label="Hintergrundfarbe"
            />
            <CheckBox
              label={'Farbverlauf'}
              value={groupIsGradient}
              handleSelectChange={setGroupIsGradient}
            />
          </div>
        </div>
        <div className="flex-grow"></div>
        <div className="flex justify-end py-4">
          <CancelButton closeWindow={true} onClick={(): void => onClose()} />
          <SaveButton handleSaveClick={handleSaveClick} />
        </div>
      </div>
    </div>
  );
}
