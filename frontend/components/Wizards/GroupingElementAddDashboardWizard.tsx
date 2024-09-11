import { ReactElement, useEffect, useState } from 'react';

import PageHeadline from '@/ui/PageHeadline';
import WizardLabel from '@/ui/WizardLabel';
import CancelButton from '@/ui/Buttons/CancelButton';
import SaveButton from '@/ui/Buttons/SaveButton';
import WizardDropdownSelection from '@/ui/WizardDropdownSelection';
import { Dashboard, GroupingElement, visibilityEnum } from '@/types';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import WizardTextfield from '@/ui/WizardTextfield';
import WizardSuffixUrlTextfield from '@/ui/WizardSuffixUrlTextfield';
import IconSelection from '@/ui/Icons/IconSelection';
import ColorPickerComponent from '@/ui/ColorPickerComponent';
import CheckBox from '@/ui/CheckBox';
import {
  postMenuGroupingElement,
  updateMenuGroupingElement,
} from '@/api/menu-service';
import { useAuth } from 'react-oidc-context';
import { WizardErrors } from '@/types/errors';
import { useParams } from 'next/navigation';
import { env } from 'next-runtime-env';

type GroupingElementWizardProps = {
  editElement: GroupingElement | undefined;
  parentGroup: GroupingElement | undefined;
  parentGroupId: string | undefined;
  allDashboards: Dashboard[];
  newElementPosition: number;
  onClose: () => void;
  iconColor: string;
  borderColor: string;
  backgroundColor: string;
  fontColor: string;
  geColor: string;
};

