import { ReactElement } from 'react';

import Tooltip from '@/ui/Tooltip';

type WizardTooltipIconProps = {
  text: string;
};

export default function WizardTooltipIcon({
  text,
}: WizardTooltipIconProps): ReactElement {
  return (
    <Tooltip text={text}>
      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border text-xs leading-none">
        i
      </span>
    </Tooltip>
  );
}
