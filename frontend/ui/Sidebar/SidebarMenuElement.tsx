'use client';

import { ReactElement, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import DashboardIcons from '@/ui/Icons/DashboardIcon';

type SidebarMenuElementProps = {
  name: string;
  url: string;
  icon: string;
  collapsed: boolean;
  elements: string[];
};

export default function SidebarMenuElement(
  props: SidebarMenuElementProps,
): ReactElement {
  const { name, icon, collapsed, elements, url } = props;
  const [isOpen, setIsOpen] = useState(false);
  const { push } = useRouter();

  const toggleDropdown = (): void => setIsOpen(!isOpen);

  const isActiveDropdown = (): boolean => {
    const params = useParams();

    if (params && params.url) {
      return params.url[0] === url;
    }
    return false;
  };

  const isActiveChild = (child: string): boolean => {
    const params = useParams();

    if (params && params.url) {
      return params.url.includes(child);
    }
    return false;
  };

  return (
    <div className="w-full p-1">
      <div
        className={`flex items-center content-center justify-around cursor-pointer rounded-lg ${
          isActiveDropdown()
            ? 'bg-gradient-to-tr from-[#049A1A] to-[#59647D00]'
            : ''
        }`}
        onClick={toggleDropdown}
      >
        <div className="w-full flex justify-between items-center content-center p-2">
          <div className="basis-1/5">
            {icon ? (
              <DashboardIcons iconName={icon} color="white"></DashboardIcons>
            ) : null}
          </div>

          <div className="basis-3/5">
            <div className="text-white">{!collapsed ? name : null}</div>
          </div>

          <div className="basis-1/5">
            <div
              className={`h-5 w-5 ml-auto transform ${
                isOpen ? 'rotate-180' : ''
              }`}
            >
              <DashboardIcons iconName="ChevronDown" color="white" />
            </div>
          </div>
        </div>
      </div>

      {/* Children */}
      {isOpen && (
        <div className="w-full flex flex-col justify-between items-center content-center">
          {elements.map((element: string) => (
            <div
              className={`w-full flex justify-between items-center content-center p-2 ${
                isActiveChild(element) ? 'bg-[#2B3244]' : ''
              }`}
            >
              <div className="basis-1/5"></div>

              <div className="basis-3/5">
                <button
                  onClick={(): void => {
                    push(`/${url}/${element}`);
                  }}
                  className="text-white"
                >
                  {!collapsed ? element : null}
                </button>
              </div>

              <div className="basis-1/5"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
