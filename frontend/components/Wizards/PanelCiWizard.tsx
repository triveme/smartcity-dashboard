import React from 'react';
import ColorPickerComponent from '@/ui/ColorPickerComponent';
import WizardLabel from '@/ui/WizardLabel';

type Props = {
  panelPrimaryColor: string;
  setPanelPrimaryColor: (color: string) => void;
  panelSecondaryColor: string;
  setPanelSecondaryColor: (color: string) => void;
  panelBorderColor: string;
  setPanelBorderColor: (color: string) => void;
};

export default function PanelCiWizard({
  panelPrimaryColor,
  setPanelPrimaryColor,
  panelSecondaryColor,
  setPanelSecondaryColor,
  panelBorderColor,
  setPanelBorderColor,
}: Props): JSX.Element {
  return (
    <div className="flex flex-col w-full pb-2 px-4 transition-opacity duration-500 opacity-100">
      <div className="flex flex-col w-full">
        <WizardLabel label="Panel" />
        <div className="flex flex-wrap w-full gap-y-8">
          <div className="w-1/2">
            <ColorPickerComponent
              currentColor={panelPrimaryColor}
              handleColorChange={setPanelPrimaryColor}
              label="Primäre Hintergrundfarbe"
            />
          </div>
          <div className="w-1/2">
            <ColorPickerComponent
              currentColor={panelSecondaryColor}
              handleColorChange={setPanelSecondaryColor}
              label="Sekundäre Hintergrundfarbe"
            />
          </div>
          <div className="w-1/2">
            <ColorPickerComponent
              currentColor={panelBorderColor}
              handleColorChange={setPanelBorderColor}
              label="Rahmenfarbe"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
