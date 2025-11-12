import { ReactElement } from 'react';

type WizardSelectBoxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
};

export default function WizardSelectBox(
  props: WizardSelectBoxProps,
): ReactElement {
  const { label, checked, onChange, disabled } = props;

  return (
    <label className="py-2 px-4 border-4 border-transparent">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e): void => onChange(e.target.checked)}
        className="mr-2"
        disabled={disabled}
      />
      {label}
    </label>
  );
}
