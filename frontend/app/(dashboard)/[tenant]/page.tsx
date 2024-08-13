import { CSSProperties, ReactElement } from 'react';
import { redirect } from 'next/navigation';
import { env } from 'next-runtime-env';

import {
  getCorporateInfosWithLogos,
  getDashboardUrlByTenantAbbreviation,
  getFirstDashboardUrl,
  getTenantExists,
} from '@/app/actions';
import { CorporateInfo } from '@/types';

export default async function Page({
  params,
}: {
  params: { tenant: string };
}): Promise<ReactElement> {
  const NEXT_PUBLIC_MULTI_TENANCY = env('NEXT_PUBLIC_MULTI_TENANCY');

  const ciColors: CorporateInfo = await getCorporateInfosWithLogos(
    params.tenant,
  );
  //Dynamic Styling
  const dashboardStyle: CSSProperties = {
    backgroundColor: ciColors.dashboardPrimaryColor || '#2B3244',
    color: ciColors.dashboardFontColor || '#FFFFFF',
  };

  if (NEXT_PUBLIC_MULTI_TENANCY === 'true') {
    const tenantExists = await getTenantExists(params.tenant);

    //Redirect to first tenant dashboard
    if (tenantExists === true) {
      const redirectUrl = await getDashboardUrlByTenantAbbreviation(
        params.tenant,
      );
      redirect(`/${params.tenant}/${redirectUrl}`);
    } else {
      return (
        <div className="w-full h-full p-4" style={dashboardStyle}>
          Unbekannter Mandant: {params.tenant}
        </div>
      );
    }
  } else {
    //Redirect to any dashboard
    const redirectUrl = await getFirstDashboardUrl();
    redirect(`/${redirectUrl}`);
  }
}
