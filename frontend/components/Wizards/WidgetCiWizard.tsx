import React from 'react';
import ColorPickerComponent from '@/ui/ColorPickerComponent';
import WizardLabel from '@/ui/WizardLabel';
import WizardTextfield from '@/ui/WizardTextfield';

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
  borderColor,
  backgroundColor,
}: Props): JSX.Element {
  return (
    <div className="flex flex-col w-full px-2 transition-opacity duration-500 opacity-100">
      <div className="mb-3">
        <WizardLabel label="Widget" />
      </div>
      <div className="flex flex-row w-full px-2">
        <div className="flex-grow basis-1/3 px-2">
          <div className="flex-grow px-2 mt-3">
            <ColorPickerComponent
              currentColor={widgetPrimaryColor}
              handleColorChange={setWidgetPrimaryColor}
              label="Primäre Hintergrundfarbe"
            />
          </div>
          <div className="flex-grow px-2 mt-3">
            <ColorPickerComponent
              currentColor={widgetSecondaryColor}
              handleColorChange={setWidgetSecondaryColor}
              label="Sekundäre Hintergrundfarbe"
            />
          </div>
          <div className="flex-grow px-2 mt-3">
            <ColorPickerComponent
              currentColor={widgetBorderColor}
              handleColorChange={setWidgetBorderColor}
              label="Rahmenfarbe"
            />
          </div>
        </div>
        <div className="flex-grow basis-1/3 px-2">
          <div className="flex-grow px-2 mt-3">
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
          <div className="flex-grow px-2 mt-3">
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
        </div>
      </div>
    </div>
  );
}
