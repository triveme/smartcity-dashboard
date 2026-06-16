import { ReactElement } from 'react';

import WizardTooltipIcon from '@/ui/WizardTooltipIcon';

type WizardSelectBoxProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  tooltipText?: string;
};

export default function WizardSelectBox(
  props: WizardSelectBoxProps,
): ReactElement {
  const { label, checked, onChange, disabled, tooltipText } = props;

  return (
    <label className="inline-flex items-center gap-2 py-2 px-4 border-4 border-transparent">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e): void => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span>{label}</span>
      {tooltipText && <WizardTooltipIcon text={tooltipText} />}
    </label>
  );
}
