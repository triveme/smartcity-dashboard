'use client';

import React from 'react';

type ListViewMapArrowProps = {
  index: number;
  handlePoiClick: (index: number) => void;
  iconColor?: string;
};

export function ListViewMapArrow(
  props: ListViewMapArrowProps,
): React.JSX.Element {
  const { index, handlePoiClick, iconColor = '#374151' } = props;

  return (
    <div className="flex-shrink-0 flex items-center justify-center pl-2">
      <button
        onClick={() => handlePoiClick(index)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
      >
        <span className="text-xl" style={{ color: iconColor }}>
          →
        </span>
      </button>
    </div>
  );
}
