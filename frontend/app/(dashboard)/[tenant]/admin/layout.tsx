import type { Metadata } from 'next';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';

import Header from '@/components/Header';
import ManagementSidebar from '@/components/ManagementSidebar';
import { CorporateInfo } from '@/types';
import { env } from 'next-runtime-env';
import { SidebarItemStyle } from '@/components/SidebarItem';
import CorporateIdentityProvider from '@/providers/CorporateIdentityProvider';
import { getCorporateInfosWithLogos } from '@/app/actions';
import LoginProvider from '@/providers/LoginProvider';
// import { useAuth } from 'react-oidc-context';
config.autoAddCss = false;

export const metadata: Metadata = {
  title: 'EDAG Wizard',
  description: 'Create Customizable Dashboards',
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { tenant: string };
}): Promise<JSX.Element> {
  const NEXT_PUBLIC_MULTI_TENANCY = env('NEXT_PUBLIC_MULTI_TENANCY');
  const tenant =
    NEXT_PUBLIC_MULTI_TENANCY === 'true' ? params.tenant : undefined;

  const ciColors: CorporateInfo = await getCorporateInfosWithLogos(tenant);

  //Dynamic Styling
  const sidebarItemStyle: SidebarItemStyle = {
    menuPrimaryColor: ciColors.menuPrimaryColor,
    menuSecondaryColor: ciColors.menuSecondaryColor,
    menuHoverColor: ciColors.menuHoverColor,
    menuActiveColor: ciColors.menuActiveColor,
    menuActiveFontColor: ciColors.menuActiveFontColor,
    menuFontColor: ciColors.menuFontColor,
  };

  return (
    <>
      <style>
        {/* dynamic scrollbar colors */}
        {`
          ::-webkit-scrollbar-track {
            background: ${ciColors.scrollbarBackground};
          }
          ::-webkit-scrollbar-thumb,
          ::-webkit-scrollbar-thumb:hover {
            background: ${ciColors.scrollbarColor};
          }
                      body {
            font-family: ${ciColors.fontFamily}, sans-serif;
          }
        `}
      </style>
      <LoginProvider>
        <CorporateIdentityProvider tenant={tenant}>
          <div className="flex h-screen">
            <ManagementSidebar
              backgroundColor={ciColors.menuPrimaryColor}
              backgroundSecondaryColor={ciColors.menuSecondaryColor}
              useColorTransitionMenu={ciColors.useColorTransitionMenu}
              sidebarItemStyle={sidebarItemStyle}
            />
            <div className="flex flex-col flex-grow">
              <div className="fixed top-0 left-0 z-5 w-full">
                <Header
                  headerColor={ciColors.headerPrimaryColor}
                  headerSecondaryColor={ciColors.headerSecondaryColor}
                  useColorTransitionHeader={ciColors.useColorTransitionHeader}
                  fontColor={ciColors.headerFontColor}
                  showLogo={ciColors.showHeaderLogo}
                />
              </div>
              <div className="flex-grow relative mt-16">{children}</div>
            </div>
          </div>
        </CorporateIdentityProvider>
      </LoginProvider>
    </>
  );
}
