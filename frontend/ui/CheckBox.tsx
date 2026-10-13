import { ReactElement } from 'react';

import WizardTooltipIcon from '@/ui/WizardTooltipIcon';

type CheckBoxProps = {
  label: string;
  value: boolean;
  handleSelectChange: (isSelected: boolean) => void;
  tooltipText?: string;
  type?: 'checkbox' | 'radio';
  name?: string;
};

export default function CheckBox({
  label,
  value,
  handleSelectChange,
  tooltipText,
  type = 'checkbox',
  name,
}: CheckBoxProps): ReactElement {
  const handleTouchStart = (e: React.TouchEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    handleSelectChange(type === 'radio' ? true : !value);
  };

  return (
    <label
      className="flex w-full items-center space-x-2 cursor-pointer select-none h-full"
      role={type}
      aria-checked={value}
      tabIndex={0}
      onKeyDown={(e) =>
        e.key === 'Enter' &&
        handleSelectChange(type === 'radio' ? true : !value)
      }
      onTouchStart={handleTouchStart}
    >
      <input
        type={type}
        name={name}
        checked={value}
        onChange={(e) => handleSelectChange(e.target.checked)}
        className="hidden"
      />
      <div
        className={`w-5 min-w-5 h-5 min-h-5 shrink-0 flex items-center justify-center rounded-md border-2 transition-all ${
          value ? 'border-blue-500 bg-blue-500' : 'border-gray-400 bg-white'
        }`}
      >
        {value && (
          <svg
            className="w-4 h-4 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <span>{label}</span>
      {tooltipText && <WizardTooltipIcon text={tooltipText} />}
    </label>
  );
}
