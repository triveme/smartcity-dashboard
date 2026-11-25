import { ReactElement, useEffect, useRef, useState } from 'react';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import searchSensorsByQuery from '@/utils/searchSensorsByQuery';

type WizardDropdownSelectionProps = {
  currentValue: string | number;
  selectableValues: string[] | number[];
  onSelect: (value: string | number) => void;
  disabled?: boolean;
  error?: string;
  iconColor: string;
  borderColor: string;
  backgroundColor: string;
  searchable?: boolean;
};

export default function WizardDropdownSelection(
  props: WizardDropdownSelectionProps,
): ReactElement {
  const {
    currentValue,
    selectableValues,
    onSelect,
    disabled = false,
    error,
    iconColor,
    borderColor,
    backgroundColor,
    searchable = false,
  } = props;

  const [filterValue, setFilterValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredValues = true
    ? searchSensorsByQuery(selectableValues, filterValue)
    : selectableValues;

  const closeDropdown = (): void => {
    setIsOpen(false);
    setHoveredIndex(null);
    setFilterValue('');
  };

  // close on click outside / Escape, focus the search input when opened
  useEffect(() => {
    if (!isOpen) return;
    searchInputRef.current?.focus();

    const handleMouseDown = (event: MouseEvent): void => {
      if (!containerRef.current?.contains(event.target as Node)) {
        closeDropdown();
      }
    };
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') closeDropdown();
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    onSelect(event.target.value);
  };

  return (
    <div ref={containerRef} className="flex flex-row w-full">
      <div
        className={`relative h-14 border-4 rounded-lg flex-1 min-w-0 ${
          disabled ? 'opacity-50' : ''
        }`}
        style={{
          borderColor: error ? '#FFEB3B' : borderColor,
          background: backgroundColor,
          color: iconColor,
        }}
      >
        {searchable ? (
          <>
            <button
              type="button"
              className="pl-3 pr-10 text-base text-left bg-inherit h-full w-full cursor-pointer truncate"
              style={{ color: iconColor }}
              disabled={disabled}
              aria-haspopup="listbox"
              aria-expanded={isOpen}
              onClick={() => (isOpen ? closeDropdown() : setIsOpen(true))}
            >
              {currentValue}
            </button>
            {isOpen && (
              <ul
                role="listbox"
                className="absolute left-0 top-full z-50 w-full max-h-60 overflow-y-auto border shadow-lg"
                style={{ borderColor, background: backgroundColor }}
              >
                {filteredValues.map((value, index) => {
                  // same look as the options of a native select
                  const isHighlighted =
                    hoveredIndex === index ||
                    (hoveredIndex === null && value === currentValue);
                  return (
                    <li
                      key={index}
                      role="option"
                      aria-selected={value === currentValue}
                      className="px-3 py-0.5 min-h-6 text-base cursor-pointer"
                      style={{
                        background: isHighlighted
                          ? 'Highlight'
                          : backgroundColor,
                        color: isHighlighted ? 'HighlightText' : iconColor,
                      }}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                      onClick={() => {
                        onSelect(value);
                        closeDropdown();
                      }}
                    >
                      {value}
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        ) : (
          <select
            style={{ color: iconColor }}
            className="px-3 text-base bg-inherit h-full w-full appearance-none cursor-pointer"
            value={currentValue}
            onChange={handleSelect}
            disabled={disabled}
          >
            {filteredValues.map((value, index) => (
              <option
                key={index}
                className="text-base"
                value={value}
                style={{
                  background: backgroundColor,
                  color: iconColor,
                }}
              >
                {value}
              </option>
            ))}
          </select>
        )}
        <div style={{ pointerEvents: 'none' }}>
          <DashboardIcons
            iconName="ChevronDown"
            color={iconColor}
            className="absolute inset-y-0 right-0 m-auto flex items-center pr-3"
          />
        </div>
      </div>
      {searchable && (
        <input
          ref={searchInputRef}
          type="text"
          className={`px-3 ml-2 h-14 border-4 rounded-lg w-1/4 shrink-0 min-w-0 ${
            isOpen ? '' : 'opacity-50'
          }`}
          value={filterValue}
          placeholder="Suchen"
          disabled={disabled || !isOpen}
          onChange={(e) => setFilterValue(e.target.value)}
          style={{ borderColor, backgroundColor, color: iconColor }}
        />
      )}
    </div>
  );
}
