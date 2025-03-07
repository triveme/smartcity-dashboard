import { ReactElement } from 'react';
import '@/components/dependencies/quill.snow.css';
import { useQuery } from '@tanstack/react-query';

import { Tab, Widget } from '@/types';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage } from '@/utils/tenantHelper';

type DashboardWidgetWizardPreviewProps = {
  widget: Widget;
  tab: Tab;
  widgetCount?: number;
  moveWidget?: (widgetId: string, direction: 'left' | 'right') => void;
  deleteRelation?: (widgetId: string) => void;
  hideControlIcons?: boolean;
  index?: number;
};

export default function DashboardWidgetWizardPreview(
  props: DashboardWidgetWizardPreviewProps,
): ReactElement {
  const {
    widget,
    tab,
    widgetCount,
    moveWidget,
    deleteRelation,
    hideControlIcons,
    index,
  } = props;

  // Multi Tenancy
  const tenant = getTenantOfPage();

  const { data } = useQuery({
    queryKey: ['corporate-info'],
    queryFn: () => getCorporateInfosWithLogos(tenant),
    enabled: false,
  });
  //Dynamic Styling
  const widgetStyle = {
    height: '400px',
    maxHeight: '100%',
    backgroundColor: data?.widgetPrimaryColor,
    color: data?.widgetFontColor,
    borderColor: data?.widgetBorderColor || '#59647D',
  };

  return (
    <div
      key={`widget-in-panel-${widget.id!}`}
      className={`flex justify-center items-center content-center text-center rounded-lg border-2 col-span-${widget.width}`}
      style={widgetStyle}
    >
      {/* For wizards display only widget name and move icons*/}
      {!hideControlIcons && !tab.componentType && (
        <div className="w-full h-full">
          <div className="p-2 flex justify-end gap-4">
            {widgetCount && widgetCount > 1 && index !== 0 && (
              <button onClick={(): void => moveWidget!(widget.id!, 'left')}>
                <DashboardIcons
                  iconName="ChevronLeft"
                  color={data?.headerPrimaryColor ?? '#FFFFFF'}
                />
              </button>
            )}
            {widgetCount && widgetCount > 1 && index !== widgetCount - 1 && (
              <button
                className="pl-4"
                onClick={(): void => moveWidget!(widget.id!, 'right')}
              >
                <DashboardIcons
                  iconName="ChevronRight"
                  color={data?.headerPrimaryColor ?? '#FFFFFF'}
                />
              </button>
            )}
            <button onClick={(): void => deleteRelation!(widget.id!)}>
              <DashboardIcons iconName="Trashcan" color="#FA4141" />
            </button>
          </div>
          <div>{widget.name}</div>
        </div>
      )}
    </div>
  );
}
