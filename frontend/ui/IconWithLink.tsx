'use client';

import React, { ReactElement, useEffect } from 'react';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import Link from 'next/link';

type IconWithLinkProps = {
  icon?: string;
  iconColor?: string;
  iconText?: string;
  iconUrl: string;
  fontColor?: string;
};

export default function IconWithLink(props: IconWithLinkProps): ReactElement {
  const { icon, iconColor, iconText, iconUrl, fontColor } = props;

  useEffect(() => {
    // Inject the style tag to ensure all elements have the cursor pointer style
    const styleTag = document.createElement('style');
    styleTag.innerHTML = `
      .cursor-pointer, .cursor-pointer * {
        cursor: pointer;
      }
    `;
    document.head.appendChild(styleTag);

    return () => {
      // Cleanup the style tag when the component unmounts
      document.head.removeChild(styleTag);
    };
  }, []);

  return (
    <div>
      <div className="flex justify-center items-center">
        <Link
          href={iconUrl}
          className="flex flex-row justify-center items-center w-fit pl-4 cursor-pointer"
        >
          <DashboardIcons
            iconName={icon || 'ChevronLeft'}
            color={iconColor || 'white'}
            size="xl"
          />
          <div
            style={{ color: fontColor }}
            className={`ql-editor no-border-ql-editor`}
            dangerouslySetInnerHTML={{
              __html: iconText || '',
            }}
          />
        </Link>
      </div>
    </div>
  );
}
