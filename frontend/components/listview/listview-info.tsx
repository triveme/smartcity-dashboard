'use client';

import { InterestingPlace } from '@/types/dataModels';
import React from 'react';

type ListViewInfoProps = {
  info: InterestingPlace;
  poiBackgroundColor?: string;
  titleColor?: string;
  descriptionColor?: string;
  iconColor?: string;
  titleFontSize?: string;
  titleFontWeight?: string;
  descriptionFontSize?: string;
  showAddress?: boolean;
  showCategory?: boolean;
};

export function ListViewInfo(props: ListViewInfoProps): React.JSX.Element {
  const {
    info,
    titleColor = '#FCD34D',
    descriptionColor = '#6B7280',
    iconColor = '#374151',
    titleFontSize = '18px',
    titleFontWeight = '700',
    descriptionFontSize = '14px',
    showAddress = true,
    showCategory = true,
  } = props;

  const matchesDesktop =
    typeof window !== 'undefined' && window.innerWidth >= 768;

  return (
    <div className="h-full flex flex-col flex-1 min-w-0 justify-between px-2">
      {/* Textinfo */}
      <div className="h-full flex flex-col items-start justify-around">
        <div className="w-full">
          <h3
            className="font-bold truncate"
            style={{
              color: titleColor,
              fontSize: titleFontSize,
              fontWeight: titleFontWeight,
            }}
          >
            {info.name}
          </h3>
          {showCategory && (
            <p className="truncate" style={{ fontSize: descriptionFontSize }}>
              {info.types
                ? info.types.map((type: string) => {
                    return type.toString() + ' ';
                  })
                : null}
            </p>
          )}
        </div>
        {matchesDesktop && showAddress ? (
          <div className="flex flex-row items-center w-full">
            <span className="mr-2 flex-shrink-0" style={{ color: iconColor }}>
              📍
            </span>
            <div className="flex-1 min-w-0">
              <p
                className="truncate"
                style={{
                  color: descriptionColor,
                  fontSize: descriptionFontSize,
                }}
              >
                {info.address}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
