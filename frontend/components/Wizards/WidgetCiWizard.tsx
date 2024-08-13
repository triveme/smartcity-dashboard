import React from 'react';
import ColorPickerComponent from '@/ui/ColorPickerComponent';
import WizardLabel from '@/ui/WizardLabel';

type Props = {
  widgetPrimaryColor: string;
  setWidgetPrimaryColor: (color: string) => void;
  widgetSecondaryColor: string;
  setWidgetSecondaryColor: (color: string) => void;
  widgetBorderColor: string;
  setWidgetBorderColor: (color: string) => void;
};

export default function WidgetCiWizard({
  widgetPrimaryColor,
  setWidgetPrimaryColor,
  widgetSecondaryColor,
  setWidgetSecondaryColor,
  widgetBorderColor,
  setWidgetBorderColor,
}: Props): JSX.Element {
  return (
    <div className="flex flex-col w-full pb-2 px-4 transition-opacity duration-500 opacity-100">
      <div className="flex flex-col w-full">
        <WizardLabel label="Widget" />
        <div className="flex flex-wrap w-full gap-y-8">
          <div className="w-1/2">
            <ColorPickerComponent
              currentColor={widgetPrimaryColor}
              handleColorChange={setWidgetPrimaryColor}
              label="Primäre Hintergrundfarbe"
            />
          </div>
          <div className="w-1/2">
            <ColorPickerComponent
              currentColor={widgetSecondaryColor}
              handleColorChange={setWidgetSecondaryColor}
              label="Sekundäre Hintergrundfarbe"
            />
          </div>
          <div className="w-1/2">
            <ColorPickerComponent
              currentColor={widgetBorderColor}
              handleColorChange={setWidgetBorderColor}
              label="Rahmenfarbe"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
