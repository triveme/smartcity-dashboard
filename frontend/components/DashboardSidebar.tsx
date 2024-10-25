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

type BackgroundColorStyle =
  | { backgroundImage: string }
  | { backgroundColor: string };

type DashboardSidebarProps = {
  useColorTransitionMenu: boolean;
  menuPrimaryColor: string;
  menuSecondaryColor: string;
  menuFontColor: string;
};

export default function DashboardSidebar(
  props: DashboardSidebarProps,
): ReactElement {
  const {
    useColorTransitionMenu,
    menuPrimaryColor,
    menuSecondaryColor,
    menuFontColor,
  } = props;

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const cookie = Cookies.get('access_token');
  const accessToken = cookie || '';

  // Multi Tenancy
  const tenant = getTenantOfPage();

  const getBgColorForMenu = (): BackgroundColorStyle => {
    return useColorTransitionMenu
      ? {
          backgroundImage: `linear-gradient(to right, ${menuPrimaryColor}, ${menuSecondaryColor})`,
        }
      : {
          backgroundColor: menuPrimaryColor || '#3D4760',
        };
  };
  // Query Menu Structure
  const { data: groupingElements } = useQuery({
    queryKey: ['menu'],
    queryFn: () => getMenuGroupingElements(tenant, accessToken!),
  });

  //Dynamic Styling
  const sidebarStyle: CSSProperties = {
    ...getBgColorForMenu(),
    color: menuFontColor || '#FFFFFF',
  };

  const toggleSidebar = (): void => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      {/* Burger Menu Button */}
      <div className="md:hidden fixed left-0 bottom-0 p-4 z-50">
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
        className={`h-screen transition-all ease-in-out duration-300 flex flex-col md:w-64 sm:w-full ${
          isSidebarOpen ? 'fixed inset-0 z-40' : 'hidden md:flex'
        }`}
      >
        {/* Top Icon */}
        <div
          style={sidebarStyle}
          className="h-16 p-3 flex justify-center items-center content-center w-full z-10 shadow-md"
        >
          <p className="mr-auto">Dashboards</p>
        </div>

        {/* Dynamic Navigation Points */}
        <div
          style={sidebarStyle}
          className="flex flex-col justify-start items-start flex-1 p-2"
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
                  menuColor={element.fontColor}
                  onDashboardClick={toggleSidebar}
                />
              ) : (
                <DashboardSidebarGroup
                  key={'SidebarItem-' + element.id}
                  groupElement={element}
                  index={0}
                  url={element.url!}
                  onDashboardClick={toggleSidebar}
                />
              ),
            )}
        </div>

        {/* Bottom */}
        <div className="p-4 flex flex-row justify-end">
          <SidebarFooter />
        </div>
      </div>
    </>
  );
}
