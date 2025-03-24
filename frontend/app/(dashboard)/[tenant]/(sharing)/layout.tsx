import { getCorporateInfosWithLogos } from '@/app/actions';
import { env } from 'next-runtime-env';

import { CorporateInfo } from '@/types';
import { JSX } from 'react';

export const dynamic = 'force-dynamic'; // Neeeded to avoid data fetching during build
export const runtime = 'edge';

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}): Promise<JSX.Element> {
  const params = await props.params;

  const { children } = props;

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
