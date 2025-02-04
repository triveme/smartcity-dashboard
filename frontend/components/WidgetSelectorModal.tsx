import { ReactElement, useEffect, useState } from 'react';
import SearchableDropdown from '@/ui/SearchableDropdown';
import { Widget } from '@/types';
import { postWidgetToPanelRelation } from '@/api/widgetPanelRelation-service';
import { useAuth } from 'react-oidc-context';
import { useQuery } from '@tanstack/react-query';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import { getWidgets, getWidgetsByPanelId } from '@/api/widget-service';
import DashboardIcons from '@/ui/Icons/DashboardIcon';

type WidgetSelectorModalProps = {
  panelId: string;
  onCloseModal: () => void;
  refetch: () => void;
  tenant: string | undefined;
  backgroundColor: string;
  borderColor: string;
  fontColor: string;
  hoverColor: string;
};

export default function WidgetSelectorModal(
  props: WidgetSelectorModalProps,
): ReactElement | null {
  const {
    panelId,
    onCloseModal,
    refetch,
    tenant,
    backgroundColor,
    borderColor,
    fontColor,
    hoverColor,
  } = props;
  const auth = useAuth();

  const [selectedWidgetInDropdown, setSelectedWidgetInDropdown] = useState('');
  const { openSnackbar } = useSnackbar();

  // Fetch widgets and panel widgets
  const {
    data: allWidgets,
    isError: widgetsIsError,
    error: widgetsError,
  } = useQuery<Widget[], Error>({
    queryKey: ['widgets'],
    queryFn: () => getWidgets(auth?.user?.access_token, tenant),
  });

  const {
    data: selectedWidgets,
    isError,
    error,
  } = useQuery<Widget[], Error>({
    queryKey: ['widgetsByPanelId', panelId],
    queryFn: () => getWidgetsByPanelId(auth?.user?.access_token, panelId!),
    enabled: !!panelId,
  });

  useEffect(() => {
    if (isError) {
      openSnackbar('Error: ' + error.message, 'error');
    }

    if (widgetsIsError) {
      openSnackbar('Error: ' + widgetsError.message, 'error');
    }
  }, [isError, widgetsIsError, error, widgetsError, openSnackbar]);

  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
      <div
        className="p-4 rounded-lg w-2/5 h-1/6"
        style={{
          backgroundColor: backgroundColor,
          color: fontColor,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Select a widget</h2>
          <button className="text-lg focus:outline-none" onClick={onCloseModal}>
            <DashboardIcons iconName="XMark" color={fontColor} />
          </button>
        </div>
        <div className="h-15 flex justify-center items-start mt-8">
          <SearchableDropdown
            value={selectedWidgetInDropdown}
            options={
              allWidgets?.length
                ? [
                    ...(allWidgets || [])
                      .filter(
                        (widget) =>
                          !selectedWidgets?.some(
                            (selectedWidget) => selectedWidget.id === widget.id,
                          ),
                      )
                      .map((widget) => widget.name),
                  ]
                : ['Kein Widget verfügbar']
            }
            onSelect={async (selectedOption: string): Promise<void> => {
              if (selectedOption === 'Kein Widget verfügbar') {
                // Handle the 'No Widget' selection logic if needed
                onCloseModal();
                refetch();
                return;
              }

              setSelectedWidgetInDropdown(selectedOption);
              const match = (allWidgets || []).find(
                (widget) => widget.name === selectedOption,
              );
              if (match) {
                const newPosition = selectedWidgets?.length || 0;
                await postWidgetToPanelRelation(
                  auth?.user?.access_token,
                  match.id!,
                  panelId,
                  newPosition,
                );
                onCloseModal();
                refetch();
              }
            }}
            backgroundColor={backgroundColor}
            borderColor={borderColor}
            hoverColor={hoverColor}
          />
        </div>
      </div>
    </div>
  );
}
