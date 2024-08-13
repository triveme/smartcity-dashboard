import { ReactElement, useState } from 'react';

import DashboardIcons from './Icons/DashboardIcon';
import { useQuery } from '@tanstack/react-query';
import { getCorporateInfosWithLogos } from '@/app/actions';

type DropdownSelectionProps = {
  currentValue: string | number;
  selectableValues: string[] | number[];
  onSelect: (value: string | number) => void;
  iconColor: string;
  backgroundColor: string;
  hoverColor: string;
};

export default function DropdownSelection(
  props: DropdownSelectionProps,
): ReactElement {
  const {
    currentValue,
    selectableValues,
    onSelect,
    iconColor,
    backgroundColor,
  } = props;

  const { data } = useQuery({
    queryKey: ['corporate-info'],
    queryFn: () => getCorporateInfosWithLogos(),
    enabled: false,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const toggleDropdown = (): void => setIsOpen(!isOpen);

  const handleSelect = (value: number | string): void => {
    onSelect(value);
    setIsOpen(false);
  };

  const handleMouseEnter = (index: number): void => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = (): void => {
    setHoveredIndex(null);
  };

  return (
    <div
      className="relative p-2 rounded-lg flex"
      style={{ background: backgroundColor }}
    >
      <div
        className="flex cursor-pointer justify-between items-center content-center gap-2"
        onClick={toggleDropdown}
      >
        <div>{currentValue}</div>
        <DashboardIcons iconName="ChevronDown" color={iconColor} />
      </div>

      {isOpen && (
        <div
          className="absolute top-0 right-0 bottom-0 left-0 z-20 border rounded shadow"
          style={{ background: backgroundColor }}
        >
          {selectableValues.map((value, index) => {
            // Determine the border radius based on the index
            let borderRadius = '';
            if (index === 0) {
              borderRadius = '0.5rem 0.5rem 0 0'; // top left and right
            } else if (index === selectableValues.length - 1) {
              borderRadius = '0 0 0.5rem 0.5rem'; // bottom left and right
            }

            return (
              <div
                key={index}
                className="p-2 cursor-pointer"
                style={{
                  backgroundColor:
                    hoveredIndex === index
                      ? data?.headerPrimaryColor
                      : 'transparent',
                  border: `1px solid ${data?.headerPrimaryColor}`,
                  borderRadius,
                }}
                onClick={(): void => handleSelect(value)}
                onMouseEnter={(): void => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                {value}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
