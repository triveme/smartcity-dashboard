import React, { JSX } from 'react';
import ColorPickerComponent from '@/ui/ColorPickerComponent';
import WizardLabel from '@/ui/WizardLabel';
import HorizontalDivider from '@/ui/HorizontalDivider';
import FontFamilyDropdown from '@/ui/FontFamilyDropdown';
import WizardTextfield from '@/ui/WizardTextfield';

type Props = {
  headerFontColor: string;
  setHeaderFontColor: (color: string) => void;
  dashboardFontColor: string;
  setDashboardFontColor: (color: string) => void;
  panelFontColor: string;
  setPanelFontColor: (color: string) => void;
  widgetFontColor: string;
  setWidgetFontColor: (color: string) => void;
  fontColor: string;
  setFontColor: (color: string) => void;
  fontFamily: string;
  setFontFamily: (fontFamily: string) => void;
  dashboardPrimaryColor: string;
  dashboardSecondaryColor: string;
  cssStyleInjectionValue: string;
  setCssStyleInjectionValue: (cssStyle: string) => void;
};

export default function FontCiWizard({
  headerFontColor,
  setHeaderFontColor,
  dashboardFontColor,
  setDashboardFontColor,
  panelFontColor,
  setPanelFontColor,
  widgetFontColor,
  setWidgetFontColor,
  fontColor,
  setFontColor,
  fontFamily,
  setFontFamily,
  dashboardPrimaryColor,
  dashboardSecondaryColor,
  cssStyleInjectionValue,
  setCssStyleInjectionValue,
}: Props): JSX.Element {
  return (
    <div className="flex flex-col w-full pb-2 px-4 transition-opacity duration-500 opacity-100">
      <div className="flex justify-between gap-10">
        <div className="flex flex-col w-full">
          <WizardLabel label="Schriftart" />
          <div className="flex flex-wrap w-full pb-4 gap-y-8">
            <div className="w-1/2">
              <ColorPickerComponent
                currentColor={headerFontColor}
                handleColorChange={setHeaderFontColor}
                label="Schriftfarbe der Kopfzeile"
              />
            </div>
          </div>
          <WizardLabel label="Schriftfamilie" />
          <div className="flex flex-wrap w-full pb-4 gap-y-8">
            <div className="w-full">
              <FontFamilyDropdown
                currentValue={fontFamily}
                onSelect={(value: string | number): void =>
                  setFontFamily(value.toString())
                }
                iconColor={fontColor}
                backgroundColor={dashboardPrimaryColor}
                hoverColor={dashboardSecondaryColor}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col w-full pb-2">
          <WizardLabel label="CSS-Injection" />
          <WizardTextfield
            value={cssStyleInjectionValue}
            componentType="textarea"
            onChange={(value: string | number): void =>
              setCssStyleInjectionValue(value.toString())
            }
            borderColor={'inherit'}
            backgroundColor={dashboardPrimaryColor}
          />
        </div>
      </div>
      <HorizontalDivider />
      <WizardLabel label="Dashboard" />
      <div className="flex flex-wrap w-full pb-4 gap-y-8">
        <div className="w-1/2">
          <ColorPickerComponent
            currentColor={dashboardFontColor}
            handleColorChange={setDashboardFontColor}
            label="Dashboard-Schriftfarbe"
          />
        </div>
        <div className="w-1/2">
          <ColorPickerComponent
            currentColor={panelFontColor}
            handleColorChange={setPanelFontColor}
            label="Panel-Schriftfarbe"
          />
        </div>
        <div className="w-1/2">
          <ColorPickerComponent
            currentColor={widgetFontColor}
            handleColorChange={setWidgetFontColor}
            label="Widget-Schriftfarbe"
          />
        </div>
      </div>
      <HorizontalDivider />
      <WizardLabel label="Allgemein" />
      <div className="flex flex-wrap w-full">
        <div className="w-1/2">
          <ColorPickerComponent
            currentColor={fontColor}
            handleColorChange={setFontColor}
            label="Schriftfarbe"
          />
        </div>
      </div>
    </div>
  );
}
