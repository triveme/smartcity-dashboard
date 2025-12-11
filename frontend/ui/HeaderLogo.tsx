import Image from 'next/image';
import { ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage } from '@/utils/tenantHelper';

export default function HeaderLogo(): ReactElement {
  const tenant = getTenantOfPage();
  const { data } = useQuery({
    queryKey: ['corporate-info'],
    queryFn: () => getCorporateInfosWithLogos(tenant),
    enabled: false,
  });

  const getLogoSrc = (): string => {
    const basepath = process.env.NEXT_PUBLIC_BASEPATH;
    const logoUrl = data?.headerLogo?.logo;

    if (logoUrl) {
      return logoUrl;
    } else {
      return `${basepath !== '' ? basepath : ''}/smart-region-logo.svg`;
    }
  };

  return (
    <Image
      src={getLogoSrc()}
      height={0}
      width={0}
      style={{ width: 'auto', height: '32px' }}
      alt="Dashboard Logo"
    />
  );
}
