import { CSSProperties, ReactElement } from 'react';
import { CorporateInfo, PanelWithContent, WidgetWithContent } from '@/types';
import PageHeadline from '@/ui/PageHeadline';
import DashboardWidget from './DashboardWidget';
import { getColumnSpanSettings } from '@/utils/gridHelper';
import { getCorporateInfosWithLogos } from '@/app/actions';
import DashboardGeneralInfoMessage from '../DashboardGeneralInfoMessage';

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
      <div className={'flex'}>
        <PageHeadline headline={panel.name} fontColor={panelStyle.color} />
        {panel.showGeneralInfo && <DashboardGeneralInfoMessage panel={panel} />}
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 xl:grid-cols-12 gap-4">
        {panel.widgets.length > 0 &&
          panel.widgets.map((widget: WidgetWithContent, index: number) => (
            <DashboardWidget
              key={`widget-in-panel-${widget.id}-${index}`}
              widget={widget}
              tenant={tenant}
            />
          ))}
      </div>
      <div className="text-sm pt-2">
        <span>{panel.info}</span>
      </div>
    </div>
  );
}
