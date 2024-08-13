import { ReactElement } from 'react';
import DashboardIcons from './Icons/DashboardIcon';

type UrlTextfieldProps = {
  value: string | number;
  onChange: (value: string | number) => void;
  componentType?: string;
  error?: string;
  iconColor: string;
  borderColor: string;
};
export default function WizardUrlTextfield(
  props: UrlTextfieldProps,
): ReactElement {
  const { value, onChange, error, iconColor, borderColor } = props;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.value);
  };

  return (
    <div>
      <div
        className={`relative h-14 flex items-center justify-end border-4 rounded-lg`}
        style={{
          borderColor: error ? '#FFEB3B' : borderColor,
        }}
      >
        <input
          type="text"
          className="p-4 text-base bg-transparent h-full w-full"
          onChange={(e): void => handleChange(e)}
          value={value}
        />
        <div className="absolute pr-4">
          <button onClick={(): void => onChange('')}>
            <DashboardIcons iconName="XMark" color={iconColor} />
          </button>
        </div>
      </div>
    </div>
  );
}
