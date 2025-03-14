import { ReactElement } from 'react';

type CheckBoxProps = {
  label: string;
  value: boolean;
  handleSelectChange: (isSelected: boolean) => void;
};

export default function CheckBox({
  label,
  value,
  handleSelectChange,
}: CheckBoxProps): ReactElement {
  const handleTouchStart = (e: React.TouchEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    handleSelectChange(!value);
  };

  return (
    <label
      className="flex items-center space-x-2 cursor-pointer select-none w-fit h-full"
      role="checkbox"
      aria-checked={value}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleSelectChange(!value)}
      onTouchStart={handleTouchStart}
    >
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => handleSelectChange(e.target.checked)}
        className="hidden"
      />
      <div
        className={`w-5 h-5 flex items-center justify-center rounded-md border-2 transition-all ${
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
    </label>
  );
}
