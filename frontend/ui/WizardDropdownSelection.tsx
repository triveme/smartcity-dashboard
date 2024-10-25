import { ReactElement } from 'react';
import DashboardIcons from '@/ui/Icons/DashboardIcon';

type WizardDropdownSelectionProps = {
  currentValue: string | number;
  selectableValues: string[] | number[];
  onSelect: (value: string | number) => void;
  error?: string;
  iconColor: string;
  borderColor: string;
  backgroundColor: string;
};

export default function WizardDropdownSelection(
  props: WizardDropdownSelectionProps,
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

  const handleSelect = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    onSelect(event.target.value);
  };

  return (
    <div
      className={`relative h-14 border-4 rounded-lg w-full`}
      style={{
        borderColor: error ? '#FFEB3B' : borderColor,
        background: backgroundColor,
      }}
    >
      <select
        className="px-3 text-base bg-inherit h-full w-full appearance-none cursor-pointer"
        value={currentValue}
        onChange={handleSelect}
      >
        {selectableValues.map((value, index) => (
          <option
            key={index}
            className="text-base"
            value={value}
            style={{
              background: backgroundColor,
            }}
          >
            {value}
          </option>
        ))}
      </select>
      <div style={{ pointerEvents: 'none' }}>
        <DashboardIcons
          iconName="ChevronDown"
          color={iconColor}
          className="absolute inset-y-0 right-0 m-auto flex items-center pr-3"
        />
      </div>
    </div>
  );
}
