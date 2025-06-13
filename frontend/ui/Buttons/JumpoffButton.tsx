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
  const hasLabel =
    panel.jumpoffLabel && panel.jumpoffLabel !== '' ? true : false;
  const hasIcon =
    panel.jumpoffIcon && panel.jumpoffIcon !== 'empty' ? true : false;

  return (
    <Link
      href={url && url !== '' ? url : panel.jumpoffUrl || ''}
      target={panel.openJumpoffLinkInNewTab ? '_blank' : '_self'}
      rel="noopener"
    >
      <button
        className={`p-4 h-10 w-full rounded-lg flex ${hasLabel ? 'justify-evenly' : 'justify-center'} items-center content-center transition-colors ease-in-out duration-300`}
        style={jumpoffButtonStyle}
      >
        {panel.jumpoffIcon && panel.jumpoffIcon !== 'empty' && (
          <DashboardIcons
            iconName={panel.jumpoffIcon}
            color={jumpoffButtonStyle.color}
          />
        )}
        {hasLabel && (
          <div
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '11rem',
              marginLeft: hasIcon ? '0.5rem' : '',
              color: jumpoffButtonStyle.color,
            }}
          >
            <div className="ml-2">{panel.jumpoffLabel}</div>
          </div>
        )}
      </button>
    </Link>
  );
}
