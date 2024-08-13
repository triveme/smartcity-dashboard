'use client';

import { ReactElement } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';

import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage } from '@/utils/tenantHelper';

export default function SidebarFooter(): ReactElement {
  const versionNumber = process.env.NEXT_PUBLIC_VERSION;

  // Multi Tenancy
  const tenant = getTenantOfPage();

  const { data } = useQuery({
    queryKey: ['corporate-info'],
    queryFn: () => getCorporateInfosWithLogos(tenant),
    enabled: true,
  });

  const showMenuLogo = data ? data.showMenuLogo : false;

  const renderLogo = (): JSX.Element | null => {
    if (data?.sidebarLogos && data.sidebarLogos.length > 0) {
      return (
        <div className="pb-4">
          {data.sidebarLogos.map((logo, index) => (
            <Image
              key={index}
              src={logo.logo}
              alt={logo.logoName}
              height={logo.logoHeight}
              width={logo.logoWidth}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="pb-4">
        <Image
          src={`${
            process.env.NEXT_PUBLIC_BASEPATH !== ''
              ? process.env.NEXT_PUBLIC_BASEPATH
              : ''
          }/smart-region-logo.svg`}
          alt="Default Logo"
          height={0}
          width={0}
          style={{ width: 'auto', height: '64px' }}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col justify-end items-center flex-grow">
      <div className="flex text-sm p-1 flex-col items-center text-gray-100 mb-4">
        {showMenuLogo && renderLogo()}
        <p className="underline">Informationen</p>
        <p className="underline">Impressum</p>
        <p className="underline">Datenschutzerklärung</p>
        <p className="pt-2">Version: {versionNumber}</p>
      </div>
    </div>
  );
}
