// ToggleButton.tsx
import React, { ReactElement, useState } from 'react';
import Cookies from 'js-cookie';

interface LightDarkToggleButtonProps {
  menuFontColor?: string;
  onToggle: () => void;
}

export default function LightDarkToggleButton(
  props: LightDarkToggleButtonProps,
): ReactElement {
  const { menuFontColor, onToggle } = props;
  const [isChecked, setIsChecked] = useState(
    Cookies.get('isLightTheme') === 'true',
  );

  const handleChange = (): void => {
    const newChecked = !isChecked;
    Cookies.set('isLightTheme', newChecked.toString(), { path: '/' });
    setIsChecked(newChecked);
    onToggle();
  };

  return (
    <div className="flex items-center space-x-4">
      <div style={{ color: menuFontColor }}>{isChecked ? 'Light' : 'Dark'}</div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only"
          checked={isChecked}
          onChange={handleChange}
        />
        <div
          className={`w-14 h-8 rounded-full flex items-center transition-colors duration-300 ease-in-out ${
            isChecked ? 'bg-gray-300' : 'bg-blue-700'
          }`}
        >
          <div
            className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
              isChecked ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </div>
      </label>
    </div>
  );
}
