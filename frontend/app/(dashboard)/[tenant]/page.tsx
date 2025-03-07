import { CSSProperties, ReactElement } from 'react';
import { redirect } from 'next/navigation';

import {
  getCorporateInfosWithLogos,
  getDashboardUrlByTenantAbbreviation,
  getTenantExists,
} from '@/app/actions';
import { CorporateInfo } from '@/types';

export default async function Page(props: {
  params: Promise<{ tenant: string }>;
}): Promise<ReactElement> {
  const params = await props.params;
  const ciColors: CorporateInfo = await getCorporateInfosWithLogos(
    params.tenant,
  );

  const dashboardStyle: CSSProperties = {
    backgroundColor: ciColors.dashboardPrimaryColor || '#2B3244',
    color: ciColors.dashboardFontColor || '#FFFFFF',
  };

  if (params.tenant) {
    const tenantExists = await getTenantExists(params.tenant);

    //Redirect to first tenant dashboard
    if (tenantExists === true) {
      const redirectUrl = await getDashboardUrlByTenantAbbreviation(
        params.tenant,
      );
      console.log(`redirecting to /${params.tenant}/${redirectUrl}`);
      redirect(`/${params.tenant}/${redirectUrl}`);
    } else {
      return (
        <div className="w-full h-full p-4" style={dashboardStyle}>
          Unbekannter Mandant: {params.tenant}
        </div>
      );
    }
  }
  return <div>Unbekannter Fehler</div>;
}
