import { ReactElement, useEffect, useState } from 'react';

import DashboardIcons from '@/ui/Icons/DashboardIcon';
import SearchableDropdown from '@/ui/SearchableDropdown';
import SelectorBox from '@/ui/SelectorBox';
import { Widget } from '@/types';
import {
  deleteWidgetToPanelRelation,
  postWidgetToPanelRelation,
} from '@/api/widgetPanelRelation-service';
import { useAuth } from 'react-oidc-context';
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';

import { getWidgets, getWidgetsByPanelId } from '@/api/widget-service';

type WidgetSelectorProps = {
  panelId: string;
  backgroundColor: string;
  hoverColor: string;
};

export default function WidgetSelector(
  props: WidgetSelectorProps,
): ReactElement {
  const { panelId, backgroundColor, hoverColor } = props;
  const auth = useAuth();

  const [allWidgets, setAllWidgets] = useState<Widget[]>([]);
  const [selectedWidgetInDropdown, setSelectedWidgetInDropdown] = useState('');
  const [selectedWidgets, setSelectedWidgets] = useState<Widget[]>([]);

  // Get Widgets to fill dropdown
  const {
    data: widgets,
    isError: widgetsIsError,
    error: widgetsError,
  } = useQuery({
    queryKey: ['widgets'],
    queryFn: () => getWidgets(auth?.user?.access_token),
  });

  // Get Widgets for Panel
  const { data, isError, error } = useQuery({
    queryKey: ['widgetsByPanelId', panelId],
    queryFn: () => getWidgetsByPanelId(auth?.user?.access_token, panelId!),
    enabled: !!panelId,
  });
  const { openSnackbar } = useSnackbar();

  useEffect(() => {
    if (isError) {
      openSnackbar('Error: ' + error, 'error');
    }

    if (widgetsIsError) {
      openSnackbar('Error: ' + widgetsError, 'error');
    }
  }, [isError, widgetsIsError]);

  useEffect(() => {
    if (data) {
      setSelectedWidgets(data);
    }
  }, [data]);

  useEffect(() => {
    if (widgets) {
      setAllWidgets(widgets);
    }
  }, [widgets]);

  const handleSwapClick = async (): Promise<void> => {
    const match =
      allWidgets && allWidgets.length
        ? allWidgets?.find(
            (widget: Widget) => widget.name === selectedWidgetInDropdown,
          )
        : undefined;
    if (match) {
      const newPosition = selectedWidgets.length;
      setSelectedWidgets([...selectedWidgets, match]);
      const updatedWidgets = allWidgets.filter(
        (widget) => widget.name !== selectedWidgetInDropdown,
      );
      setSelectedWidgetInDropdown('');
      setAllWidgets(updatedWidgets);
      await postWidgetToPanelRelation(
        auth?.user?.access_token,
        match.id!,
        panelId,
        newPosition,
      );
    }
  };

  const handleRemoveWidget = async (widget: Widget): Promise<void> => {
    setAllWidgets([...allWidgets, widget]);
    await deleteWidgetToPanelRelation(
      auth?.user?.access_token,
      widget.id!,
      panelId,
    );
  };

  return (
    <div className="flex justify-between items-start content-start rounded-lg border-4 border-[#59647D] h-full overflow-y-auto">
      <div className="p-4 basis-2/5">
        <SearchableDropdown
          value={selectedWidgetInDropdown}
          options={
            allWidgets && allWidgets.length > 0
              ? allWidgets?.map((widget) => widget.name)
              : []
          }
          onSelect={setSelectedWidgetInDropdown}
          backgroundColor={backgroundColor}
          hoverColor={hoverColor}
        />
      </div>
      <div className="p-4 basis-1/5">
        <div className="w-full flex justify-center items-center content-center">
          <button
            className="p-4 bg-[#1D2330] rounded-lg"
            onClick={handleSwapClick}
          >
            <DashboardIcons iconName="ChevronRight" color="white" />
          </button>
        </div>
      </div>
      <div className="p-4 basis-2/5">
        <SelectorBox
          selectedWidgets={selectedWidgets || []}
          handleRemoveWidget={handleRemoveWidget}
          setSelectedWidgets={setSelectedWidgets}
        />
      </div>
    </div>
  );
}
