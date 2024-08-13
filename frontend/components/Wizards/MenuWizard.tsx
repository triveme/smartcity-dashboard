'use client';

import { ReactElement, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Dashboard, GroupingElement } from '@/types';
import CreateDashboardElementButton from '@/ui/Buttons/CreateDashboardElementButton';
import GroupingElementComponent from '@/ui/GroupingElementComponent';
import {
  deleteMenuGroupingElement,
  getMenuGroupingElements,
  updateMenuGroupingElement,
} from '@/api/menu-service';
import GroupingElementAddDashboardWizard from './GroupingElementAddDashboardWizard';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import { getDashboards } from '@/api/dashboard-service';
import { useAuth } from 'react-oidc-context';
import { useParams } from 'next/navigation';
import { env } from 'next-runtime-env';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

type MenuWizardProps = {
  iconColor: string;
  borderColor: string;
  backgroundColor: string;
  fontColor: string;
};

export default function MenuWizard(props: MenuWizardProps): ReactElement {
  const { iconColor, borderColor, backgroundColor, fontColor } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<GroupingElement>();
  const [parentGroup, setParentGroup] = useState<GroupingElement>();
  const [parentGroupId, setParentGroupId] = useState<string | undefined>();
  const [allDashboards, setAllDashboards] = useState<Dashboard[]>();
  const [menuElements, setMenuElements] = useState<GroupingElement[]>();
  const { openSnackbar } = useSnackbar();
  const auth = useAuth();
  const params = useParams();

  const NEXT_PUBLIC_MULTI_TENANCY = env('NEXT_PUBLIC_MULTI_TENANCY');
  const tenant =
    NEXT_PUBLIC_MULTI_TENANCY === 'true'
      ? (params.tenant as string)
      : undefined;

  // Query Menu Structure
  const {
    data: groupingElementsData,
    refetch,
    isError: isGroupingError,
    error: groupingElementError,
    isPending: isGroupingPending,
    isError: MenuGroupingElementsError,
  } = useQuery({
    queryKey: ['menu'],
    queryFn: () =>
      tenant
        ? getMenuGroupingElements(tenant, auth.user?.access_token)
        : getMenuGroupingElements(auth.user?.access_token),
  });

  // Query Dashboards to fill dropdown
  const { data: dashboards } = useQuery({
    queryKey: ['dashboards'],
    queryFn: () => getDashboards(auth?.user?.access_token, false, tenant),
  });

  useEffect(() => {
    if (dashboards) {
      setAllDashboards(dashboards);
    }
  }, [dashboards]);

  useEffect(() => {
    if (MenuGroupingElementsError) {
      openSnackbar('Fehler beim Abfragen des Menüs!', 'error');
    }
  }, [MenuGroupingElementsError]);

  useEffect(() => {
    if (groupingElementsData) {
      setMenuElements(
        groupingElementsData.sort(
          (a, b) => (a.position ?? 0) - (b.position ?? 0),
        ),
      );
    }
  }, [groupingElementsData]);

  if (isGroupingError) {
    const errorMessage = groupingElementError?.message;
    return <div className="p-2">Error: {errorMessage} </div>;
  }

  if (isGroupingPending) {
    return (
      <div className="flex flex-row min-h-screen justify-center items-center text-2xl">
        <DashboardIcons iconName="Spinner" color="white" />
      </div>
    );
  }

  const handleEditGroupClick = (element: GroupingElement): void => {
    setSelectedElement(element);
    // setParentGroup(undefined);
    setParentGroupId(element.parentGroupingElementId || undefined);
    setIsModalOpen(true);
  };

  // find siblings of deleted element based on parent id
  const findSameLevelElements = (
    deletedElementParentId: string,
  ): GroupingElement[] => {
    let sameLevelElementsAsDeleted: GroupingElement[] = [];

    const findChildren = (element: GroupingElement[]): void => {
      element.forEach((elem) => {
        if (elem.id === deletedElementParentId) {
          sameLevelElementsAsDeleted = elem.children || [];
        } else if (elem.children && elem.children.length > 0) {
          findChildren(elem.children);
        }
      });
    };

    findChildren(menuElements ?? []);

    return sameLevelElementsAsDeleted;
  };

  const handleRemoveElementClick = async (
    element: GroupingElement,
  ): Promise<void> => {
    try {
      if (element.id) {
        await deleteMenuGroupingElement(auth?.user?.access_token, element.id);
        const successMessage = element.isDashboard
          ? 'Dashboard erfolgreich gelöscht!'
          : 'Gruppierungselement erfolgreich gelöscht!';
        openSnackbar(successMessage, 'success');

        let elementsOnSameLevel: GroupingElement[] = [];

        // if deleted element is top level
        if (element.parentGroupingElementId === null) {
          elementsOnSameLevel = menuElements ?? [];
        } else {
          const deletedElementParentId = element.parentGroupingElementId;
          elementsOnSameLevel = findSameLevelElements(deletedElementParentId);
        }

        const remainingGroupingElements =
          elementsOnSameLevel?.filter((el) => el.id !== element.id) ?? [];
        const updatedElements = remainingGroupingElements
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
          .map((el, index) => ({ ...el, position: index }));

        await Promise.all(
          updatedElements.map((el) =>
            updateMenuGroupingElement(auth?.user?.access_token, {
              id: el.id,
              position: el.position,
            }),
          ),
        );
        refetch();
      }
    } catch (error) {
      const errorMessage = element.isDashboard
        ? 'Dashboard konnte nicht gelöscht werden.'
        : 'Gruppierungselement konnte nicht gelöscht werden.';
      openSnackbar(errorMessage, 'success');
    }

    setIsDeleteModalOpen(false);
  };

  const onClose = (): void => {
    setSelectedElement(undefined);
    setParentGroup(undefined);
    setParentGroupId(undefined);
    setIsModalOpen(false);
    refetch();
  };

  const calculateElementPosition = (): number => {
    let elementPosition = 0;

    // maintain current position for edit element
    if (selectedElement) {
      elementPosition = selectedElement?.position || 0;
    } else {
      elementPosition = parentGroup
        ? parentGroup?.children?.length || 0
        : menuElements?.length || 0;
    }

    return elementPosition;
  };

  const handleElementPositionChange = async (
    elementId: string,
    direction: 'up' | 'down',
  ): Promise<void> => {
    if (!menuElements) return;
    const currentIndex = menuElements.findIndex((p) => p.id === elementId);
    if (currentIndex === undefined) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex > menuElements.length) return;

    const tempPosition = menuElements[currentIndex].position;
    menuElements[currentIndex].position = menuElements[newIndex].position;
    menuElements[newIndex].position = tempPosition;

    const updates = [
      {
        id: menuElements[currentIndex].id,
        position: menuElements[currentIndex].position,
      },
      {
        id: menuElements[newIndex].id,
        position: menuElements[newIndex].position,
      },
    ];

    try {
      await Promise.all(
        updates.map((el) =>
          updateMenuGroupingElement(auth?.user?.access_token, {
            id: el.id,
            position: el.position,
          }),
        ),
      );
      openSnackbar('Die Position wurde erfolgreich aktualisiert', 'success');

      refetch();
    } catch (error) {
      console.error(
        'Failed to update elements positions in the database:',
        error,
      );
      openSnackbar('Die Position konnte nicht aktualisiert werden', 'error');
    }
  };

  const calculateMenuElements = (element: GroupingElement): number => {
    let menuElementsCount = 0;

    if (
      element.children &&
      element.children.length > 0 &&
      element.parentGroupingElementId !== null
    ) {
      menuElementsCount = element.children.length - 1;
    } else {
      menuElementsCount = menuElements ? menuElements.length - 1 : 0;
    }

    return menuElementsCount;
  };

  function handleClickDeleteIcon(element: GroupingElement): void {
    setIsDeleteModalOpen(true);

    if (element) setSelectedElement(element);
  }

  return (
    <div className="flex flex-col w-full">
      <div
        className="flex flex-col border-2 w-full rounded-lg p-4"
        style={{
          color: fontColor,
          borderColor: borderColor,
        }}
      >
        {menuElements &&
          menuElements.length > 0 &&
          menuElements.map((element: GroupingElement, index: number) => (
            <GroupingElementComponent
              key={`menu-${element.id}-${index}`}
              element={element}
              index={index}
              handleEditClick={handleEditGroupClick}
              handleRemoveClick={handleClickDeleteIcon}
              setIsModalOpen={setIsModalOpen}
              setParentGroup={setParentGroup}
              setParentGroupId={setParentGroupId}
              handleElementPositionChange={handleElementPositionChange}
              setSelectedElement={setSelectedElement}
              depth={0}
              menuElementsCount={calculateMenuElements(element)}
              iconColor={iconColor}
              borderColor={borderColor}
            />
          ))}
        <CreateDashboardElementButton
          label="+ Element hinzufügen"
          handleClick={(): void => {
            setSelectedElement(undefined);
            setIsModalOpen(true);
            setParentGroup(undefined);
          }}
        />
      </div>
      <div className="text-right text-xs" style={{ color: fontColor }}>
        * Änderungen werden automatisch gespeichert
      </div>

      {isModalOpen && (
        <GroupingElementAddDashboardWizard
          editElement={selectedElement || undefined}
          parentGroup={parentGroup}
          parentGroupId={parentGroupId}
          allDashboards={allDashboards || []}
          newElementPosition={calculateElementPosition()}
          onClose={onClose}
          iconColor={iconColor}
          borderColor={borderColor}
          backgroundColor={backgroundColor}
          fontColor={fontColor}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          onClose={(): void => setIsDeleteModalOpen(false)}
          onDelete={(): Promise<void> =>
            handleRemoveElementClick(selectedElement!)
          }
        />
      )}
    </div>
  );
}
