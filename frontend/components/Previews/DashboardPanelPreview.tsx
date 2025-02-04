'use client';

import { ReactElement, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from 'react-oidc-context';

import { Panel, Widget, WidgetToPanel } from '@/types';
import PageHeadline from '@/ui/PageHeadline';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import DashboardWidgetPreview from './DashboardWidgetPreview';
import { getWidgetsByPanelId } from '@/api/widget-service';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import {
  bulkUpdateWidgetToPanelRelations,
  deleteWidgetToPanelRelation,
} from '@/api/widgetPanelRelation-service';
import CreateDashboardElementButton from '@/ui/Buttons/CreateDashboardElementButton';
import WidgetSelectorModal from '../WidgetSelectorModal';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage } from '@/utils/tenantHelper';

type DashboardPanelPreviewProps = {
  panel: Panel;
  panelCount: number;
  handleEditPanelClick: (panel: Panel) => void;
  handleRemovePanelClick: (panel: Panel) => void;
  movePanel?: (panelId: string, direction: 'left' | 'right') => void;
  index: number;
};

export default function DashboardPanelPreview(
  props: DashboardPanelPreviewProps,
): ReactElement {
  const {
    panel,
    panelCount,
    handleEditPanelClick,
    handleRemovePanelClick,
    movePanel,
    index,
  } = props;
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const auth = useAuth();
  const { openSnackbar } = useSnackbar();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Multi Tenancy
  const tenant = getTenantOfPage();

  const colSpanClass = `col-span-${panel.width}`;
  const {
    data: widgetData,
    isError,
    error,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ['widgetsByPanelId', panel.id],
    queryFn: () => getWidgetsByPanelId(auth?.user?.access_token, panel.id!),
    enabled: !!panel.id,
  });

  const { data } = useQuery({
    queryKey: ['corporate-info'],
    queryFn: () => getCorporateInfosWithLogos(tenant),
    enabled: false,
  });

  //Dynamic Styling
  const panelStyle = {
    height: panel.height + 'px',
    backgroundColor: data?.panelPrimaryColor,
    color: data?.fontColor,
    borderColor: data?.panelBorderColor || '#59647D',
  };

  useEffect(() => {
    if (isError) {
      openSnackbar('Error: ' + error, 'error');
    }
  }, [isError]);

  const calculatePanelHeight = (widgets: Widget[]): number => {
    let currentRowWidth = 0;
    let numberOfRows = 0;

    widgets.forEach((widget: Widget) => {
      if (currentRowWidth + widget.width <= 12) {
        // Add the widget to the current row if it fits
        currentRowWidth += widget.width;
      } else {
        // Otherwise, start a new row with the current widget
        numberOfRows++; // Complete the current row and start a new one
        currentRowWidth = widget.width;
      }
    });

    if (widgets.length > 0) {
      numberOfRows++;
    }

    return numberOfRows * 400;
  };

  useEffect(() => {
    if (widgetData) {
      setWidgets(widgetData);
      const newHeight = calculatePanelHeight(widgetData);
      if (newHeight) {
        panel.height = newHeight;
      }
    }
  }, [widgetData]);

  const moveWidget = async (
    widgetId: string,
    direction: 'left' | 'right',
  ): Promise<void> => {
    const currentIndex = widgets.findIndex((w) => w.id === widgetId);
    if (currentIndex === -1) return;

    let newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    // Ensure newIndex is within bounds
    newIndex = Math.max(0, Math.min(widgets.length - 1, newIndex));

    // Swap positions in the array
    const newWidgets = [...widgets];
    [newWidgets[currentIndex], newWidgets[newIndex]] = [
      newWidgets[newIndex],
      newWidgets[currentIndex],
    ];

    setWidgets(newWidgets);

    // Update DB with changes
    const updates: WidgetToPanel[] = [
      {
        widgetId: newWidgets[currentIndex].id!,
        panelId: panel.id!,
        position: currentIndex,
      },
      {
        widgetId: newWidgets[newIndex].id!,
        panelId: panel.id!,
        position: newIndex,
      },
    ];
    try {
      await bulkUpdateWidgetToPanelRelations(auth?.user?.access_token, updates);
    } catch (error) {
      console.error('Error updating widget positions:', error);
      openSnackbar(
        'Fehler beim Aktualisieren der Widget-Positionen: ' + error,
        'error',
      );
    }
  };

  const handleDeleteClick = async (widgetId: string): Promise<void> => {
    if (widgetId && panel.id) {
      try {
        await deleteWidgetToPanelRelation(
          auth?.user?.access_token,
          widgetId,
          panel.id,
        );

        // Remove the widget from the local state
        const updatedWidgets = widgets.filter(
          (widget) => widget.id !== widgetId,
        );
        setWidgets(updatedWidgets);
        const newPanelHeight = calculatePanelHeight(updatedWidgets);
        if (newPanelHeight) {
          panel.height = newPanelHeight;
        }

        // Update positions after deletion
        const updates = updatedWidgets.map((widget, index) => ({
          widgetId: widget.id!,
          panelId: panel.id!,
          position: index,
        }));

        await bulkUpdateWidgetToPanelRelations(
          auth?.user?.access_token,
          updates,
        );
      } catch (error) {
        console.error('Error deleting widgetRelation:', error);
        openSnackbar('WidgetRelation konnte nicht gelöscht werden', 'error');
      }
    }
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
  };

  const handleNewWidgetClick = (): void => {
    setIsModalOpen(true);
  };

  return (
    <div
      className={`flex flex-col bg-[#3D4760]  text-lg py-4 px-6 rounded-lg border-2 ${colSpanClass}`}
      style={panelStyle}
    >
      <div className="flex justify-between items-center content-center">
        <PageHeadline headline={panel.name} fontColor={data?.fontColor} />
        <div className="flex gap-4">
          {panelCount > 1 && index !== 0 && (
            <button onClick={(): void => movePanel!(panel.id!, 'left')}>
              <DashboardIcons
                iconName="ChevronLeft"
                color={data?.panelFontColor ?? '#FFFFFF'}
              />
            </button>
          )}
          {panelCount > 1 && index !== panelCount - 1 && (
            <button
              className="pl-4"
              onClick={(): void => movePanel!(panel.id!, 'right')}
            >
              <DashboardIcons
                iconName="ChevronRight"
                color={data?.panelFontColor ?? '#FFFFFF'}
              />
            </button>
          )}
          <button onClick={(): void => handleEditPanelClick(panel)}>
            <DashboardIcons
              iconName="Pen"
              color={data?.panelFontColor ?? '#FFFFFF'}
            />
          </button>
          <button onClick={(): void => handleRemovePanelClick(panel)}>
            <DashboardIcons iconName="Trashcan" color="#FA4141" />
          </button>
        </div>
      </div>
      {!isPending ? (
        <div className="grid grid-cols-12 grid-flow-row gap-2 h-full overflow-hidden">
          {/* WIDGETS */}
          {widgets &&
            widgets.length > 0 &&
            widgets.map((widget: Widget, index: number) => (
              <DashboardWidgetPreview
                key={`widget-preview-${widget.id!}`}
                index={index}
                widget={widget}
                widgetCount={widgets.length}
                tab={{}}
                moveWidget={moveWidget}
                deleteRelation={handleDeleteClick}
                hideControlIcons={false}
              />
            ))}
        </div>
      ) : (
        <div className="flex   text-2xl">
          <DashboardIcons iconName="Spinner" color="white" />
        </div>
      )}
      {isModalOpen && panel.id && (
        <WidgetSelectorModal
          panelId={panel.id}
          onCloseModal={handleCloseModal}
          refetch={refetch}
          tenant={tenant}
          backgroundColor={data?.panelPrimaryColor || '#2B3244'}
          borderColor={data?.panelBorderColor || '#59647D'}
          fontColor={data?.panelFontColor || '#FFF'}
          hoverColor={data?.menuHoverColor || '#FFF'}
        />
      )}
      <CreateDashboardElementButton
        label="+ Widget hinzufügen"
        handleClick={handleNewWidgetClick}
      />
    </div>
  );
}
