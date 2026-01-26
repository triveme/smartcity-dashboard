import { JSX } from 'react';
import Script from 'next/script';

import { getCorporateInfosWithLogos } from '@/app/actions';
import { CorporateInfo } from '@/types';

export const dynamic = 'force-dynamic'; // Neeeded to avoid data fetching during build
export const runtime = 'edge';

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}): Promise<JSX.Element> {
  const params = await props.params;

  const { children } = props;
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
        `}
      </style>
      <div className="flex h-screen">
        <div className="flex flex-col flex-grow">
          <div
            className="p-4 flex-grow relative overflow-y-auto"
            style={{ backgroundColor: ciColors.dashboardPrimaryColor }}
          >
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
