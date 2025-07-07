import { CSSProperties, ReactElement } from 'react';
import { cookies } from 'next/headers';

import { CorporateInfo, PanelWithContent, WidgetWithContent } from '@/types';
import PageHeadline from '@/ui/PageHeadline';
import DashboardWidget from './DashboardWidget';
import { getColumnSpanSettings } from '@/utils/gridHelper';
import { getCorporateInfosWithLogos } from '@/app/actions';
import DashboardGeneralInfoMessage from '../DashboardGeneralInfoMessage';
import JumpoffButton from '@/ui/Buttons/JumpoffButton';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import RedirectPageButton from '@/ui/Buttons/RedirectPageButton';
import { generateResponsiveFontSize } from '@/utils/fontUtil';

type DashboardPanelProps = {
  panel: PanelWithContent;
  tenant: string | undefined;
  dashboardId: string;
};

export default async function DashboardPanel(
  props: DashboardPanelProps,
): Promise<ReactElement> {
  const { panel, tenant, dashboardId } = props;
  const customStyle = `${getColumnSpanSettings(panel.width)}`;
  const ciColors: CorporateInfo = await getCorporateInfosWithLogos(tenant);

  const cookieStore = await cookies();
  const isEditable = cookieStore.get('allowEdit')?.value === 'true';

  const showPanelHeader = (): boolean => {
    return !!(
      panel?.name ||
      panel?.showGeneralInfo ||
      panel?.showJumpoffButton
    );
  };

  const showInfoButtonsOnMobile = ciColors.showInfoButtonsOnMobile ?? false;

  //Dynamic Styling
  const panelStyle: CSSProperties = {
    height: 'auto',
    backgroundColor: ciColors.panelPrimaryColor ?? '#3D4760',
    fontSize: '1.5rem',
    borderRadius: ciColors.panelBorderRadius,
    borderWidth: ciColors.panelBorderSize,
    borderColor: ciColors.panelBorderColor,
    color: ciColors.panelFontColor,
  };

  return (
    <div
      className={`flex flex-col text-lg p-4 rounded-lg ${customStyle}`}
      style={panelStyle}
    >
      {showPanelHeader() && (
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-x-4 sm:items-center sm:justify-between pb-2">
          {/* Buttons container - appears first on mobile, last on desktop */}
          <div
            className={`${showInfoButtonsOnMobile ? 'flex' : 'hidden'} sm:flex flex-row items-center gap-x-4 justify-end sm:justify-start order-first sm:order-last`}
          >
            {panel.showJumpoffButton && (
              <JumpoffButton
                panel={panel}
                headerPrimaryColor={ciColors.headerPrimaryColor}
                headerFontColor={ciColors.headerFontColor}
              />
            )}
            {panel.showGeneralInfo && (
              <DashboardGeneralInfoMessage
                panel={panel}
                infoModalBackgroundColor={ciColors.widgetPrimaryColor}
                infoModalFontColor={ciColors.widgetFontColor}
              />
            )}
          </div>

          {/* Headline container - appears second on mobile, first on desktop */}
          <div className="flex flex-row items-center order-last sm:order-first">
            <div className="w-12 min-w-12 flex justify-center">
              <DashboardIcons
                iconName={panel.icon || 'empty'}
                color={panel.headlineColor || 'white'}
                size="lg"
              />
            </div>
            <div className="w-full flex justify-start items-center gap-x-2">
              <PageHeadline
                headline={panel.name}
                fontColor={ciColors.panelFontColor}
                fontSize={generateResponsiveFontSize(
                  parseInt(ciColors.panelHeadlineFontSize || '16', 10),
                )}
                isHeadlineBold={ciColors.isPanelHeadlineBold}
              />
              {isEditable ? (
                <RedirectPageButton
                  url={`/${tenant}/admin/pages/edit?id=${dashboardId}`}
                  isShortStyle={true}
                  headerPrimaryColor={ciColors.headerPrimaryColor}
                  headerFontColor={ciColors.headerFontColor}
                />
              ) : null}
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-12 gap-1">
        {panel.widgets.length > 0 &&
          panel.widgets.map((widget: WidgetWithContent, index: number) => (
            <DashboardWidget
              key={`widget-in-panel-${widget.id}-${index}`}
              widget={widget}
              tenant={tenant}
              isCombinedWidget={false}
            />
          ))}
      </div>
      {panel.info && (
        <div className="mt-auto text-sm">
          <span>{panel.info}</span>
        </div>
      )}
    </div>
  );
}
