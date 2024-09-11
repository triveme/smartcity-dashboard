import { ReactElement, useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';

import { GroupingElement } from '@/types';
import DashboardIcons from './Icons/DashboardIcon';
import VerticalDivider from './VerticalDivider';
import CreateDashboardElementButton from './Buttons/CreateDashboardElementButton';
import {
  getMenuGroupingElements,
  updateMenuGroupingElement,
} from '@/api/menu-service';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import '../app/globals.css';
import { useParams } from 'next/navigation';
import { env } from 'next-runtime-env';

type GroupingElementComponentProps = {
  element: GroupingElement;
  index?: number;
  handleEditClick: (element: GroupingElement) => void;
  handleRemoveClick: (element: GroupingElement) => void;
  setIsModalOpen: (isActive: boolean) => void;
  setParentGroup: (group: GroupingElement) => void;
  setParentGroupId: (elementId: string) => void;
  handleElementPositionChange: (
    elementId: string,
    direction: 'up' | 'down',
  ) => Promise<void>;
  setSelectedElement: (group: GroupingElement | undefined) => void;
  depth?: number; // start with 0 for the top-level elements
  menuElementsCount?: number;
  iconColor: string;
  borderColor: string;
};

export default function GroupingElementComponent(
  props: GroupingElementComponentProps,
): ReactElement {
  const {
    element,
    handleEditClick,
    handleRemoveClick,
    setIsModalOpen,
    setParentGroup,
    setParentGroupId,
    handleElementPositionChange,
    setSelectedElement,
    depth,
    index,
    menuElementsCount,
    iconColor,
    borderColor,
  } = props;
  const { openSnackbar } = useSnackbar();
  const cookie = Cookies.get('access_token');
  const accessToken = cookie || '';
  const params = useParams();
  const [verticalHeight, setVerticalHeight] = useState(0);

  const NEXT_PUBLIC_MULTI_TENANCY = env('NEXT_PUBLIC_MULTI_TENANCY');
  const tenant =
    NEXT_PUBLIC_MULTI_TENANCY === 'true'
      ? (params.tenant as string)
      : undefined;

  const { refetch } = useQuery({
    queryKey: ['menu'],
    queryFn: () => getMenuGroupingElements(tenant, accessToken!),
  });

  const screenWidth = window.innerWidth;
  const calculateResponsiveWidth = (depth: number): number => {
    const screenWidth = window.innerWidth;

    if (screenWidth >= 1600) {
      const baseWidth = 90;
      const minWidth = 15;
      const widthReductionPerLevel = 7;
      const calculatedWidth = baseWidth - depth * widthReductionPerLevel;
      return Math.max(calculatedWidth, minWidth);
    }
    if (screenWidth <= 1200 && screenWidth >= 980) {
      const baseWidth = 40;
      const minWidth = 5;
      const widthReductionPerLevel = 3;
      const calculatedWidth = baseWidth - depth * widthReductionPerLevel;
      return Math.max(calculatedWidth, minWidth);
    }
    if (screenWidth <= 980) {
      const baseWidth = 20;
      const minWidth = 5;
      const widthReductionPerLevel = 3;
      const calculatedWidth = baseWidth - depth * widthReductionPerLevel;
      return Math.max(calculatedWidth, minWidth);
    } else {
      const baseWidth = 60;
      const minWidth = 5;
      const widthReductionPerLevel = 3;
      const calculatedWidth = baseWidth - depth * widthReductionPerLevel;
      return Math.max(calculatedWidth, minWidth);
    }
  };

  const [responsiveWidth, setResponsiveWidth] = useState(
    calculateResponsiveWidth(depth!),
  );

  useEffect(() => {
    function handleResize(): void {
      setResponsiveWidth(calculateResponsiveWidth(depth!));
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [depth]);
  const parentRef = useRef<HTMLDivElement>(null);

  const moveElement = async (
    childElementId: string,
    direction: 'up' | 'down',
  ): Promise<void> => {
    if (!element.children) return;
    const currentIndex = element.children.findIndex(
      (p) => p.id === childElementId,
    );
    if (currentIndex === undefined) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= element.children.length) return;

    const tempPosition = element.children[currentIndex].position;
    element.children[currentIndex].position =
      element.children[newIndex].position;
    element.children[newIndex].position = tempPosition;

    const updates = [
      {
        ...element.children[currentIndex],
        position: element.children[currentIndex].position,
      },
      {
        ...element.children[newIndex],
        position: element.children[newIndex].position,
      },
    ];

    try {
      await Promise.all(
        updates.map((el) =>
          updateMenuGroupingElement(accessToken, {
            id: el.id,
            position: el.position,
          }),
        ),
      );
      refetch();
      openSnackbar('Die Position wurden erfolgreich aktualisiert', 'success');
    } catch (error) {
      console.error('Failed to update positions in the database:', error);
      openSnackbar('Die Position konnten nicht aktualisiert werden', 'error');
    }
  };
  useEffect(() => {
    if (parentRef.current) {
      // Fetch only the direct children, not all descendants.
      const children = parentRef.current.children;
      if (children.length > 0) {
        const lastChild = children[children.length - 1] as HTMLElement;
        if (lastChild) {
          const lastChildOffsetTop = lastChild.offsetTop;
          // Update the state with the new height
          setVerticalHeight(lastChildOffsetTop + 42);
        }
      }
    }
  }, [element.children, element.id]);

  const calculateMenuElements = (element: GroupingElement): number => {
    let menuElementsCount = 0;

    if (element.children && element.children.length > 0) {
      menuElementsCount = element.children.length - 1;
    } else {
      menuElementsCount = menuElementsCount ? menuElementsCount : 0;
    }

    return menuElementsCount;
  };

  return (
    <div className="flex flex-col gap-4 items-end relative">
      <div
        className={`relative flex justify-between items-center content-center rounded-lg border-2 border-inherit w-full ${
          (element.children &&
            element.children.length > 0 &&
            element.parentGroupingElementId) ||
          (element.children?.length === 0 &&
            !element.isDashboard &&
            element.parentGroupingElementId)
            ? 'child-node'
            : ''
        }`}
        style={
          {
            '--child-node-before-width': `${responsiveWidth}px`,
            borderColor: borderColor,
          } as React.CSSProperties
        }
      >
        <div className="py-2 px-4 grow">{element.name}</div>

        <div className="px-4 py-2 flex justify-end items-center content-center h-full gap-3">
          {index !== 0 && (
            <button
              onClick={(): Promise<void> =>
                handleElementPositionChange(element.id!, 'up')
              }
            >
              <DashboardIcons iconName="ChevronUp" color={iconColor} />
            </button>
          )}
          {index !== menuElementsCount && (
            <button
              className="pl-4"
              onClick={(): Promise<void> =>
                handleElementPositionChange(element.id!, 'down')
              }
            >
              <DashboardIcons iconName="ChevronDown" color={iconColor} />
            </button>
          )}

          <VerticalDivider />
          <button onClick={(): void => handleEditClick(element)}>
            <DashboardIcons iconName="Pen" color={iconColor} />
          </button>
          <button onClick={(): void => handleRemoveClick(element)}>
            <DashboardIcons iconName="Trashcan" color="#FA4141" />
          </button>
        </div>
      </div>
      {element.children && element.children.length > 0 && (
        <div
          className="flex absolute left-0.5 top-10 w-0.5"
          style={{
            height: verticalHeight + 'px',
            backgroundColor: borderColor,
          }}
        ></div>
      )}
      <div
        className="w-11/12 flex flex-col gap-4 justify-end relative"
        ref={parentRef}
      >
        {element.children &&
          element.children.length > 0 &&
          element.children.map((el: GroupingElement, index: number) =>
            el.isDashboard ? (
              <div
                className="flex justify-between items-center content-center rounded-lg border-2 w-full relative child-node"
                key={`dashboard-child-${el.id}-${index}`}
                style={
                  {
                    '--child-node-before-width': `${Math.max(
                      screenWidth >= 1600
                        ? Math.max(responsiveWidth - 7, 15)
                        : Math.max(responsiveWidth - 3, 5),
                    )}px`,
                    borderColor: borderColor,
                  } as React.CSSProperties
                }
              >
                <div className="py-2 px-4 grow">{el.name}</div>
                <div className="px-4 py-2 flex justify-center items-center content-center h-full gap-3">
                  {index !== 0 && (
                    <button
                      onClick={(): Promise<void> => moveElement!(el.id!, 'up')}
                    >
                      <DashboardIcons iconName="ChevronUp" color={iconColor} />
                    </button>
                  )}
                  {element.children &&
                    index !== element.children.length - 1 && (
                      <button
                        className="pl-4"
                        onClick={(): Promise<void> =>
                          moveElement!(el.id!, 'down')
                        }
                      >
                        <DashboardIcons
                          iconName="ChevronDown"
                          color={iconColor}
                        />
                      </button>
                    )}

                  <VerticalDivider />
                  <button onClick={(): void => handleEditClick(el)}>
                    <DashboardIcons iconName="Pen" color={iconColor} />
                  </button>
                  <button onClick={(): void => handleRemoveClick(el)}>
                    <DashboardIcons iconName="Trashcan" color="#FA4141" />
                  </button>
                </div>
              </div>
            ) : (
              <GroupingElementComponent
                key={`menu-deep-${element.id}-${index}`}
                element={el}
                index={index}
                handleEditClick={handleEditClick}
                handleRemoveClick={handleRemoveClick}
                setIsModalOpen={setIsModalOpen}
                setParentGroup={setParentGroup}
                setParentGroupId={setParentGroupId}
                handleElementPositionChange={moveElement}
                setSelectedElement={setSelectedElement}
                depth={depth! + 1}
                menuElementsCount={calculateMenuElements(element)}
                iconColor={iconColor}
                borderColor={borderColor}
              />
            ),
          )}
      </div>
      {!element.isDashboard && (
        <div className="w-11/12">
          <CreateDashboardElementButton
            label="+ Element hinzufügen"
            handleClick={(): void => {
              setParentGroup(element);
              setParentGroupId(element.id!);
              setSelectedElement(undefined);
              setIsModalOpen(true);
            }}
          />
        </div>
      )}
    </div>
  );
}
