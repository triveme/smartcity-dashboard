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

  const cookieStore = cookies();
  const isEditable = cookieStore.get('allowEdit')?.value === 'true';

  const showPanelHeader = (): boolean => {
    return !!(
      panel?.name ||
      panel?.showGeneralInfo ||
      panel?.showJumpoffButton
    );
  };

  //Dynamic Styling
  const panelStyle: CSSProperties = {
    height: 'auto',
    backgroundColor: ciColors.panelPrimaryColor ?? '#3D4760',
    fontSize: '1.5rem',
    padding: '1.5rem',
    borderRadius: ciColors.panelBorderRadius,
    borderWidth: ciColors.panelBorderSize,
    borderColor: ciColors.panelBorderColor,
    color: ciColors.panelFontColor,
  };

  return (
    <div
      className={`flex flex-col justify-between text-lg p-6 rounded-lg ${customStyle}`}
      style={panelStyle}
    >
      {showPanelHeader() && (
        <div className="flex flex-row items-center justify-between pb-2">
          <div className="flex flex-row items-center gap-x-4">
            {panel.icon && (
              <DashboardIcons
                iconName={panel.icon}
                color={panel.headlineColor || 'white'}
                size="lg"
              />
            )}
            <div className="w-full flex justify-start items-center gap-x-2">
              <div>
                <PageHeadline
                  headline={panel.name}
                  fontColor={panel.headlineColor}
                  fontSize={ciColors.panelHeadlineFontSize}
                  isHeadlineBold={ciColors.isPanelHeadlineBold}
                />
              </div>
              {isEditable ? (
                <RedirectPageButton
                  url={`/${tenant}/admin/pages/edit?id=${dashboardId}`}
                  isShortStyle={true}
                />
              ) : null}
            </div>
          </div>
          <div className="sm:flex flex-row items-center gap-x-4 hidden">
            {panel.showJumpoffButton && <JumpoffButton panel={panel} />}
            {panel.showGeneralInfo && (
              <DashboardGeneralInfoMessage
                panel={panel}
                infoModalBackgroundColor={ciColors.widgetPrimaryColor}
                infoModalFontColor={ciColors.widgetFontColor}
              />
            )}
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
        <div className="text-sm">
          <span>{panel.info}</span>
        </div>
      )}
    </div>
  );
}
