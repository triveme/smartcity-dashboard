'use client';
import { ReactElement } from 'react';

import DashboardIcons from '../Icons/DashboardIcon';
import { useQuery } from '@tanstack/react-query';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage } from '@/utils/tenantHelper';
import Link from 'next/link';

type RedirectPageButtonProps = {
  url: string;
  isShortStyle?: boolean;
};

export default function RedirectPageButton(
  props: RedirectPageButtonProps,
): ReactElement {
  const { url, isShortStyle = false } = props;
  const tenant = getTenantOfPage();

  const { data } = useQuery({
    queryKey: ['corporate-info'],
    queryFn: () => getCorporateInfosWithLogos(tenant),
    enabled: false,
  });

  const jumpoffButtonStyle = {
    backgroundColor: data?.headerPrimaryColor || '#3D4760',
    color: data?.headerFontColor || '#FFF',
    fontSize: '1rem',
  };

  return (
    <Link href={url} passHref target={!isShortStyle ? '_self' : '_blank'}>
      <button
        className="p-4 h-10 w-full rounded-lg flex justify-evenly items-center content-center transition-colors ease-in-out duration-300"
        style={jumpoffButtonStyle}
      >
        <DashboardIcons iconName="Pen" color={jumpoffButtonStyle.color} />
        {!isShortStyle ? (
          <div className="pl-2">Dashboard Bearbeiten</div>
        ) : null}
      </button>
    </Link>
  );
}
