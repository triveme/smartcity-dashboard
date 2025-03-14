import React, { useState, ReactElement, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { AvailableIcons } from './FontAwesomeIcons';
import DashboardIcons from './DashboardIcon';
import LocalSvgIcons, { localSvgIconsList } from './LocalSvgIcons';

type IconType = 'fontawesome' | 'svg';

type IconOption = {
  name: string;
  type: IconType;
};

const allIcons: IconOption[] = [
  ...AvailableIcons.map((name) => ({
    name,
    type: 'fontawesome' as const,
  })),
  ...localSvgIconsList,
];

type IconSelectionProps = {
  activeIcon: string;
  handleIconSelect: (icon: string) => void;
  iconColor: string;
  borderColor: string;
};

export default function IconSelection(props: IconSelectionProps): ReactElement {
  const { activeIcon, handleIconSelect, iconColor, borderColor } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const toggleDropdown = (): void => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  };

  const selectIcon = (icon: IconOption): void => {
    handleIconSelect(icon.name);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleClickOutside = (event: MouseEvent): void => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredIcons = allIcons.filter((icon) =>
    icon.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const renderIcon = (iconOption: IconOption): ReactElement => {
    if (iconOption.type === 'fontawesome') {
      return (
        <DashboardIcons
          iconName={iconOption.name}
          color={iconColor}
          size="lg"
        />
      );
    } else {
      const svgIcon = iconOption.name;
      return (
        <LocalSvgIcons iconName={svgIcon} fontColor={iconColor} height="24px" />
      );
    }
  };

  const activeIconOption =
    allIcons.find((icon) => icon.name === activeIcon) || allIcons[0];

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        className={`flex h-14 items-center border-4 rounded-lg px-3 cursor-pointer`}
        style={{ borderColor: borderColor }}
        onClick={toggleDropdown}
      >
        <div className="mx-auto">{renderIcon(activeIconOption)}</div>
        {(!activeIcon || activeIcon === 'empty') && (
          <input
            ref={inputRef}
            type="text"
            placeholder="Iconsuche..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow bg-transparent outline-none cursor-pointer ml-2"
            onClick={(e) => {
              e.stopPropagation();
              toggleDropdown();
            }}
            readOnly={!isOpen}
          />
        )}
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          color={iconColor}
        />
      </div>
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 border-2 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          style={{ backgroundColor: borderColor }}
        >
          <div className="grid grid-cols-6 justify-items-center gap-2 p-2">
            {filteredIcons.length > 0 ? (
              filteredIcons.map((iconOption) => (
                <button
                  key={iconOption.name}
                  className="flex items-center justify-center w-9 h-9 p-2 hover:bg-[#3D4760] rounded-lg transition-colors"
                  onClick={() => selectIcon(iconOption)}
                  title={iconOption.name}
                >
                  {renderIcon(iconOption)}
                </button>
              ))
            ) : (
              <div className="col-span-6 text-center p-2 text-gray-400">
                Keine Symbole gefunden
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
