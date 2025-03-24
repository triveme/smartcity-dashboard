'use client';
import { ReactElement } from 'react';

import DashboardIcons from '../Icons/DashboardIcon';
import { MapModalWidget, PanelWithContent } from '@/types';
import Link from 'next/link';

type DashboardGeneralInfoMessageProps = {
  panel: PanelWithContent | MapModalWidget;
  url?: string;
  headerPrimaryColor?: string;
  headerFontColor?: string;
};

export default function JumpoffButton(
  props: DashboardGeneralInfoMessageProps,
): ReactElement {
  const { panel, url, headerPrimaryColor, headerFontColor } = props;
  const jumpoffButtonStyle = {
    backgroundColor: headerPrimaryColor || '#2B3244',
    color: headerFontColor || 'FFF',
    fontSize: '1rem',
  };

  return (
    <Link
      href={url && url !== '' ? url : panel.jumpoffUrl || ''}
      target={panel.openJumpoffLinkInNewTab ? '_blank' : '_self'}
      rel="noopener"
    >
      <button
        className="p-4 h-10 w-full rounded-lg flex justify-evenly items-center content-center transition-colors ease-in-out duration-300"
        style={jumpoffButtonStyle}
      >
        {panel.jumpoffIcon && panel.jumpoffIcon !== 'empty' && (
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
          <div className="ml-2 hidden sm:block">{panel.jumpoffLabel}</div>
        </div>
      </button>
    </Link>
  );
}
