import { ReactElement } from 'react';

import WizardTooltipIcon from '@/ui/WizardTooltipIcon';

type WizardLabeldProps = {
  label: string;
  tooltipText?: string;
};

export default function WizardLabel(props: WizardLabeldProps): ReactElement {
  const { label, tooltipText } = props;

  return (
    <label className="py-2 px-4 border-4 border-transparent">
      <span className="inline-flex items-center gap-2">
        <span>{label}</span>
        {tooltipText && <WizardTooltipIcon text={tooltipText} />}
      </span>
    </label>
  );
}
