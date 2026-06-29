'use client';

import { ReactElement, useState } from 'react';
import FilterButton from '../../Buttons/FilterButton';
import DashboardIcon from '../../Icons/DashboardIcon';

type LineChartFilterControlsProps = {
  attributes: string[];
  selectedAttribute: string;
  onSelect: (attribute: string) => void;
  filterColor?: string;
  filterTextColor?: string;
};

export default function LineChartFilterControls(
  props: LineChartFilterControlsProps,
): ReactElement {
  const {
    attributes,
    selectedAttribute,
    onSelect,
    filterColor = '#F1B434',
    filterTextColor = '#FFFFFF',
  } = props;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <>
      <div className="relative mb-4 w-full px-3 sm:hidden">
        <button
          className="flex w-full items-center justify-between rounded-lg border-2 bg-transparent p-2"
          onClick={() => setIsDropdownOpen((currentState) => !currentState)}
          style={{
            borderColor: filterColor,
            color: filterColor,
          }}
        >
          <span className="truncate">
            {selectedAttribute || 'Select filter'}
          </span>
          <DashboardIcon iconName="ChevronDown" color={filterColor} />
        </button>
        {isDropdownOpen && (
          <div
            className="absolute left-3 right-3 z-10 mt-1 rounded-lg shadow-lg"
            style={{
              backgroundColor: filterColor,
              borderColor: filterColor,
            }}
          >
            {attributes.map((attribute) => (
              <button
                className="w-full p-2 text-left hover:opacity-75"
                key={`dropdown-${attribute}`}
                onClick={() => {
                  onSelect(attribute);
                  setIsDropdownOpen(false);
                }}
                style={{
                  borderBottom: `1px solid ${filterTextColor}25`,
                  color: filterTextColor,
                }}
              >
                {attribute}
              </button>
            ))}
          </div>
        )}
      </div>
      <FilterButton
        attributes={attributes}
        clickedAttribute={selectedAttribute}
        filterColor={filterColor}
        filterTextColor={filterTextColor}
        onClick={onSelect}
      />
    </>
  );
}
