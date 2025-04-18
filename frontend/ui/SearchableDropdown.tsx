import { ReactElement, useEffect, useRef, useState } from 'react';

type SearchableDropdownProps = {
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  onClear?: () => void;
  error?: string;
  backgroundColor: string;
  borderColor: string;
  hoverColor: string;
};

export default function SearchableDropdown(
  props: SearchableDropdownProps,
): ReactElement {
  const {
    value,
    options,
    onSelect,
    onClear,
    error,
    backgroundColor,
    borderColor,
    hoverColor,
  } = props;
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const containerInputRef = useRef<HTMLInputElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const filteredOptions = options
    ? options.filter((option) =>
        option.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : [];

  const clearInput = (): void => {
    setSearchTerm('');
    setShowDropdown(false);
    if (onClear) onClear();
  };

  const handleClickOutside = (event: MouseEvent): void => {
    if (
      containerInputRef.current &&
      !containerInputRef.current.contains(event.target as Node)
    ) {
      setShowDropdown(false); // Hide the component
    }
  };

  useEffect(() => {
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setSearchTerm(value);
  }, [value]);

  const handleMouseEnter = (index: number): void => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = (): void => {
    setHoveredIndex(null);
  };

  return (
    <div
      className="relative w-full h-14 rounded-lg border-4"
      style={{
        borderColor: error ? '#FFEB3B' : borderColor,
        background: backgroundColor,
      }}
      ref={containerInputRef}
    >
      <input
        type="text"
        className="px-3 py-2 w-full h-full flex cursor-pointer bg-transparent justify-between items-center content-center gap-2"
        value={searchTerm}
        onChange={(e): void => setSearchTerm(e.target.value)}
        onClick={(): void => setShowDropdown(true)}
      />
      {searchTerm !== '' && (
        <button
          onClick={clearInput}
          className="absolute right-0 top-0 mt-3 px-4 text-center flex justify-center items-center content-center"
        >
          &#x2715; {/* Unicode Multiplication X */}
        </button>
      )}
      {showDropdown && filteredOptions.length > 0 && (
        <div
          className="absolute w-full border max-h-60 overflow-y-auto z-10"
          style={{ backgroundColor: backgroundColor }}
        >
          {filteredOptions.map((option, idx) => (
            <div
              key={idx}
              className="p-2 hover:bg-[#3D4760] cursor-pointer"
              onClick={(): void => {
                onSelect(option);
                setSearchTerm(option);
                setShowDropdown(false);
              }}
              style={{
                backgroundColor:
                  hoveredIndex === idx ? hoverColor : 'transparent',
              }}
              onMouseEnter={(): void => handleMouseEnter(idx)}
              onMouseLeave={handleMouseLeave}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
