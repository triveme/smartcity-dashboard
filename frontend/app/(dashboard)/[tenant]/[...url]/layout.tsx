import { JSX } from 'react';

import { getMenuGroupingElementByUrl } from '@/api/menu-service';
import { getCorporateInfosWithLogos } from '@/app/actions';
import DashboardSidebar from '@/components/DashboardSidebar';
import Header from '@/components/Header';
import { CorporateInfo } from '@/types';
import sanitizeCSSInjection from '@/utils/sanitizeHtml';

export const dynamic = 'force-dynamic'; // Neeeded to avoid data fetching during build
export const runtime = 'edge';

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ tenant: string; url: string[] }>;
}): Promise<JSX.Element> {
  const { children } = props;

  const params = await props.params;
  const tenant = params.tenant || undefined;
  const ciColors: CorporateInfo = await getCorporateInfosWithLogos(tenant);

  let dynamicHeadline = '';
  if (params && params.url && params.url.length > 0) {
    const dynamicUrl = params.url[0];
    const groupingElement = await getMenuGroupingElementByUrl(
      dynamicUrl,
      tenant || '',
    );
    if (groupingElement && groupingElement.name) {
      dynamicHeadline = groupingElement.name;
    } else {
      dynamicHeadline = 'Smart Region Dashboard';
    }
  }

  const fontHtml = sanitizeCSSInjection(ciColors.cssStyleInjectionValue);

  return (
    <div className="w-full h-full overflow-x-hidden">
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
            background-color: ${ciColors.dashboardPrimaryColor};
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
      <div className="flex h-full w-full">
        <div className="fixed top-0 left-0 bottom-0 z-30">
          <DashboardSidebar
            menuPrimaryColor={ciColors.menuPrimaryColor}
            menuFontColor={ciColors.menuFontColor}
            menuCornerColor={ciColors.menuCornerColor}
            menuCornerFontColor={ciColors.menuCornerFontColor}
            menuArrowDirection={ciColors.menuArrowDirection}
          />
        </div>
        <div className="flex flex-col flex-grow ml-0 lg:ml-64 h-full w-full">
          <div className="fixed top-0 left-0 right-0 z-40">
            <Header
              isPublic={true}
              headerColor={ciColors.headerPrimaryColor}
              headerSecondaryColor={ciColors.headerSecondaryColor}
              infoModalBackgroundColor={ciColors.widgetPrimaryColor}
              infoModalFontColor={ciColors.widgetFontColor}
              useColorTransitionHeader={ciColors.useColorTransitionHeader}
              fontColor={ciColors.headerFontColor}
              showLogo={ciColors.showHeaderLogo}
              dynamicHeadline={dynamicHeadline}
              informationTextFontColor={ciColors.informationTextFontColor}
              informationTextFontSize={ciColors.informationTextFontSize}
            />
          </div>
          <div className="flex-grow relative overflow-y-auto pt-16 h-full w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
