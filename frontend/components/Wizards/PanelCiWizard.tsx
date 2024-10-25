import React from 'react';
import ColorPickerComponent from '@/ui/ColorPickerComponent';
import WizardLabel from '@/ui/WizardLabel';
import WizardTextfield from '@/ui/WizardTextfield';

type Props = {
  panelPrimaryColor: string;
  setPanelPrimaryColor: (color: string) => void;
  panelSecondaryColor: string;
  setPanelSecondaryColor: (color: string) => void;
  panelBorderColor: string;
  setPanelBorderColor: (color: string) => void;
  panelBorderSize: string;
  setPanelBorderSize: (size: string) => void;
  panelBorderRadius: string;
  setPanelBorderRadius: (radius: string) => void;
  borderColor: string;
  backgroundColor: string;
};

export default function PanelCiWizard({
  panelPrimaryColor,
  setPanelPrimaryColor,
  panelSecondaryColor,
  setPanelSecondaryColor,
  panelBorderColor,
  setPanelBorderColor,
  panelBorderSize,
  setPanelBorderSize,
  panelBorderRadius,
  setPanelBorderRadius,
  borderColor,
  backgroundColor,
}: Props): JSX.Element {
  return (
    <div className="flex flex-col w-full px-2 transition-opacity duration-500 opacity-100">
      <div className="mb-3">
        <WizardLabel label="Panel" />
      </div>
      <div className="flex flex-row w-full px-2">
        <div className="flex-grow basis-1/3 px-2">
          <div className="flex-grow px-2 mt-3">
            <ColorPickerComponent
              currentColor={panelPrimaryColor}
              handleColorChange={setPanelPrimaryColor}
              label="Primäre Hintergrundfarbe"
            />
          </div>
          <div className="flex-grow px-2 mt-3">
            <ColorPickerComponent
              currentColor={panelSecondaryColor}
              handleColorChange={setPanelSecondaryColor}
              label="Sekundäre Hintergrundfarbe"
            />
          </div>
          <div className="flex-grow px-2 mt-3">
            <ColorPickerComponent
              currentColor={panelBorderColor}
              handleColorChange={setPanelBorderColor}
              label="Rahmenfarbe"
            />
          </div>
        </div>
        <div className="flex-grow basis-1/3 px-2">
          <div className="flex-grow px-2 mt-3">
            <WizardLabel label="Panel Border Size  (0-12px)" />
            <WizardTextfield
              value={panelBorderSize ?? '8'}
              onChange={(value): void => {
                setPanelBorderSize(value.toString());
              }}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
          </div>
          <div className="flex-grow px-2 mt-3">
            <WizardLabel label="Panel Border Radius  (0-12px)" />
            <WizardTextfield
              value={panelBorderRadius ?? '8'}
              onChange={(value): void => {
                setPanelBorderRadius(value.toString());
              }}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
