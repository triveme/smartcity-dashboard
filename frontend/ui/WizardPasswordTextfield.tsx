import { ReactElement, useState } from 'react';
import DashboardIcons from '@/ui/Icons/DashboardIcon';

type PasswordTextfieldProps = {
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  borderColor: string;
  backgroundColor: string;
  iconColor: string;
};

export default function WizardPasswordTextfield(
  props: PasswordTextfieldProps,
): ReactElement {
  const { value, onChange, error, borderColor, backgroundColor, iconColor } =
    props;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    onChange(event.target.value);
  };

  const togglePasswordVisibility = (): void => {
    setIsPasswordVisible((prevState) => !prevState);
  };

  return (
    <div
      className={`h-14 flex items-center justify-end border-4 rounded-lg`}
      style={{
        borderColor: error ? '#FFEB3B' : borderColor,
        background: backgroundColor,
      }}
    >
      <input
        type={isPasswordVisible ? 'text' : 'password'}
        className="p-4 text-base bg-transparent h-full w-full"
        onChange={(e): void => handleChange(e)}
        value={value}
      />
      <div className="absolute pr-4">
        <button onClick={togglePasswordVisibility}>
          <DashboardIcons
            iconName={isPasswordVisible ? 'EyeSlash' : 'Eye'}
            color={iconColor}
          />
        </button>
      </div>
    </div>
  );
}
