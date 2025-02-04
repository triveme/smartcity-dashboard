'use client';

import { ReactElement, useState, useEffect } from 'react';

import '@/components/dependencies/quill.snow.css';
import '../app/quill.css';
import { convertToLocaleNumber } from '@/utils/mathHelper';

type NumberfieldProps = {
  value: string | number;
  onChange: (value: string | number) => void;
  error?: string;
  borderColor: string;
  backgroundColor: string;
};

export default function WizardNumberfield(
  props: NumberfieldProps,
): ReactElement {
  const { value, onChange, error, borderColor, backgroundColor } = props;
  const [textFieldContent, setTextFieldContent] = useState(
    value ? value.toString() : '',
  );

  const userLocale =
    typeof window !== 'undefined' ? navigator.language || 'en-US' : 'en-US';
  const numberFormat = new Intl.NumberFormat(userLocale);
  const decimalSeparator = numberFormat.format(1.1).charAt(1);

  useEffect(() => {
    setTextFieldContent(value ? value.toString() : '');
  }, [value]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const newValue = event.target.value;

    let valueAsString = newValue;

    // Replace the opposite separator with the locale's separator
    valueAsString = convertToLocaleNumber(valueAsString, decimalSeparator);

    // Allow patterns with digits and one optional locale-specific separator
    const validPattern = new RegExp(`\\d+(\\${decimalSeparator}\\d*)?$`);

    // Prevent updates if the pattern isn't valid
    if (!validPattern.test(valueAsString)) return;

    // Update internal state
    setTextFieldContent(valueAsString);

    // Convert to standard number format (dots) for processing
    const standardizedValue = valueAsString.replace(decimalSeparator, '.');

    // Parse numeric value only if it's a valid number
    const numericValue = parseFloat(standardizedValue);
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
        pattern="^$|\d+$"
        onChange={(e): void => handleChange(e)}
        value={textFieldContent}
        style={{ background: backgroundColor }}
      />
    </div>
  );
}
