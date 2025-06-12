'use client';
import { ReactElement, useState, useEffect, CSSProperties } from 'react';

import { tabComponentTypeEnum, tabComponentSubTypeEnum } from '@/types';
import EditorComponent from '@/components/EditorComponent';
import { convertToLocaleNumber } from '@/utils/mathHelper';

type TextfieldProps = {
  value: string | number;
  onChange: (value: string | number) => void;
  placeholderText?: string;
  componentType?: string;
  subComponentType?: string;
  isNumeric?: boolean;
  error?: string;
  borderColor: string;
  backgroundColor: string;
  panelFontColor?: string;
  panelBorderRadius?: string;
  panelBorderSize?: string;
};

export default function WizardTextfield(props: TextfieldProps): ReactElement {
  const {
    value,
    onChange,
    componentType,
    placeholderText,
    subComponentType,
    isNumeric = false,
    error,
    borderColor,
    backgroundColor,
    panelFontColor,
    panelBorderRadius,
    panelBorderSize,
  } = props;

  const [textFieldContent, setTextFieldContent] = useState(
    value !== undefined && value !== null ? value.toString() : '',
  );

  const [isBrowser, setIsBrowser] = useState(false);

  // Get user's locale
  const userLocale =
    typeof window !== 'undefined' ? navigator.language || 'en-US' : 'en-US';
  const numberFormat = new Intl.NumberFormat(userLocale);
  const decimalSeparator = numberFormat.format(1.1).charAt(1);

  useEffect(() => {
    // Set isBrowser to true once component mounts
    setIsBrowser(typeof window !== 'undefined');
  }, []);

  useEffect(() => {
    setTextFieldContent(
      value !== undefined && value !== null ? value.toString() : '',
    );
  }, [value]);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const newValue = event.target.value;

    if (isNumeric) {
      let valueAsString = newValue;

      // Replace the opposite separator with the locale's separator
      valueAsString = convertToLocaleNumber(valueAsString, decimalSeparator);

      // Handle case where only a minus sign or empty string is entered
      if (
        valueAsString === '-' ||
        valueAsString === '' ||
        valueAsString === '.' ||
        valueAsString === ',' ||
        valueAsString.endsWith(decimalSeparator)
      ) {
        setTextFieldContent(valueAsString);
        return;
      }

      // Allow empty string, single minus, or valid numbers with one optional separator
      const validPattern = new RegExp(
        `^-?$|^-?\\d+(\\${decimalSeparator}\\d*)?$`,
      );

      // Prevent updates if the pattern isn't valid
      if (!validPattern.test(valueAsString)) return;

      // Update internal state
      setTextFieldContent(valueAsString);

      // Convert to standard number format (dots) for processing
      const standardizedValue = valueAsString.replace(decimalSeparator, '.');

      // Parse numeric value only if it's a valid number
      const numericValue = parseFloat(standardizedValue);
      onChange(isNaN(numericValue) ? '' : numericValue);
    } else {
      setTextFieldContent(newValue); // Update internal state
      onChange(newValue); // Pass value to parent component
    }
  };

  const errorStyle: CSSProperties = {
    border: '4px solid #FFEB3B',
    borderRadius: '0.5rem',
  };

  // set dynamic CSS variables for quill editor
  useEffect(() => {
    if (panelFontColor) {
      document.documentElement.style.setProperty(
        '--panel-font-color',
        panelFontColor,
      );
    }
    if (panelBorderRadius) {
      document.documentElement.style.setProperty(
        '--panel-border-radius',
        panelBorderRadius,
      );
    }
    if (panelBorderSize) {
      document.documentElement.style.setProperty(
        '--panel-border-size',
        panelBorderSize,
      );
    }
    if (borderColor) {
      document.documentElement.style.setProperty('--border-color', borderColor);
    }
    if (backgroundColor) {
      document.documentElement.style.setProperty(
        '--background-color',
        backgroundColor,
      );
    }
  }, [
    panelFontColor,
    panelBorderRadius,
    panelBorderSize,
    borderColor,
    backgroundColor,
  ]);

  return (
    <>
      {componentType === tabComponentTypeEnum.information ? (
        isBrowser &&
        subComponentType === tabComponentSubTypeEnum.text && (
          <div className="block" style={error ? errorStyle : {}}>
            <EditorComponent
              value={value.toString()}
              onChange={onChange}
              error={error}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
              fontColor={panelFontColor || '#000'}
            />
          </div>
        )
      ) : componentType === 'textarea' ? (
        <textarea
          className={`p-4 block border-4 rounded-lg w-full text-base`}
          onChange={(e): void => handleChange(e)}
          value={value}
          rows={5}
          style={{
            borderColor: error ? '#FFEB3B' : borderColor,
            background: backgroundColor,
          }}
        />
      ) : (
        <div
          className={`h-14 w-full block border-4 rounded-lg`}
          style={{
            borderColor: error ? '#FFEB3B' : borderColor,
            background: backgroundColor,
          }}
        >
          <input
            type="text"
            className="p-4 text-base h-full w-full"
            onChange={(e): void => handleChange(e)}
            value={textFieldContent}
            style={{ background: backgroundColor }}
            placeholder={placeholderText || ''}
          />
        </div>
      )}
    </>
  );
}
