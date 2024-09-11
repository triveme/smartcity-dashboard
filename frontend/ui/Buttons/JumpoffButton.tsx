'use client';
import { ReactElement } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import DashboardIcons from '../Icons/DashboardIcon';
import { useQuery } from '@tanstack/react-query';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { PanelWithContent } from '@/types';
import { getTenantOfPage } from '@/utils/tenantHelper';

type DashboardGeneralInfoMessageProps = {
  panel: PanelWithContent;
};

export default function JumpoffButton(
  props: DashboardGeneralInfoMessageProps,
): ReactElement {
  const { panel } = props;
  const pathname = usePathname();
  const { push } = useRouter();
  const tenant = getTenantOfPage();

  const handleJumpoffButtonClick = (): void => {
    const fullJumpoffUrl = getFullJumpoffUrl(pathname, panel.jumpoffUrl || '');
    push(fullJumpoffUrl);
  };

  function getFullJumpoffUrl(originalUrl: string, newSegment: string): string {
    // Remove trailing slash from originalUrl if present
    const baseUrl = originalUrl.replace(/\/$/, '');

    // Find the tenant in the URL
    const tenantIndex = baseUrl.indexOf(`/${tenant}`);

    // if tenant not found in the URL
    if (tenantIndex === -1) {
      return originalUrl;
    }

    // Get the part of the URL up to and including the tenant
    const urlUpToTenant = baseUrl.slice(0, tenantIndex + tenant!.length + 1);

    // Remove leading slash from newSegment if present
    const cleanedSegment = newSegment.replace(/^\//, '');

    // Combine the URL parts
    return `${urlUpToTenant}/${cleanedSegment}`;
  }

  const { data } = useQuery({
    queryKey: ['corporate-info'],
    queryFn: () => getCorporateInfosWithLogos(tenant),
    enabled: false,
  });

  const jumpoffButtonStyle = {
    backgroundColor: data?.headerPrimaryColor || '#2B3244',
    color: data?.headerFontColor || 'FFF',
    fontSize: '1rem',
  };

  return (
    <div>
      <button
        className="p-4 h-10 w-48 rounded-lg flex justify-evenly items-center content-center transition-colors ease-in-out duration-300"
        onClick={handleJumpoffButtonClick}
        style={jumpoffButtonStyle}
      >
        {panel.jumpoffIcon && (
          <DashboardIcons
            iconName={panel.jumpoffIcon}
            color={jumpoffButtonStyle.color}
          />
        )}
        <div
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '11rem',
            marginLeft: panel.jumpoffIcon ? '0.5rem' : '',
          }}
        >
          {panel.jumpoffLabel}
        </div>
      </button>
    </div>
  );
}
