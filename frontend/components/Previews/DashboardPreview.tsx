import { ReactElement, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import dynamic from 'next/dynamic';

import CreateDashboardElementButton from '@/ui/Buttons/CreateDashboardElementButton';
import DashboardPanelPreview from '@/components/Previews/DashboardPanelPreview';
import PanelWizard from '@/components/Wizards/PanelWizard';
import { Panel, Tab } from '@/types';
import { deletePanel, postPanel, updatePanel } from '@/api/panel-service';
import { EMPTY_PANEL } from '@/utils/objectHelper';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

const Map = dynamic(() => import('@/components/Map/Map'), {
  ssr: false,
});

type DashboardPreviewProps = {
  panels: Panel[];
  handlePanelChange: (panels: Panel[]) => void;
  refetchPanel: () => void;
  canFetch: boolean;
  dashboardType: string;
  selectedTab: Tab | undefined;
  fontColor: string;
  iconColor: string;
  backgroundColor: string;
  borderColor: string;
};

export default function DashboardPreview(
  props: DashboardPreviewProps,
): ReactElement {
  const {
    panels,
    handlePanelChange,
    refetchPanel,
    canFetch,
    dashboardType,
    selectedTab,
    fontColor,
    iconColor,
    borderColor,
    backgroundColor,
  } = props;
  const auth = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPanelToDelete, setSelectedPanelToDelete] = useState<Panel>();
  const [activePanel, setActivePanel] = useState<Panel>();
  const { openSnackbar } = useSnackbar();
  const [isCreate, setIsCreate] = useState(false);

  const handleEditPanelClick = (panel: Panel): void => {
    setIsCreate(false);
    setActivePanel(panel);
    setIsModalOpen(true);
  };

  const handleNewPanelClick = async (): Promise<void> => {
    setIsCreate(true);
    const tempPanel = {
      ...EMPTY_PANEL,
      position: panels.length + 1,
    };
    const newPanel = await postPanel(auth.user?.access_token, tempPanel);
    setActivePanel(newPanel);
    setIsModalOpen(true);
    handlePanelChange([...panels, newPanel]);
  };

  const handlePanelWizardClosed = (): void => {
    if (canFetch) {
      refetchPanel();
    }
    setIsModalOpen(false);
  };

  const handleRemovePanelClick = async (panel: Panel): Promise<void> => {
    try {
      if (panel.id) {
        await deletePanel(auth?.user?.access_token, panel.id);
        const remainingPanels = panels.filter((p) => p.id !== panel.id);

        const updatedPanels = remainingPanels
          .sort((a, b) => a.position - b.position)
          .map((p, index) => ({ ...p, position: index + 1 }));

        await Promise.all(
          updatedPanels.map((p) => updatePanel(auth?.user?.access_token, p)),
        );

        handlePanelChange(updatedPanels);
        openSnackbar('Das Panel wurde erfolgreich gelöscht!', 'success');
      }
    } catch (error) {
      console.error('Failed to remove panel:', error);
      openSnackbar('Das Panel konnte nicht gelöscht werden.', 'error');
    }

    setIsDeleteModalOpen(false);
  };

  const handlePanelPositionChange = async (
    panelId: string,
    direction: 'left' | 'right',
  ): Promise<void> => {
    const currentIndex = panels.findIndex((p) => p.id === panelId);
    if (currentIndex === -1) return;

    let newIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    newIndex = Math.max(0, Math.min(panels.length - 1, newIndex));

    if (currentIndex !== newIndex) {
      const updatedPanels = [...panels];
      const temp = updatedPanels[currentIndex];
      updatedPanels[currentIndex] = updatedPanels[newIndex];
      updatedPanels[newIndex] = temp;

      const tempPosition = updatedPanels[currentIndex].position;
      updatedPanels[currentIndex].position = updatedPanels[newIndex].position;
      updatedPanels[newIndex].position = tempPosition;

      handlePanelChange(updatedPanels);

      try {
        await Promise.all([
          updatePanel(auth?.user?.access_token, updatedPanels[currentIndex]),
          updatePanel(auth?.user?.access_token, updatedPanels[newIndex]),
        ]);
        openSnackbar(
          'Die Panelpositionen wurden erfolgreich aktualisiert',
          'success',
        );
      } catch (error) {
        console.error(
          'Failed to update panel positions in the database:',
          error,
        );
        openSnackbar(
          'Die Panelpositionen konnten nicht aktualisiert werden',
          'error',
        );
      }
    }
  };

  function handleClickDeleteIcon(panel: Panel): void {
    setIsDeleteModalOpen(true);

    if (panel) setSelectedPanelToDelete(panel);
  }

  return (
    <div className="h-full w-full rounded-lg">
      <div className="grid lg:grid-cols-12 md:grid-cols-6 xs:grid-cols-3 grid-flow-row gap-2">
        {panels &&
          dashboardType !== 'Karte' &&
          panels.length > 0 &&
          panels
            .sort((a, b) => a.position - b.position)
            .map((p: Panel, index: number) => (
              <DashboardPanelPreview
                key={`PanelPreview-${p.name}-${index}`}
                panelCount={panels.length}
                panel={p}
                handleEditPanelClick={handleEditPanelClick}
                handleRemovePanelClick={handleClickDeleteIcon}
                movePanel={handlePanelPositionChange}
                index={index}
              />
            ))}
      </div>
      {dashboardType !== 'Karte' && (
        <CreateDashboardElementButton
          label="+ Panel hinzufügen"
          handleClick={handleNewPanelClick}
        />
      )}
      {dashboardType === 'Karte' && (
        <Map
          mapMaxZoom={selectedTab?.mapMaxZoom ? selectedTab.mapMaxZoom : 18}
          mapMinZoom={selectedTab?.mapMinZoom ? selectedTab.mapMinZoom : 0}
          mapAllowPopups={
            selectedTab?.mapAllowPopups ? selectedTab.mapAllowPopups : false
          }
          mapStandardZoom={
            selectedTab?.mapStandardZoom ? selectedTab.mapStandardZoom : 13
          }
          mapAllowZoom={
            selectedTab?.mapAllowZoom ? selectedTab.mapAllowZoom : false
          }
          mapAllowScroll={
            selectedTab?.mapAllowScroll ? selectedTab.mapAllowScroll : false
          }
          mapMarkerColor={
            selectedTab?.mapMarkerColor ? selectedTab.mapMarkerColor : '#257dc9'
          }
          mapMarkerIcon={
            selectedTab?.mapMarkerIcon ? selectedTab.mapMarkerIcon : ''
          }
          mapMarkerIconColor={
            selectedTab?.mapMarkerIconColor
              ? selectedTab?.mapMarkerIconColor
              : 'white'
          }
          mapLongitude={
            selectedTab?.mapLongitude ? selectedTab?.mapLongitude : 9.905548
          }
          mapLatitude={
            selectedTab?.mapLatitude ? selectedTab?.mapLatitude : 51.545483
          }
          mapActiveMarkerColor={
            selectedTab?.mapActiveMarkerColor
              ? selectedTab.mapActiveMarkerColor
              : '#FF0000'
          }
          data={selectedTab?.mapObject || []}
          mapShapeOption={
            selectedTab?.mapShapeOption
              ? selectedTab?.mapShapeOption
              : 'Rectangle'
          }
          mapDisplayMode={
            selectedTab?.mapDisplayMode
              ? selectedTab?.mapDisplayMode
              : 'Only pin'
          }
          mapShapeColor={
            selectedTab?.mapShapeColor ? selectedTab?.mapShapeColor : '#FF0000'
          }
        ></Map>
      )}

      {isModalOpen && activePanel && (
        <PanelWizard
          activePanel={activePanel}
          panels={panels}
          onClose={handlePanelWizardClosed}
          handlePanelChange={handlePanelChange}
          isCreate={isCreate}
          fontColor={fontColor}
          iconColor={iconColor}
          backgroundColor={backgroundColor}
          borderColor={borderColor}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          onClose={(): void => setIsDeleteModalOpen(false)}
          onDelete={(): Promise<void> =>
            handleRemovePanelClick(selectedPanelToDelete!)
          }
        />
      )}
    </div>
  );
}
