import type { Metadata } from 'next';
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { JSX } from 'react';
import Script from 'next/script';

import Header from '@/components/Header';
import ManagementSidebar from '@/components/ManagementSidebar';
import { CorporateInfo } from '@/types';
import { SidebarItemStyle } from '@/components/SidebarItem';
import CorporateIdentityProvider from '@/providers/CorporateIdentityProvider';
import { getCorporateInfosWithLogos } from '@/app/actions';
import LoginProvider from '@/providers/LoginProvider';
import sanitizeCSSInjection from '@/utils/sanitizeHtml';

config.autoAddCss = false;

export const metadata: Metadata = {
  title: 'EDAG Wizard',
  description: 'Create Customizable Dashboards',
};

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}): Promise<JSX.Element> {
  const { children } = props;

  const params = await props.params;
  const tenant = params.tenant || undefined;
  const ciColors: CorporateInfo = await getCorporateInfosWithLogos(tenant);

  // Resolve Cookiebot ID per tenant with env fallback
  let cookiebotId = process.env.NEXT_PUBLIC_COOKIEBOT_ID;
  try {
    if (tenant) {
      console.log('[Cookiebot] Resolving ID for tenant:', tenant);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/general-settings/tenant/${tenant}`,
      );
      if (response.ok) {
        const general = await response.json();
        console.log('[Cookiebot] General settings response received');
        if (general?.cookiebotId) {
          cookiebotId = general.cookiebotId;
          console.log('[Cookiebot] Using DB cookiebotId:', cookiebotId);
        } else {
          console.log(
            '[Cookiebot] No DB cookiebotId found, using env fallback',
          );
        }
      } else {
        console.warn('[Cookiebot] Failed response:', response.status);
      }
    } else {
      console.log('[Cookiebot] No tenant provided, using env fallback');
    }
  } catch (error) {
    console.error('Failed to fetch Cookiebot ID from general settings:', error);
  }

  //Dynamic Styling
  const sidebarItemStyle: SidebarItemStyle = {
    menuPrimaryColor: ciColors.menuPrimaryColor,
    menuSecondaryColor: ciColors.menuSecondaryColor,
    menuHoverColor: ciColors.menuHoverColor,
    menuHoverFontColor: ciColors.menuHoverFontColor,
    menuActiveColor: ciColors.menuActiveColor,
    menuActiveFontColor: ciColors.menuActiveFontColor,
    menuFontColor: ciColors.menuFontColor,
  };

  const fontHtml = sanitizeCSSInjection(ciColors.cssStyleInjectionValue);

  return (
    <>
      <Script
        id="Cookiebot"
        src="https://consent.cookiebot.com/uc.js"
        data-cbid={cookiebotId}
        data-blockingmode="manual"
        type="text/javascript"
      ></Script>
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
      {fontHtml && (
        <div
          style={{ display: 'none' }}
          dangerouslySetInnerHTML={{ __html: fontHtml }}
          suppressHydrationWarning
        />
      )}
      <LoginProvider>
        <CorporateIdentityProvider tenant={tenant}>
          <div className="flex h-screen">
            <ManagementSidebar
              backgroundColor={ciColors.menuPrimaryColor}
              backgroundSecondaryColor={ciColors.menuSecondaryColor}
              useColorTransitionMenu={ciColors.useColorTransitionMenu}
              sidebarItemStyle={sidebarItemStyle}
              cornerColor={ciColors.menuCornerColor}
              cornerFontColor={ciColors.menuCornerFontColor}
            />
            <div className="flex flex-col flex-grow">
              <div className="fixed top-0 left-0 z-5 w-full">
                <Header
                  headerColor={ciColors.headerPrimaryColor}
                  headerSecondaryColor={ciColors.headerSecondaryColor}
                  infoModalBackgroundColor={ciColors.widgetPrimaryColor}
                  infoModalFontColor={ciColors.widgetFontColor}
                  useColorTransitionHeader={ciColors.useColorTransitionHeader}
                  fontColor={ciColors.headerFontColor}
                  showLogo={ciColors.showHeaderLogo}
                  dynamicHeadline="Smart Region Dashboard"
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
