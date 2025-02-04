'use client';

import React, { ReactElement, useEffect } from 'react';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import { SizeProp } from '@fortawesome/fontawesome-svg-core';
import Link from 'next/link';

type IconWithLinkProps = {
  icon?: string;
  iconColor?: string;
  iconSize?: string;
  iconText?: string;
  iconUrl: string;
  fontColor?: string;
  fontSize?: string;
};

const sizeMap: Record<string, SizeProp> = {
  '2xs': '2xs',
  xs: 'xs',
  sm: 'sm',
  lg: 'lg',
  xl: 'xl',
  '2xl': '2xl',
  '1x': '1x',
  '2x': '2x',
  '3x': '3x',
  '4x': '4x',
  '5x': '5x',
  '6x': '6x',
  '7x': '7x',
  '8x': '8x',
  '9x': '9x',
  '10x': '10x',
  small: 'xs',
  medium: 'sm',
  large: 'lg',
};

export default function IconWithLink(props: IconWithLinkProps): ReactElement {
  const { icon, iconColor, iconSize, iconText, iconUrl, fontColor, fontSize } =
    props;
  const mappedIconSize: SizeProp = sizeMap[`${iconSize}` || 'xl'] || 'xl';

  useEffect(() => {
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      .cursor-pointer, .cursor-pointer * {
        cursor: pointer;
      }
    `;
    document.head.appendChild(styleTag);
    return () => {
      document.head.removeChild(styleTag);
    };
  }, []);

  return (
    <div className="w-full">
      <div className="flex items-center">
        <Link
          href={iconUrl}
          className="flex flex-row flex-wrap items-center w-full max-w-full gap-2 pl-2 sm:pl-4 cursor-pointer overflow-hidden"
        >
          {icon && (
            <div className="flex-shrink-0">
              <DashboardIcons
                iconName={icon}
                color={iconColor || 'white'}
                size={mappedIconSize}
              />
            </div>
          )}
          <div
            style={{ color: fontColor, fontSize: fontSize }}
            className="flex-1 min-w-0 ql-editor no-border-ql-editor"
          >
            <div
              className="whitespace-normal overflow-hidden overflow-ellipsis"
              dangerouslySetInnerHTML={{
                __html: iconText || '',
              }}
            />
          </div>
        </Link>
      </div>
    </div>
  );
}
