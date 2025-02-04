import React from 'react';
import ColorPickerComponent from '@/ui/ColorPickerComponent';
import WizardLabel from '@/ui/WizardLabel';
import WizardTextfield from '@/ui/WizardTextfield';
import WizardDropdownSelection from '@/ui/WizardDropdownSelection';
import { fontSizes } from '@/utils/objectHelper';
import CheckBox from '@/ui/CheckBox';

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
  panelHeadlineFontSize: string;
  setPanelHeadlineFontSize: (size: string) => void;
  isPanelHeadlineBold: boolean;
  setIsPanelHeadlineBold: (bold: boolean) => void;
  iconColor: string;
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
  panelHeadlineFontSize,
  setPanelHeadlineFontSize,
  isPanelHeadlineBold,
  setIsPanelHeadlineBold,
  iconColor,
  borderColor,
  backgroundColor,
}: Props): JSX.Element {
  return (
    <div className="flex flex-col w-full px-2 transition-opacity duration-500 opacity-100">
      <WizardLabel label="Panel" />
      <div className="flex flex-row w-full px-2">
        <div className="flex flex-col gap-y-6 w-1/2 px-2">
          <ColorPickerComponent
            currentColor={panelPrimaryColor}
            handleColorChange={setPanelPrimaryColor}
            label="Primäre Hintergrundfarbe"
          />
          <ColorPickerComponent
            currentColor={panelSecondaryColor}
            handleColorChange={setPanelSecondaryColor}
            label="Sekundäre Hintergrundfarbe"
          />
          <ColorPickerComponent
            currentColor={panelBorderColor}
            handleColorChange={setPanelBorderColor}
            label="Rahmenfarbe"
          />
        </div>
        <div className="flex flex-col gap-y-6 w-1/2 px-2">
          <div>
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
          <div>
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
          <div>
            <WizardLabel label="Panel Headline Fontsize" />
            <WizardDropdownSelection
              currentValue={panelHeadlineFontSize}
              selectableValues={['', ...fontSizes.map((size) => size + 'px')]}
              onSelect={(value: string | number): void =>
                setPanelHeadlineFontSize(value.toString())
              }
              iconColor={iconColor}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
          </div>
          <div>
            <CheckBox
              label={'Fette Panel-Überschrift'}
              value={isPanelHeadlineBold ?? true}
              handleSelectChange={setIsPanelHeadlineBold}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
