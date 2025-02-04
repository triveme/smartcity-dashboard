import { CSSProperties, ReactElement } from 'react';
import { cookies } from 'next/headers';

import '../../app/scrollbar.css';
import {
  CorporateInfo,
  Tab,
  tabComponentTypeEnum,
  WidgetWithContent,
} from '@/types';
import DashboardTab from './DashboardTab';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import { getColumnSpanSettings } from '@/utils/gridHelper';
import { getCorporateInfosWithLogos } from '@/app/actions';
import ShareLinkButton from '@/ui/Buttons/ShareLinkButton';
import SmallDataExportButton from '@/ui/Buttons/SmallDataExportButton';
import RedirectPageButton from '@/ui/Buttons/RedirectPageButton';

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
  const cookieStore = cookies();
  const isEditable = cookieStore.get('allowEdit')?.value === 'true';

  const ciColors: CorporateInfo = await getCorporateInfosWithLogos(tenant);

  const getWidgetHeight = (): string => {
    let height = '0px';

    // ensure all content is shown without scroll bars
    if (widget.height === 0) {
      return 'auto';
    }

    // for parent widget of combinedWidget, set height auto to follow child widgets height
    // for combinedWidgets, height -100px to take up smaller space
    if (
      widget?.tabs &&
      widget.tabs.some(
        (tab) => tab.componentType === tabComponentTypeEnum.information,
      )
    ) {
      if (isCombinedWidget) {
        height = 'auto';
      } else {
        height = `${widget.height}px`;
      }
    } else if (
      widget?.tabs &&
      widget.tabs.some(
        (tab) => tab.componentType === tabComponentTypeEnum.combinedComponent,
      )
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
      <div
        className={`w-full flex flex-row content-between justify-between items-center overflow-auto hide-scrollbar ${ciColors.isWidgetHeadlineBold ? 'font-bold' : ''}`}
        style={{ color: widgetStyle.color }}
      >
        {widget.showName ? (
          <div style={{ color: widget.headlineColor }}>
            <div className="flex flex-row gap-x-4 items-center">
              {widget.icon && (
                <DashboardIcons
                  iconName={widget.icon}
                  color={widget.headlineColor}
                />
              )}
              <div className="w-full flex justify-start items-center gap-x-2">
                <div
                  style={{
                    fontSize: ciColors.widgetHeadlineFontSize || '16px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {widget.name}
                </div>

                {isEditable ? (
                  <RedirectPageButton
                    url={`/${tenant}/admin/widgets/edit?id=${widget?.id}`}
                    isShortStyle={true}
                  />
                ) : null}
              </div>
            </div>
            <div
              style={{ fontSize: ciColors.widgetSubheadlineFontSize || '14px' }}
            >
              {widget.subheadline}
            </div>
          </div>
        ) : (
          <>
            <div>&nbsp;</div>
            {isEditable ? (
              <RedirectPageButton
                url={`/${tenant}/admin/widgets/edit?id=${widget?.id}`}
                isShortStyle={true}
              />
            ) : null}
          </>
        )}
        <div className="sm:flex hidden text-sm flex-row space-x-2 items-center">
          {widget.allowDataExport && (
            <SmallDataExportButton id={widget.id || ''} type="widget" />
          )}
          {widget.allowShare && (
            <ShareLinkButton type="widget" id={widget.id || ''} />
          )}
        </div>
      </div>
      <div
        style={widgetStyle}
        className={`border-4 text-lg rounded-lg w-full h-full relative ${
          isCombinedWidget ? '' : 'mt-2'
        }`}
      >
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
