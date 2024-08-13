'use client';

import React, { ReactElement, useEffect, useRef, useState } from 'react';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import { useParams } from 'next/navigation';
import { GroupingElement } from '@/types';
import DashboardSidebarDashboard from './DashboardSidebarDashboard';
import '../app/globals.css';
import { getCorporateInfosWithLogos } from '@/api/corporateInfo-service';
import { useQuery } from '@tanstack/react-query';
import { getTenantOfPage } from '@/utils/tenantHelper';

type DashboardSidebarGroupProps = {
  groupElement: GroupingElement;
  index: number;
  url: string;
  onDashboardClick: () => void;
};

type BackgroundColorStyle =
  | { backgroundImage: string }
  | { backgroundColor: string };

export default function DashboardSidebarGroup(
  props: DashboardSidebarGroupProps,
): ReactElement {
  const { index, groupElement, url, onDashboardClick } = props;
  const [isOpen, setIsOpen] = useState(false);
  const params = useParams();
  const childContainerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const defaultBgColor = '#3D4760';
  const DynamicStyles = {
    customBgColor: groupElement.color || defaultBgColor,
  };
  const tenant = getTenantOfPage();

  const { data } = useQuery({
    queryKey: ['corporate-info'],
    queryFn: () => getCorporateInfosWithLogos(tenant),
  });

  const toggleDropdown = (): void => setIsOpen(!isOpen);

  const isActiveDropdown = (): boolean => {
    if (params && params.url) {
      if (params.url[index] === groupElement.url) {
        if (!isOpen) {
          setIsOpen(true);
        }
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    const updateLineHeight = (): void => {
      if (childContainerRef.current && lineRef.current) {
        const children = Array.from(
          childContainerRef.current.children as HTMLCollectionOf<HTMLElement>,
        );
        let totalHeight = 0;
        children.forEach((child, index) => {
          if (index < children.length - 1) {
            totalHeight += child.offsetHeight;
          } else {
            groupElement?.children?.map((item) => {
              if (!item?.isDashboard && groupElement.children?.length === 1) {
                totalHeight -= 4;
              }
              if (
                groupElement?.children &&
                !groupElement?.children[groupElement.children?.length - 1]
                  ?.isDashboard &&
                groupElement?.children?.length > 1
              ) {
                totalHeight = totalHeight - 4 / groupElement?.children?.length;
              }
            });

            totalHeight += 20;
          }
        });

        lineRef.current.style.height = `${totalHeight}px`;
      }
    };

    const observer = new ResizeObserver(updateLineHeight);
    if (childContainerRef.current) {
      observer.observe(childContainerRef.current);
    }

    updateLineHeight(); // Update immediately

    return () => observer.disconnect();
  }, [isOpen, groupElement.children]);

  const getBgColorOnHover = (
    groupElement: GroupingElement,
  ): BackgroundColorStyle => {
    return groupElement.gradient
      ? {
          backgroundImage: `linear-gradient(to top right, ${DynamicStyles.customBgColor}, #59647D00)`,
        }
      : { backgroundColor: DynamicStyles.customBgColor };
  };

  const getBgColorForActiveDropdown = (
    groupElement: GroupingElement,
  ): BackgroundColorStyle => {
    return groupElement.gradient
      ? {
          backgroundImage: `linear-gradient(to top right, ${DynamicStyles.customBgColor}, #59647D00)`,
        }
      : {
          backgroundColor: DynamicStyles.customBgColor,
        };
  };

  const determineFontColor = (): string => {
    if (isActiveDropdown()) {
      return data?.menuActiveFontColor ?? '#FFFFFF';
    } else {
      return data?.menuFontColor ?? '#000000';
    }
  };

  const menuStyle = {
    width: '100%',
    padding: '6px',
    cursor: 'pointer',
    ...(isActiveDropdown() ? getBgColorForActiveDropdown(groupElement) : {}),
    // For hover effect using dynamic color
    ...(isHovered && getBgColorOnHover(groupElement)),
    color: determineFontColor(),
  };

  return (
    <div className="w-full pb-2">
      <div
        style={menuStyle}
        className="flex items-center content-center justify-around cursor-pointer rounded-lg p-1"
        onMouseEnter={(): void => setIsHovered(true)}
        onMouseLeave={(): void => setIsHovered(false)}
        onClick={toggleDropdown}
      >
        <div className="basis-1/5">
          {groupElement.icon && (
            <DashboardIcons iconName={groupElement.icon} color="white" />
          )}
        </div>
        <div className="basis-3/5 text-white">{groupElement.name}</div>
        <div className="basis-1/5">
          <div className="h-5 w-5 ml-auto transform">
            {isOpen ? (
              <DashboardIcons iconName="ChevronDown" color="white" />
            ) : (
              <DashboardIcons iconName="ChevronUp" color="white" />
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="relative ml-4 mt-2">
          {groupElement.children && (
            <div
              ref={lineRef}
              className="absolute -left-2 transform -translate-x-1/2 top-0 w-px bg-gray-300"
            ></div>
          )}

          <div className="flex flex-col" ref={childContainerRef}>
            {groupElement.children?.map((element, childIndex) => (
              <div key={element.id || childIndex} className="relative">
                <div
                  className={`absolute ${
                    element.isDashboard
                      ? 'top-5 w-2 -left-1'
                      : 'top-4 w-2 -translate-x-2'
                  } h-px bg-gray-300 transform -translate-x-1/2 -translate-y-1/2`}
                ></div>

                {element.isDashboard ? (
                  <DashboardSidebarDashboard
                    key={element.id!}
                    name={element.name!}
                    url={`${url}/${element.url!}`}
                    elementUrl={element.url!}
                    icon={element.icon!}
                    onDashboardClick={onDashboardClick}
                  />
                ) : (
                  <DashboardSidebarGroup
                    key={'SidebarItem-' + element.id}
                    groupElement={element}
                    index={index + 1}
                    url={`${url}/${element.url!}`}
                    onDashboardClick={onDashboardClick}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
