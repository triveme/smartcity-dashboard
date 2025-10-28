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
import { generateResponsiveFontSize } from '@/utils/fontUtil';

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
  const cookieStore = await cookies();
  const isEditable = cookieStore.get('allowEdit')?.value === 'true';

  const ciColors: CorporateInfo = await getCorporateInfosWithLogos(tenant);
  const showInfoButtonsOnMobile = ciColors.showInfoButtonsOnMobile ?? false;

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
        className={`w-full flex flex-col sm:flex-row gap-2 sm:gap-x-4 sm:items-center overflow-auto hide-scrollbar ${ciColors.isWidgetHeadlineBold ? 'font-bold' : ''}`}
        style={{ color: widgetStyle.color }}
      >
        {/* Buttons container - appears first on mobile, last on desktop */}
        <div
          className={`${showInfoButtonsOnMobile ? 'flex' : 'hidden'} sm:flex text-sm flex-row space-x-2 items-center justify-end sm:justify-start order-first sm:order-last`}
        >
          {widget.allowDataExport && (
            <SmallDataExportButton
              id={widget.id || ''}
              type="widget"
              widgetPrimaryColor={ciColors?.widgetPrimaryColor}
              widgetFontColor={ciColors?.widgetFontColor}
            />
          )}
          {widget.allowShare && (
            <ShareLinkButton
              type="widget"
              id={widget.id || ''}
              widgetPrimaryColor={ciColors?.widgetPrimaryColor}
              widgetFontColor={ciColors?.widgetFontColor}
            />
          )}
        </div>

        {/* Headline container - appears second on mobile, first on desktop */}
        {widget.showName ? (
          <div
            style={{ color: ciColors.widgetFontColor }}
            className="order-last sm:order-first"
          >
            <div className="flex flex-row items-center">
              <div className="w-12 min-w-12 flex justify-center">
                <DashboardIcons
                  iconName={widget.icon}
                  color={ciColors.widgetFontColor}
                />
              </div>
              <div className="w-full flex justify-start items-center gap-x-2">
                <div
                  style={{
                    fontSize: generateResponsiveFontSize(
                      parseInt(ciColors.widgetHeadlineFontSize || '16', 10),
                    ),
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
                    headerPrimaryColor={ciColors.headerPrimaryColor}
                    headerFontColor={ciColors.headerFontColor}
                  />
                ) : null}
              </div>
            </div>
            <div
              className="pl-12"
              style={{
                fontSize: generateResponsiveFontSize(
                  parseInt(ciColors.widgetSubheadlineFontSize || '14', 10),
                ),
              }}
            >
              {widget.subheadline}
            </div>
          </div>
        ) : (
          <div className="order-last sm:order-first">
            <div>&nbsp;</div>
            {isEditable ? (
              <RedirectPageButton
                url={`/${tenant}/admin/widgets/edit?id=${widget?.id}`}
                isShortStyle={true}
                headerPrimaryColor={ciColors.headerPrimaryColor}
                headerFontColor={ciColors.headerFontColor}
              />
            ) : null}
          </div>
        )}
      </div>
      <div
        style={widgetStyle}
        className={`border-4 text-lg rounded-lg w-full h-full relative ${
          isCombinedWidget ? '' : 'mt-2'
        }`}
      >
        {widget.tabs &&
          widget.tabs.length > 0 &&
          widget.tabs.map((tab: Tab, index: number) => {
            // Determine what data to pass to the tab based on available properties
            let tabData;
            // First check if we have widgetData
            if (widget?.widgetData?.data) {
              tabData = widget.widgetData.data;
            }
            // If no widgetData exists, build an object with available tab data
            else {
              tabData = {
                chartValues: tab.chartValues || null,
                chartData: tab.chartData || null,
                weatherWarnings: tab.weatherWarnings || null,
                mapObject: tab.mapObject || null,
                textValue: tab.textValue || null,
              };

              // Only set to null if no meaningful data exists
              const hasData = Object.values(tabData).some(
                (val) =>
                  val !== null && (Array.isArray(val) ? val.length > 0 : true),
              );

              if (!hasData) {
                tabData = null;
              }
            }

            return (
              <DashboardTab
                key={`tab-in-widget-${tab.id}-${index}`}
                tab={tab}
                tabData={tabData}
                tenant={tenant}
                isCombinedWidget={isCombinedWidget}
              />
            );
          })}
      </div>
    </div>
  );
}
