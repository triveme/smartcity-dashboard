'use client';

import { ReactElement, useState, useEffect } from 'react';

type IntegerfieldProps = {
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  borderColor: string;
  backgroundColor: string;
};

export default function WizardIntegerfield(
  props: IntegerfieldProps,
): ReactElement {
  const { value, onChange, error, borderColor, backgroundColor } = props;
  const [textFieldContent, setTextFieldContent] = useState(
    value ? value.toString() : '',
  );

  useEffect(() => {
    setTextFieldContent(value ? value.toString() : '');
  }, [value]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    let newValue = event.target.value;

    if (!newValue || newValue === '') {
      newValue = '0';
      setTextFieldContent(newValue);
      onChange(newValue);
    }

    // Allow only positive integer patterns (digits only)
    const validPattern = /^\d*$/;

    // Prevent updates if the pattern isn't valid
    if (!validPattern.test(newValue)) return;

    // Update internal state
    setTextFieldContent(newValue);

    // Parse numeric value only if it's a valid positive integer
    const numericValue = parseInt(newValue, 10);
    onChange(isNaN(numericValue) ? '' : numericValue);
  };

  return (
    <div
      className={`h-14 block border-4 rounded-lg`}
      style={{
        borderColor: error ? '#FFEB3B' : borderColor,
        background: backgroundColor,
      }}
    >
      <input
        type="text"
        className="p-4 text-base h-full w-full"
        pattern="^\d+$"
        onChange={(e): void => handleChange(e)}
        value={textFieldContent}
        style={{ background: backgroundColor }}
      />
    </div>
  );
}
