import { CSSProperties, ReactElement } from 'react';

import '../../app/scrollbar.css';
import { CorporateInfo, Tab, WidgetWithContent } from '@/types';
import DashboardTab from './DashboardTab';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import { getColumnSpanSettings } from '@/utils/gridHelper';
import { getCorporateInfosWithLogos } from '@/app/actions';
import ShareLinkButton from '@/ui/Buttons/ShareLinkButton';
import SmallDataExportButton from '@/ui/Buttons/SmallDataExportButton';

type DashboardWidgetProps = {
  widget: WidgetWithContent;
  tenant: string | undefined;
  isCombinedWidget: boolean;
};

export default async function DashboardWidget({
  widget,
  tenant,
  isCombinedWidget,
}: DashboardWidgetProps): Promise<ReactElement> {
  const customStyle = `${getColumnSpanSettings(widget.width)}`;

  const ciColors: CorporateInfo = await getCorporateInfosWithLogos(tenant);

  const getWidgetHeight = (): string => {
    let height = '0px';
    // for parent widget of combinedWidget, set height auto to follow child widgets height
    // for combinedWidgets, height -100px to take up smaller space
    if (
      widget?.tabs &&
      widget.tabs.some((tab) => tab.componentType === 'Informationen')
    ) {
      height = 'auto';
    } else if (
      widget?.tabs &&
      widget.tabs.some((tab) => tab.childWidgets && tab.childWidgets.length > 0)
    ) {
      height = 'auto';
    } else if (isCombinedWidget) {
      height = `${widget.height - 100}px`;
    } else {
      height = `${widget.height}px`;
    }

    return height;
  };

  //Dynamic Styling
  const widgetStyle: CSSProperties = {
    height: getWidgetHeight(),
    backgroundColor: ciColors.widgetPrimaryColor ?? '#1D2330',
    borderRadius: ciColors.widgetBorderRadius,
    borderWidth: isCombinedWidget ? 0 : ciColors.widgetBorderSize,
    borderColor: ciColors.widgetBorderColor,
    color: ciColors.widgetFontColor,
  };

  return (
    <div className={`pb-4 w-full h-full ${customStyle}`}>
      {/* hide for combined widgets */}
      {!isCombinedWidget && (
        <div
          className={`flex flex-row justify-between items-center text-sm mr-auto font-bold overflow-auto whitespace-nowrap hide-scrollbar`}
          style={{ color: widgetStyle.color }}
        >
          {widget.showName ? <div>{widget.name}</div> : <div>&nbsp;</div>}
          <div className="flex flex-row space-x-2 items-center">
            {widget.allowDataExport && (
              <SmallDataExportButton id={widget.id || ''} type="widget" />
            )}
            {widget.allowShare && (
              <ShareLinkButton type="widget" id={widget.id || ''} />
            )}
          </div>
        </div>
      )}
      <div
        style={widgetStyle}
        className={`border-4 text-lg rounded-lg w-full h-full relative ${
          isCombinedWidget ? '' : 'mt-2'
        }`}
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
              isCombinedWidget={isCombinedWidget}
            />
          ))}
      </div>
    </div>
  );
}
