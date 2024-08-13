import { ReactElement } from 'react';

type WizardLabeldProps = {
  label: string;
};

export default function WizardLabel(props: WizardLabeldProps): ReactElement {
  const { label } = props;

  return (
    <label className="py-2 px-4 border-4 border-transparent">{label}</label>
  );
}
