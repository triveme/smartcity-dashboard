'use client';
import { ReactElement, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { useAuth } from 'react-oidc-context';
import { env } from 'next-runtime-env';
import { jwtDecode } from 'jwt-decode';

import SidebarItem, { SidebarItemStyle } from './SidebarItem';
import HorizontalDivider from '@/ui/HorizontalDivider';
import { getTenantOfPage } from '@/utils/tenantHelper';

type SidebarContentProps = {
  sidebarItemStyle: SidebarItemStyle;
  useColorTransitionMenu: boolean;
  cornerColor: string;
  cornerFontColor: string;
};

type BackgroundColorStyle =
  | { backgroundImage: string }
  | { backgroundColor: string };

export default function SidebarContent(
  props: SidebarContentProps,
): ReactElement {
  const {
    sidebarItemStyle,
    useColorTransitionMenu,
    cornerColor,
    cornerFontColor,
  } = props;

  const auth = useAuth();
  const [roleOptions, setRoleOptions] = useState<string[]>([]);
  const superAdminRole = env('NEXT_PUBLIC_SUPER_ADMIN_ROLE');

  const tenant = getTenantOfPage();
  const adminUrl = tenant ? `${tenant}/admin` : 'admin';

  const getBgColorForMenu = (): BackgroundColorStyle => {
    return useColorTransitionMenu
      ? {
          backgroundImage: `linear-gradient(to right, ${sidebarItemStyle.menuPrimaryColor}, ${sidebarItemStyle.menuSecondaryColor})`,
        }
      : {
          backgroundColor: sidebarItemStyle.menuPrimaryColor || '#1D2330',
        };
  };

  useEffect(() => {
    if (auth && auth.user && auth.user?.access_token) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const decoded: any = jwtDecode(auth?.user?.access_token);
      const roles = decoded.roles || decoded.realm_access?.roles;
      setRoleOptions(roles);
    }
  }, [auth]);

  return (
    <div
      className={twMerge(
        'sm:flex flex-grow flex-col transition-all ease-in-out duration-300',
      )}
    >
      <div
        style={getBgColorForMenu()}
        className={
          'p-1 flex flex-row justify-start items-center content-center shadow-md h-16'
        }
      >
        <div
          className="h-16 p-3 flex justify-center items-center content-center w-full"
          style={{ color: cornerFontColor, backgroundColor: cornerColor }}
        >
          <p className="mr-auto">Adminbereich</p>
        </div>
      </div>
      <div
        className={twMerge(
          'p-1 flex items-center flex-col justify-around space-y-1',
        )}
      >
        {superAdminRole && roleOptions.includes(superAdminRole) ? (
          <>
            <SidebarItem
              icon="Building"
              label="Allgemein"
              url={`${adminUrl}/general`}
              componentStyle={sidebarItemStyle}
            />
            <SidebarItem
              icon="Building"
              label="Farbgestaltung"
              url={`${adminUrl}/corporateidentity`}
              componentStyle={sidebarItemStyle}
            />
            <SidebarItem
              icon="ChartSimple"
              label="Datenanbindung"
              url={`${adminUrl}/dataplatform`}
              componentStyle={sidebarItemStyle}
            />
            <SidebarItem
              icon="Building"
              label="Mandantenverwaltung"
              url={`${adminUrl}/tenantadministration`}
              componentStyle={sidebarItemStyle}
            />
            <HorizontalDivider />
          </>
        ) : null}
        <SidebarItem
          icon="Gear"
          label="Widgets"
          url={`${adminUrl}/widgets`}
          componentStyle={sidebarItemStyle}
        />
        <SidebarItem
          icon="File"
          label="Dashboardseiten"
          url={`${adminUrl}/pages`}
          componentStyle={sidebarItemStyle}
        />
        <SidebarItem
          icon="Menu"
          label="Menu"
          url={`${adminUrl}/menu`}
          componentStyle={sidebarItemStyle}
        />
        <HorizontalDivider />

        <SidebarItem
          icon="Open"
          label="Anzeigen"
          url={tenant ? `${tenant}` : ''}
          componentStyle={sidebarItemStyle}
        />
      </div>
    </div>
  );
}
