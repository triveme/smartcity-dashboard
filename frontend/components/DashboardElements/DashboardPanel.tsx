import { CSSProperties, ReactElement } from 'react';
import { CorporateInfo, PanelWithContent, WidgetWithContent } from '@/types';
import PageHeadline from '@/ui/PageHeadline';
import DashboardWidget from './DashboardWidget';
import { getColumnSpanSettings } from '@/utils/gridHelper';
import { getCorporateInfosWithLogos } from '@/app/actions';
import DashboardGeneralInfoMessage from '../DashboardGeneralInfoMessage';
import JumpoffButton from '@/ui/Buttons/JumpoffButton';

type DashboardPanelProps = {
  panel: PanelWithContent;
  tenant: string | undefined;
};

export default async function DashboardPanel(
  props: DashboardPanelProps,
): Promise<ReactElement> {
  const { panel, tenant } = props;
  const customStyle = `${getColumnSpanSettings(panel.width)}`;
  const ciColors: CorporateInfo = await getCorporateInfosWithLogos(tenant);

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
    <div className={`text-lg p-6 rounded-lg ${customStyle}`} style={panelStyle}>
      {showPanelHeader() && (
        <div className="flex flex-row items-center pb-2">
          <PageHeadline headline={panel.name} fontColor={panel.headlineColor} />
          <div className="flex flex-row items-center gap-x-4">
            {panel.showJumpoffButton && <JumpoffButton panel={panel} />}
            {panel.showGeneralInfo && (
              <DashboardGeneralInfoMessage panel={panel} />
            )}
          </div>
        </div>
      )}
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 xl:grid-cols-12 gap-4">
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
      <div className="text-sm">
        <span>{panel.info}</span>
      </div>
    </div>
  );
}
