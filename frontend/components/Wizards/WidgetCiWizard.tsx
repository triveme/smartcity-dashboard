import React, { JSX } from 'react';
import ColorPickerComponent from '@/ui/ColorPickerComponent';
import WizardLabel from '@/ui/WizardLabel';
import WizardTextfield from '@/ui/WizardTextfield';
import WizardDropdownSelection from '@/ui/WizardDropdownSelection';
import { fontSizes } from '@/utils/objectHelper';
import CheckBox from '@/ui/CheckBox';

type Props = {
  widgetPrimaryColor: string;
  setWidgetPrimaryColor: (color: string) => void;
  widgetSecondaryColor: string;
  setWidgetSecondaryColor: (color: string) => void;
  widgetBorderColor: string;
  setWidgetBorderColor: (color: string) => void;
  widgetBorderSize: string;
  setWidgetBorderSize: (size: string) => void;
  widgetBorderRadius: string;
  setWidgetBorderRadius: (radius: string) => void;
  widgetHeadlineFontSize: string;
  setWidgetHeadlineFontSize: (size: string) => void;
  widgetSubheadlineFontSize: string;
  setWidgetSubheadlineFontSize: (size: string) => void;
  isWidgetHeadlineBold: boolean;
  setIsWidgetHeadlineBold: (bold: boolean) => void;
  iconColor: string;
  borderColor: string;
  backgroundColor: string;
};

export default function WidgetCiWizard({
  widgetPrimaryColor,
  setWidgetPrimaryColor,
  widgetSecondaryColor,
  setWidgetSecondaryColor,
  widgetBorderColor,
  setWidgetBorderColor,
  widgetBorderSize,
  setWidgetBorderSize,
  widgetBorderRadius,
  setWidgetBorderRadius,
  widgetHeadlineFontSize,
  setWidgetHeadlineFontSize,
  widgetSubheadlineFontSize,
  setWidgetSubheadlineFontSize,
  isWidgetHeadlineBold,
  setIsWidgetHeadlineBold,
  iconColor,
  borderColor,
  backgroundColor,
}: Props): JSX.Element {
  return (
    <div className="flex flex-col w-full px-2 transition-opacity duration-500 opacity-100">
      <WizardLabel label="Widget" />
      <div className="flex flex-row w-full px-2">
        <div className="flex flex-col gap-y-6 w-1/2 px-2">
          <ColorPickerComponent
            currentColor={widgetPrimaryColor}
            handleColorChange={setWidgetPrimaryColor}
            label="Primäre Hintergrundfarbe"
          />
          <ColorPickerComponent
            currentColor={widgetSecondaryColor}
            handleColorChange={setWidgetSecondaryColor}
            label="Sekundäre Hintergrundfarbe"
          />
          <ColorPickerComponent
            currentColor={widgetBorderColor}
            handleColorChange={setWidgetBorderColor}
            label="Rahmenfarbe"
          />
        </div>
        <div className="flex flex-col gap-y-6 w-1/2 px-2">
          <div>
            <WizardLabel label="Widget Border Size (0-12px)" />
            <WizardTextfield
              value={widgetBorderSize ?? '8'}
              onChange={(value): void => {
                setWidgetBorderSize(value.toString());
              }}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
          </div>
          <div>
            <WizardLabel label="Widget Border Radius (0-12px)" />
            <WizardTextfield
              value={widgetBorderRadius ?? '8'}
              onChange={(value): void => {
                setWidgetBorderRadius(value.toString());
              }}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
          </div>
          <div>
            <WizardLabel label="Widget Headline Fontsize" />
            <WizardDropdownSelection
              currentValue={widgetHeadlineFontSize}
              selectableValues={['', ...fontSizes.map((size) => size + 'px')]}
              onSelect={(value: string | number): void =>
                setWidgetHeadlineFontSize(value.toString())
              }
              iconColor={iconColor}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
          </div>
          <div className="">
            <WizardLabel label="Widget Subheadline Fontsize" />
            <WizardDropdownSelection
              currentValue={widgetSubheadlineFontSize}
              selectableValues={['', ...fontSizes.map((size) => size + 'px')]}
              onSelect={(value: string | number): void =>
                setWidgetSubheadlineFontSize(value.toString())
              }
              iconColor={iconColor}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
          </div>
          <div>
            <CheckBox
              label={'Fette Widget-Überschrift'}
              value={isWidgetHeadlineBold ?? true}
              handleSelectChange={setIsWidgetHeadlineBold}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
