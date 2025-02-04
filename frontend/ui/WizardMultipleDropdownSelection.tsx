import React, { ReactElement, useState, useRef, useEffect } from 'react';
import DashboardIcons from '@/ui/Icons/DashboardIcon';

type WizardMultipleDropdownSelectionProps = {
  currentValue: string[];
  selectableValues: string[] | number[];
  onSelect: (value: string[]) => void;
  error?: string;
  iconColor: string;
  borderColor: string;
  backgroundColor: string;
};

export default function WizardMultipleDropdownSelection(
  props: WizardMultipleDropdownSelectionProps,
): ReactElement {
  const {
    currentValue,
    selectableValues,
    onSelect,
    error,
    iconColor,
    borderColor,
    backgroundColor,
  } = props;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSelect = (value: string): void => {
    const newSelection = currentValue.includes(value)
      ? currentValue.filter((item) => item !== value)
      : [...currentValue, value];
    onSelect(newSelection);
  };

  const handleSelectAll = (): void => {
    if (currentValue.length === selectableValues.length) {
      onSelect([]); // Deselect all
    } else {
      onSelect(selectableValues.map(String)); // Select all
    }
  };

  const renderSelectedValues = (): string => {
    const visibleValues = currentValue.slice(0, 2);
    const remainingCount = currentValue.length - visibleValues.length;

    if (remainingCount > 0) {
      return `${visibleValues.join(', ')} und ${remainingCount} weitere...`;
    }

    return visibleValues.join(', ');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !(dropdownRef.current as HTMLElement).contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div ref={dropdownRef} className="relative">
      <div
        className={`h-14 border-4 rounded-lg flex justify-between items-center px-3 text-lg cursor-pointer`}
        onClick={(): void => setIsOpen(!isOpen)}
        style={{
          borderColor: error ? '#FFEB3B' : borderColor,
          backgroundColor: backgroundColor,
        }}
      >
        <div className="flex-1">
          <span className="block truncate">
            {currentValue.length > 0 ? renderSelectedValues() : 'Auswählen...'}
          </span>
        </div>
        <DashboardIcons iconName="ChevronDown" color={iconColor} />
      </div>
      {isOpen && (
        <div
          className="absolute mt-1 w-full rounded-lg border-4 max-h-60 overflow-auto z-10"
          style={{ backgroundColor: backgroundColor }}
        >
          {/* Select All checkbox */}
          <label className="block text-lg px-3 py-2 font-bold">
            <input
              type="checkbox"
              checked={currentValue.length === selectableValues.length}
              onChange={handleSelectAll}
              className="form-checkbox h-4 w-4 border-0 rounded-md focus:ring-0 bg-[#59647D]"
            />
            <span className="ml-2">
              {currentValue.length === selectableValues.length
                ? 'Alle Abwählen'
                : 'Alle Auswählen'}
            </span>
          </label>
          <hr className="my-2" />

          {/* Individual selectable items */}
          {selectableValues.map((value, index) => (
            <label key={index} className="block text-lg px-3 py-2">
              <input
                type="checkbox"
                checked={currentValue.includes(String(value))}
                onChange={(): void => handleSelect(String(value))}
                className={`form-checkbox h-4 w-4 border-0 rounded-md focus:ring-0 ${
                  currentValue.includes(String(value))
                    ? 'bg-[#59647D]'
                    : 'bg-[#59647D]'
                }`}
              />
              <span className="ml-2">{value}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
