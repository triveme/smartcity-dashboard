import React, { JSX } from 'react';
import ColorPickerComponent from '@/ui/ColorPickerComponent';
import WizardLabel from '@/ui/WizardLabel';
import WizardDropdownSelection from '@/ui/WizardDropdownSelection';
import { fontSizes } from '@/utils/objectHelper';
import HorizontalDivider from '@/ui/HorizontalDivider';
import WizardTextfield from '@/ui/WizardTextfield';

type Props = {
  dashboardPrimaryColor: string;
  setDashboardPrimaryColor: (color: string) => void;
  dashboardSecondaryColor: string;
  setDashboardSecondaryColor: (color: string) => void;
  dashboardHeadlineFontSize: string;
  setDashboardHeadlineFontSize: (fontSize: string) => void;
  dashboardInformationTextFontColor: string;
  setDashboardInformationTextFontColor: (fontColor: string) => void;
  dashboardInformationTextFontSize: string;
  setDashboardInformationTextFontSize: (fontSize: string) => void;
  iconColor: string;
  borderColor: string;
  backgroundColor: string;
};

export default function DashboardCiWizard({
  dashboardPrimaryColor,
  setDashboardPrimaryColor,
  dashboardSecondaryColor,
  setDashboardSecondaryColor,
  dashboardHeadlineFontSize,
  setDashboardHeadlineFontSize,
  dashboardInformationTextFontColor,
  setDashboardInformationTextFontColor,
  dashboardInformationTextFontSize,
  setDashboardInformationTextFontSize,
  iconColor,
  borderColor,
  backgroundColor,
}: Props): JSX.Element {
  return (
    <div className="flex flex-col w-full px-2 transition-opacity duration-500 opacity-100">
      <WizardLabel label="Dashboard" />
      <div className="flex flex-row w-full px-2">
        <div className="flex flex-col gap-y-6 w-1/2 px-2">
          <ColorPickerComponent
            currentColor={dashboardPrimaryColor}
            handleColorChange={setDashboardPrimaryColor}
            label="Primäre Hintergrundfarbe"
          />
          <ColorPickerComponent
            currentColor={dashboardSecondaryColor}
            handleColorChange={setDashboardSecondaryColor}
            label="Sekundäre Hintergrundfarbe"
          />
        </div>
        <div className="flex flex-col gap-y-6 w-1/2 px-2">
          <div>
            <WizardLabel label="Dashboard Name Schriftgröße" />
            <WizardDropdownSelection
              currentValue={dashboardHeadlineFontSize}
              selectableValues={['', ...fontSizes.map((size) => size + 'px')]}
              onSelect={(value: string | number): void =>
                setDashboardHeadlineFontSize(value.toString())
              }
              iconColor={iconColor}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
          </div>
        </div>
      </div>
      <HorizontalDivider />
      <WizardLabel label="Dashboard Informationstext" />
      <div className="flex-col">
        <div className="flex flex-row">
          <div className="flex flex-row w-1/2">
            <div className="flex w-1/3">
              <WizardLabel label="Schriftgröße" />
            </div>
            <div className="flex w-2/3">
              <WizardTextfield
                value={dashboardInformationTextFontSize}
                onChange={(value): void => {
                  setDashboardInformationTextFontSize(value.toString());
                }}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />
            </div>
          </div>
          <div className="flex w-1/2 ml-4 mt-2">
            <ColorPickerComponent
              currentColor={dashboardInformationTextFontColor}
              handleColorChange={setDashboardInformationTextFontColor}
              label="Schriftfarbe"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
