import React from 'react';
import ColorPickerComponent from '@/ui/ColorPickerComponent';
import WizardLabel from '@/ui/WizardLabel';

type Props = {
  dashboardPrimaryColor: string;
  setDashboardPrimaryColor: (color: string) => void;
  dashboardSecondaryColor: string;
  setDashboardSecondaryColor: (color: string) => void;
};

export default function DashboardCiWizard({
  dashboardPrimaryColor,
  setDashboardPrimaryColor,
  dashboardSecondaryColor,
  setDashboardSecondaryColor,
}: Props): JSX.Element {
  return (
    <div className="flex flex-col w-full pb-2 px-4 transition-opacity duration-500 opacity-100">
      <div className="flex flex-col w-full">
        <WizardLabel label="Dashboard" />
        <div className="flex flex-wrap w-full">
          <div className="w-1/2">
            <ColorPickerComponent
              currentColor={dashboardPrimaryColor}
              handleColorChange={setDashboardPrimaryColor}
              label="Primäre Hintergrundfarbe"
            />
          </div>
          <div className="w-1/2">
            <ColorPickerComponent
              currentColor={dashboardSecondaryColor}
              handleColorChange={setDashboardSecondaryColor}
              label="Sekundäre Hintergrundfarbe"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
