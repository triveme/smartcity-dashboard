import { useState, ReactElement, useEffect, useRef } from 'react';
import DashboardIcons, { AvailableIcons } from './DashboardIcon';

type IconSelectionProps = {
  activeIcon: string;
  handleIconSelect: (icon: string) => void;
  iconColor: string;
  borderColor: string;
};

export default function IconSelection(props: IconSelectionProps): ReactElement {
  const { activeIcon, handleIconSelect, iconColor, borderColor } = props;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = (): void => setIsOpen(!isOpen);

  const selectIcon = (icon: string): void => {
    setIsOpen(false);
    handleIconSelect(icon);
  };

  const handleClickOutside = (event: MouseEvent): void => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      className="w-full h-full border-4 rounded-lg"
      ref={dropdownRef}
      style={{ borderColor: borderColor }}
    >
      <button onClick={toggleDropdown} className="p-2 rounded w-full h-full">
        <DashboardIcons iconName={activeIcon} color={iconColor} />
      </button>

      {isOpen && (
        <div className="relative">
          <div className="absolute z-50 border-2 rounded p-2 grid grid-cols-5 gap-2 w-full bg-[#2B3244]">
            {AvailableIcons.map((icon: string, index: number) => (
              <button
                key={'icons-' + index}
                className="p-1 hover:bg-[#3D4760] rounded-lg"
                onClick={(): void => selectIcon(icon)}
              >
                <DashboardIcons iconName={icon} color={iconColor} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
