import { CSSProperties, ReactElement } from 'react';

import '../../app/scrollbar.css';
import { CorporateInfo, Tab, WidgetWithContent } from '@/types';
import DashboardTab from './DashboardTab';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import { getColumnSpanSettings } from '@/utils/gridHelper';
import { getCorporateInfosWithLogos } from '@/app/actions';

type DashboardWidgetProps = {
  widget: WidgetWithContent;
  tenant: string | undefined;
};

export default async function DashboardWidget({
  widget,
  tenant,
}: DashboardWidgetProps): Promise<ReactElement> {
  const customStyle = `${getColumnSpanSettings(widget.width)}`;

  const ciColors: CorporateInfo = await getCorporateInfosWithLogos(tenant);

  //Dynamic Styling
  const widgetStyle: CSSProperties = {
    height: `${widget.height}px`,
    backgroundColor: ciColors.widgetPrimaryColor ?? '#1D2330',
    borderRadius: ciColors.widgetBorderRadius,
    borderWidth: ciColors.widgetBorderSize,
    borderColor: ciColors.widgetBorderColor,
    color: ciColors.widgetFontColor,
  };

  return (
    <div className={`pb-4 w-full h-full ${customStyle}`}>
      {/* <Tooltip text={widget.name}> */}
      <div
        className={`text-sm mr-auto font-bold overflow-auto whitespace-nowrap hover:cursor-pointer hide-scrollbar`}
        style={{ color: widgetStyle.color }}
      >
        {widget.name}
      </div>
      {/* </Tooltip> */}
      <div
        style={widgetStyle}
        className={`border-4 text-lg rounded-lg w-full h-full relative`}
      >
        <div className="absolute top-0 right-0 pt-4 pr-4">
          <DashboardIcons iconName={widget.icon} color="white" />
        </div>
        {widget.tabs &&
          widget.tabs.length > 0 &&
          widget.tabs.map((tab: Tab, index: number) => (
            <DashboardTab
              key={`tab-in-widget-${tab.id}-${index}`}
              tab={tab}
              tenant={tenant}
            />
          ))}
      </div>
    </div>
  );
}
