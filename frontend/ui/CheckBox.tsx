import { ReactElement } from 'react';

type CheckBoxProps = {
  label: string;
  value: boolean;
  handleSelectChange: (isSelected: boolean) => void;
};

export default function CheckBox(props: CheckBoxProps): ReactElement {
  const { label, value, handleSelectChange } = props;

  return (
    <div
      className="flex items-center justify-center min-h-[44px] py-2 px-1 cursor-pointer"
      role="checkbox"
      aria-checked={value}
      tabIndex={0}
      onTouchStart={(e) => {
        console.log('touchstart', e);
        handleSelectChange(!value);
      }}
      onClick={() => handleSelectChange(!value)}
    >
      <input
        type="checkbox"
        className="mr-2"
        id={'checkbox-label-' + label}
        checked={value}
        onChange={(e): void => handleSelectChange(e.target.checked)}
      />
      <label htmlFor={'checkbox-label-' + label}>{label}</label>
    </div>
  );
}
