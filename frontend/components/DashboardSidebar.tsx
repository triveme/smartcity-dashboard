'use client';

import { ReactElement, useState, CSSProperties } from 'react';
import Cookies from 'js-cookie';

import SidebarFooter from './SidebarFooter';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import DashboardSidebarDashboard from './DashboardSidebarDashboard';
import DashboardSidebarGroup from './DashboardSidebarGroup';
import { useQuery } from '@tanstack/react-query';
import { getTenantOfPage } from '@/utils/tenantHelper';
import { getMenuGroupingElements } from '@/api/menu-service';
import { menuArrowDirectionEnum } from '@/types';

type DashboardSidebarProps = {
  menuPrimaryColor: string;
  menuFontColor: string;
  menuCornerColor: string;
  menuCornerFontColor: string;
  menuArrowDirection: menuArrowDirectionEnum;
};

export default function DashboardSidebar(
  props: DashboardSidebarProps,
): ReactElement {
  const {
    menuPrimaryColor,
    menuFontColor,
    menuCornerColor,
    menuCornerFontColor,
    menuArrowDirection,
  } = props;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const cookie = Cookies.get('access_token');
  const accessToken = cookie || '';

  // Multi Tenancy
  const tenant = getTenantOfPage();

  // Query Menu Structure
  const { data: groupingElements } = useQuery({
    queryKey: ['menu'],
    queryFn: () => getMenuGroupingElements(tenant, accessToken!),
  });

  //Dynamic Styling
  const sidebarStyle: CSSProperties = {
    backgroundColor: menuPrimaryColor || '#3D4760',
    color: menuFontColor || '#FFFFFF',
  };

  const toggleSidebar = (): void => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {/* Burger Menu Button */}
      <div className="lg:hidden fixed left-0 bottom-0 p-4 z-[100]">
        <button
          onClick={toggleSidebar}
          className="h-12 w-12 rounded-full shadow-lg"
          style={sidebarStyle}
        >
          {!isSidebarOpen ? (
            <DashboardIcons
              iconName="Menu"
              color={sidebarStyle.color || '#FFF'}
            />
          ) : (
            <DashboardIcons
              iconName="ChevronLeft"
              color={sidebarStyle.color || '#FFF'}
            />
          )}
        </button>
      </div>

      <div
        style={sidebarStyle}
        className={`h-screen flex-shrink-0 transition-all ease-in-out duration-300 flex flex-col lg:w-64 sm:w-full ${
          isSidebarOpen ? 'fixed inset-0 z-[90]' : 'hidden lg:flex'
        }`}
      >
        {/* Top Icon */}
        <div
          style={{
            backgroundColor: menuCornerColor,
            color: menuCornerFontColor,
          }}
          className="h-16 p-3 flex justify-center items-center content-center w-full z-10 shadow-md"
        >
          <p className="mr-auto">Dashboards</p>
        </div>

        {/* Dynamic Navigation Points */}
        <div className="w-full flex flex-col justify-start items-start flex-1 overflow-y-auto">
          <div
            style={sidebarStyle}
            className="w-full flex flex-col justify-start items-start flex-1 p-2"
          >
            {groupingElements &&
              groupingElements.sort(
                (a, b) => (a.position ?? 0) - (b.position ?? 0),
              ) &&
              groupingElements.length > 0 &&
              groupingElements.map((element) =>
                element.isDashboard ? (
                  <DashboardSidebarDashboard
                    key={element.id!}
                    name={element.name!}
                    url={element.url!}
                    elementUrl={element.url!}
                    icon={element.icon!}
                    onDashboardClick={toggleSidebar}
                  />
                ) : (
                  <DashboardSidebarGroup
                    key={'SidebarItem-' + element.id}
                    groupElement={element}
                    index={0}
                    url={element.url!}
                    onDashboardClick={toggleSidebar}
                    menuArrowDirection={menuArrowDirection}
                  />
                ),
              )}
          </div>

          {/* Bottom */}
          <div className="p-4 flex flex-row justify-end">
            <SidebarFooter />
          </div>
        </div>
      </div>
    </>
  );
}