export default function GroupingElementAddDashboardWizard(
  props: GroupingElementWizardProps,
): ReactElement {
  const {
    editElement,
    // parentGroup,
    parentGroupId,
    allDashboards,
    newElementPosition,
    onClose,
    iconColor,
    borderColor,
    backgroundColor,
    fontColor,
    geColor,
  } = props;
  const auth = useAuth();
  const { openSnackbar } = useSnackbar();

  const params = useParams();
  const NEXT_PUBLIC_MULTI_TENANCY = env('NEXT_PUBLIC_MULTI_TENANCY');
  const tenant =
    NEXT_PUBLIC_MULTI_TENANCY === 'true' ? (params.tenant as string) : null;

  const [elementType, setElementType] = useState('Dashboardseite');
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard>();
  const [errors, setErrors] = useState<WizardErrors>({});

  // Group
  const [groupName, setGroupName] = useState('');
  const [groupUrl, setGroupUrl] = useState('');
  const [groupIcon, setGroupIcon] = useState('ChevronLeft');
  const [groupBackgroundColor, setGroupBackgroundColor] = useState('#ffffff');
  const [groupFontColor, setGroupFontColor] = useState(
    editElement?.fontColor && editElement?.fontColor !== geColor
      ? editElement?.fontColor
      : geColor,
  );
  const [groupIsGradient, setGroupIsGradient] = useState(false);

  const handleSaveClick = async (): Promise<void> => {
    if (elementType === 'Dashboardseite') {
      const tDashboard: GroupingElement = {
        id: editElement?.id || undefined,
        name: selectedDashboard?.name || null,
        url: selectedDashboard?.url || null,
        backgroundColor: null,
        fontColor: groupFontColor,
        gradient: null,
        icon: selectedDashboard?.icon || null,
        isDashboard: true,
        parentGroupingElementId: parentGroupId || null,
        position: newElementPosition,
        tenantAbbreviation: tenant,
      };
      await handleElementSave(tDashboard);
    } else {
      const tGroup: GroupingElement = {
        id: editElement?.id || undefined,
        name: groupName,
        backgroundColor: groupBackgroundColor,
        fontColor: groupFontColor,
        gradient: groupIsGradient,
        icon: groupIcon,
        isDashboard: false,
        parentGroupingElementId: parentGroupId || null,
        position: newElementPosition,
        tenantAbbreviation: tenant,
        url: groupUrl,
      };
      await handleElementSave(tGroup);
    }
  };

  const handleElementSave = async (element: GroupingElement): Promise<void> => {
    const textfieldErrorMessages: string[] = [];
    const errorsOccured: WizardErrors = {};

    if (!element.name) errorsOccured.nameError = 'Name muss ausgefüllt werden!';
    if (!element.url) errorsOccured.urlError = 'Url muss ausgefüllt werden!';
    if (element.url && element.url.length < 3)
      errorsOccured.urlError = 'Url muss mindestens drei Zeichen lang sein!';

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
      if (!element.id) {
        await postMenuGroupingElement(auth?.user?.access_token, element);
        openSnackbar('Menüelement wurde erfolgreich erstellt!', 'success');
      } else {
        await updateMenuGroupingElement(auth?.user?.access_token, element);
        openSnackbar('Menüelement wurde erfolgreich aktualisiert!', 'success');
      }
      onClose();
    } catch (error) {
      openSnackbar('Das Menüelement konnte nicht gespeichert werden.', 'error');
    }
  };

  const handleDashboardSelect = (dbName: string): void => {
    setSelectedDashboard(
      allDashboards.find((dashboard) => dashboard.name === dbName),
    );
  };

  useEffect(() => {
    if (editElement && !editElement.isDashboard) {
      setElementType('Gruppe');
      setGroupName(editElement.name || '');
      setGroupUrl(editElement.url || '');
      setGroupIcon(editElement.icon || '');
      setGroupBackgroundColor(editElement.backgroundColor || '');
      setGroupFontColor(editElement.fontColor || '');
      setGroupIsGradient(editElement.gradient || false);
    }
  }, [editElement]);

  useEffect(() => {
    if (editElement && editElement.isDashboard) {
      setSelectedDashboard({
        name: editElement.name,
        url: editElement.url,
        icon: editElement.icon,
        visibility: visibilityEnum.public,
        readRoles: [],
        writeRoles: [],
        type: '',
      });
    }
  }, [editElement]);

  useEffect(() => {
    if (!editElement) {
      assignFirstDashboardAsDefault();
    }
  }, [allDashboards]);

  const handleElementTypeSelect = (elementType: string): void => {
    setElementType(elementType);

    if (elementType === 'Dashboardseite') {
      assignFirstDashboardAsDefault();
    }
  };

  const assignFirstDashboardAsDefault = (): void => {
    if (allDashboards.length > 0) {
      const firstDashboard = allDashboards[0];
      setSelectedDashboard(firstDashboard);
      handleDashboardSelect(firstDashboard.name!);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1E1E1E] bg-opacity-70 flex flex-col justify-center items-center z-50">
      <div
        className="p-10 rounded-lg w-2/3 h-2/3 flex flex-col justify-between"
        style={{ backgroundColor: backgroundColor, color: fontColor }}
      >
        <PageHeadline headline="Element bearbeiten" fontColor={fontColor} />
        <div className="flex flex-col w-full pb-2">
          <WizardLabel label="Elementtyp" />
          <WizardDropdownSelection
            currentValue={elementType}
            selectableValues={['Dashboardseite', 'Gruppe']}
            onSelect={(value: string | number): void =>
              handleElementTypeSelect(value.toString())
            }
            iconColor={iconColor}
            borderColor={borderColor}
            backgroundColor={backgroundColor}
          />
        </div>
        {elementType === 'Dashboardseite' && (
          <div className="flex flex-col w-full pb-2">
            <WizardLabel label="Dashboard" />
            <div className="flex flex-row items-center gap-4">
              <div className="flex grow">
                <WizardDropdownSelection
                  currentValue={selectedDashboard?.name || ''}
                  selectableValues={allDashboards.map(
                    (dashboard) => dashboard.name!,
                  )}
                  onSelect={(value: string | number): void =>
                    handleDashboardSelect(value.toString())
                  }
                  iconColor={iconColor}
                  borderColor={borderColor}
                  backgroundColor={backgroundColor}
                />
              </div>
              <ColorPickerComponent
                currentColor={groupFontColor || fontColor}
                handleColorChange={setGroupFontColor}
                label={'Menu Schriftfarbe'}
              />
            </div>
          </div>
        )}
        {elementType === 'Gruppe' && (
          <div className="flex flex-col justify-between">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label="Name" />
                <div className="flex flex-row items-center gap-4">
                  <div className="flex grow">
                    <WizardTextfield
                      value={groupName}
                      onChange={(value: string | number): void =>
                        setGroupName(value.toString())
                      }
                      error={errors && errors.nameError}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                  <ColorPickerComponent
                    currentColor={groupFontColor || fontColor}
                    handleColorChange={setGroupFontColor}
                    label={'Menü Schriftfarbe'}
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
            </div>
            <div className="flex flex-row gap-4">
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label="Icon" />
                <IconSelection
                  activeIcon={groupIcon}
                  handleIconSelect={setGroupIcon}
                  iconColor={iconColor}
                  borderColor={borderColor}
                />
              </div>
              <div className="flex flex-col w-full pb-2">
                <WizardLabel label="Farbe" />
                <div className="flex justify-start">
                  <ColorPickerComponent
                    currentColor={groupBackgroundColor}
                    handleColorChange={setGroupBackgroundColor}
                    label="Icon Farbe"
                  />
                  <CheckBox
                    label={'Farbverlauf'}
                    value={groupIsGradient}
                    handleSelectChange={setGroupIsGradient}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="flex-grow"></div>
        <div className="flex justify-end py-4">
          <CancelButton closeWindow={true} onClick={(): void => onClose()} />
          <SaveButton handleSaveClick={handleSaveClick} />
        </div>
      </div>
    </div>
  );
}
