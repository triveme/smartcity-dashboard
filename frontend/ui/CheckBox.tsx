import { ReactElement } from 'react';

type CheckBoxProps = {
  label: string;
  value: boolean;
  handleSelectChange: (isSelected: boolean) => void;
};

export default function CheckBox(props: CheckBoxProps): ReactElement {
  const { label, value, handleSelectChange } = props;

  const onChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    handleSelectChange(e.target.checked);
  };

  return (
    <div className="flex justify-start items-center">
      <input
        type="checkbox"
        id={'checkbox-label-' + label}
        checked={value}
        onChange={onChange}
        className="mr-2" // Add some margin to separate the checkbox from the label
      />
      <label htmlFor={'checkbox-label-' + label}>{label}</label>
    </div>
  );
}
