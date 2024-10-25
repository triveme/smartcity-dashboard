import React, { useState } from 'react';
import { ReactElement } from 'react';
import DashboardIcons from './Icons/DashboardIcon';
import { fontFamilyEnum } from '@/types';

type FontFamilyDropdownProps = {
  currentValue: string;
  onSelect: (value: string) => void;
  iconColor: string;
  backgroundColor: string;
  hoverColor: string;
};

export default function FontFamilyDropdown({
  currentValue,
  onSelect,
  iconColor,
  backgroundColor,
  hoverColor,
}: FontFamilyDropdownProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const fontOptions = Object.values(fontFamilyEnum);

  const toggleDropdown = (): void => setIsOpen(!isOpen);

  const handleSelect = (value: string): void => {
    onSelect(value);
    setIsOpen(false); // Close dropdown after selection
  };

  const handleMouseEnter = (index: number): void => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = (): void => {
    setHoveredIndex(null);
  };

  return (
    <div className="relative">
      <button
        style={{ backgroundColor }}
        className="w-full text-left py-4 px-4 border rounded flex justify-between items-center"
        onClick={toggleDropdown}
      >
        <span style={{ fontFamily: currentValue, color: iconColor }}>
          {currentValue || 'Select Font Family'}
        </span>
        <span className="ml-2">
          <DashboardIcons iconName="ChevronDown" color={iconColor} />
        </span>
      </button>
      {isOpen && (
        <div
          style={{ backgroundColor }}
          className="absolute top-full mt-2 w-full border rounded shadow-lg z-10"
        >
          {fontOptions.map((fontFamily, index) => (
            <div
              key={fontFamily}
              className="py-2 px-4 cursor-pointer hover:bg-gray-200"
              style={{
                fontFamily,
                color: iconColor,
                backgroundColor:
                  hoveredIndex === index ? hoverColor : 'transparent',
              }}
              onClick={(): void => handleSelect(fontFamily)}
              onMouseEnter={(): void => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
            >
              {fontFamily}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
