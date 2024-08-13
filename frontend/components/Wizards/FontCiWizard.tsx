import React from 'react';
import ColorPickerComponent from '@/ui/ColorPickerComponent';
import WizardLabel from '@/ui/WizardLabel';
import HorizontalDivider from '@/ui/HorizontalDivider';

type Props = {
  headerFontColor: string;
  setHeaderFontColor: (color: string) => void;
  menuFontColor: string;
  setMenuFontColor: (color: string) => void;
  dashboardFontColor: string;
  setDashboardFontColor: (color: string) => void;
  panelFontColor: string;
  setPanelFontColor: (color: string) => void;
  widgetFontColor: string;
  setWidgetFontColor: (color: string) => void;
  fontColor: string;
  setFontColor: (color: string) => void;
};

export default function FontCiWizard({
  headerFontColor,
  setHeaderFontColor,
  menuFontColor,
  setMenuFontColor,
  dashboardFontColor,
  setDashboardFontColor,
  panelFontColor,
  setPanelFontColor,
  widgetFontColor,
  setWidgetFontColor,
  fontColor,
  setFontColor,
}: Props): JSX.Element {
  return (
    <div className="flex flex-col w-full pb-2 px-4 transition-opacity duration-500 opacity-100">
      <WizardLabel label="Schriftart" />
      <div className="flex flex-wrap w-full pb-4 gap-y-8">
        <div className="w-1/2">
          <ColorPickerComponent
            currentColor={headerFontColor}
            handleColorChange={setHeaderFontColor}
            label="Schriftfarbe der Kopfzeile"
          />
        </div>
        <div className="w-1/2">
          <ColorPickerComponent
            currentColor={menuFontColor}
            handleColorChange={setMenuFontColor}
            label="Schriftfarbe des Menüs"
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
