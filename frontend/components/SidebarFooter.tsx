'use client';

import { JSX, ReactElement } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';

import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage } from '@/utils/tenantHelper';
import LightDarkToggleButton from '@/ui/Buttons/LightDarkToggleButton';
import Link from 'next/link';
import { getGeneralSettingsByTenant } from '@/api/general-settings-service';

export default function SidebarFooter(): ReactElement {
  const versionNumber = process.env.NEXT_PUBLIC_VERSION;

  // Multi Tenancy
  const tenant = getTenantOfPage();

  const { data, refetch } = useQuery({
    queryKey: ['corporate-info'],
    queryFn: () => getCorporateInfosWithLogos(tenant),
    enabled: true,
  });

  const { data: generalSetting } = useQuery({
    queryKey: ['generalSettings'],
    queryFn: () => getGeneralSettingsByTenant(tenant),
  });

  const handleThemeToggle = (): void => {
    refetch();
    window.location.reload();
  };

  const showMenuLogo = data ? data.showMenuLogo : false;

  const linkStyle = {
    minHeight: '24px',
  };

  const renderLogo = (): JSX.Element | null => {
    const basepath = process.env.NEXT_PUBLIC_BASEPATH;
    if (data?.sidebarLogos && data.sidebarLogos.length > 0) {
      // Sort logos by 'order'
      const sortedLogos = data.sidebarLogos.sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
      );

      return (
        <div className="pb-4">
          {sortedLogos.map((logo, index) => (
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
          src={`${basepath !== '' ? basepath : ''}/smart-region-logo.svg`}
          alt="Default Logo"
          height={0}
          width={0}
          style={{ width: 'auto', height: '56px' }}
        />
      </div>
    );
  };

  return (
    <div className="flex flex-col justify-end items-center flex-grow">
      <div className="flex text-sm px-10 flex-col items-center mb-4">
        {showMenuLogo && renderLogo()}
        <Link
          className={`flex`}
          href={`${generalSetting?.information}`}
          target={'_blank'}
          style={linkStyle}
        >
          <p
            className="underline"
            style={{
              color: data?.menuFontColor,
            }}
          >
            Informationen
          </p>
        </Link>

        <Link
          className={`flex`}
          href={`${generalSetting?.imprint}`}
          target={'_blank'}
          style={linkStyle}
        >
          <p
            className="underline"
            style={{
              color: data?.menuFontColor,
            }}
          >
            Impressum
          </p>
        </Link>
        <Link
          className={`flex`}
          href={`${generalSetting?.privacy}`}
          target={'_blank'}
          style={linkStyle}
        >
          <p
            className="underline"
            style={{
              color: data?.menuFontColor,
            }}
          >
            Datenschutzerklärung
          </p>
        </Link>
        <p
          className="pt-2"
          style={{
            color: data?.menuFontColor,
          }}
        >
          Version: {versionNumber}
        </p>

        {generalSetting?.allowThemeSwitching && (
          <div className="pt-2">
            <LightDarkToggleButton
              onToggle={handleThemeToggle}
              menuFontColor={data?.menuFontColor}
            />
          </div>
        )}
      </div>
    </div>
  );
}
