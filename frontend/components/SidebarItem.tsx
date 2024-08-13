'use client';
import { ReactElement, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

import DashboardIcons from '@/ui/Icons/DashboardIcon';

export type SidebarItemStyle = {
  menuPrimaryColor: string;
  menuSecondaryColor: string;
  menuHoverColor: string;
  menuActiveColor: string;
  menuActiveFontColor: string;
  menuFontColor: string;
};

type SidebarItemProps = {
  componentStyle: SidebarItemStyle;
  icon: string;
  label: string;
  url: string;
  target?: string;
};

export default function SidebarItem(props: SidebarItemProps): ReactElement {
  const { componentStyle, url, target, icon, label } = props;
  const params = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const defaultBgColor = '#3D4760';

  const isActiveElement = (): boolean => {
    if (params && params === `/${url}`) {
      return true;
    }
    return false;
  };

  const handleMouseEnter = (): void => {
    setIsHovered(true);
  };

  const handleMouseLeave = (): void => {
    setIsHovered(false);
  };

  const getActiveBackgroundColor = (): string => {
    return isActiveElement() ? componentStyle.menuActiveColor : 'transparent';
  };

  const getFontColor = (): string => {
    return isActiveElement()
      ? componentStyle.menuActiveFontColor
      : componentStyle.menuFontColor;
  };

  const menuStyle = {
    width: '100%',
    padding: '6px',
    cursor: 'pointer',
    borderRadius: '8px',
    backgroundColor: getActiveBackgroundColor(),
    // For hover effect using dynamic color
    ...(isHovered && {
      backgroundColor: componentStyle.menuHoverColor || defaultBgColor,
    }),
    color: getFontColor(),
  };

  return (
    <div
      style={menuStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link
        className={`flex`}
        href={`/${url}`}
        target={target ? target : '_self'}
      >
        <div className="p-1 basis-1/5">
          <DashboardIcons
            iconName={icon}
            color={menuStyle.color || '#FFFFFF'}
          />
        </div>
        <div className="p-1 basis-3/5">{label}</div>
      </Link>
    </div>
  );
}
