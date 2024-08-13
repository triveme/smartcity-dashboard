import { getCorporateInfosWithLogos } from '@/app/actions';
import DashboardSidebar from '@/components/DashboardSidebar';
import Header from '@/components/Header';
import { CorporateInfo } from '@/types';
import { env } from 'next-runtime-env';

export const dynamic = 'force-dynamic'; // Neeeded to avoid data fetching during build
export const runtime = 'edge';

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
        `}
      </style>
      <div className="flex h-screen">
        <DashboardSidebar
          useColorTransitionMenu={ciColors.useColorTransitionMenu}
          menuPrimaryColor={ciColors.menuPrimaryColor}
          menuSecondaryColor={ciColors.menuSecondaryColor}
          menuFontColor={ciColors.menuFontColor}
        />
        <div className="flex flex-col flex-grow">
          <Header
            isPublic={true}
            headerColor={ciColors.headerPrimaryColor}
            headerSecondaryColor={ciColors.headerSecondaryColor}
            useColorTransitionHeader={ciColors.useColorTransitionHeader}
            fontColor={ciColors.headerFontColor}
            showLogo={ciColors.showHeaderLogo}
          />
          <div className="flex-grow relative overflow-y-auto">{children}</div>
        </div>
      </div>
    </>
  );
}
