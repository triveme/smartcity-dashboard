'use client';

import React from 'react';

type ListViewMapArrowProps = {
  // index: number;
  // handlePoiClick: (index: number) => void;
  iconColor?: string;
};

export function ListViewMapArrow(
  props: ListViewMapArrowProps,
): React.JSX.Element {
  const { iconColor = '#374151' } = props;

  return (
    <div className="flex-shrink-0 flex items-center justify-center pl-2">
      {/* <button
        onClick={() => handlePoiClick(index)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
      > */}
      {/* <span className="text-xl" style={{ color: iconColor }}> */}
      <svg
        width="11"
        height="19"
        viewBox="0 0 11 19"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M7.7129 9.5L0.362903 2.15C0.112903 1.9 -0.00793011 1.60417 0.000403226 1.2625C0.00873656 0.920833 0.137903 0.625 0.387903 0.375C0.637903 0.125 0.933737 0 1.2754 0C1.61707 0 1.9129 0.125 2.1629 0.375L9.8379 8.075C10.0379 8.275 10.1879 8.5 10.2879 8.75C10.3879 9 10.4379 9.25 10.4379 9.5C10.4379 9.75 10.3879 10 10.2879 10.25C10.1879 10.5 10.0379 10.725 9.8379 10.925L2.1379 18.625C1.8879 18.875 1.59624 18.9958 1.2629 18.9875C0.92957 18.9792 0.637903 18.85 0.387903 18.6C0.137903 18.35 0.0129032 18.0542 0.0129032 17.7125C0.0129032 17.3708 0.137903 17.075 0.387903 16.825L7.7129 9.5Z"
          fill={iconColor}
        />
      </svg>
      {/* </span> */}
      {/* </button> */}
    </div>
  );
}
