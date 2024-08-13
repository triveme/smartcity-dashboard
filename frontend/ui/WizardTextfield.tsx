'use client';

import { ReactElement, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import '@/components/dependencies/quill.snow.css';

import '../app/quill.css';
import { tabComponentTypeEnum, tabComponentSubTypeEnum } from '@/types';

type TextfieldProps = {
  value: string | number;
  onChange: (value: string | number) => void;
  componentType?: string;
  subComponentType?: string;
  isNumeric?: boolean;
  error?: string;
  borderColor: string;
  backgroundColor: string;
};

const ReactQuill = dynamic(
  () => import('@/components/dependencies/react-quill'),
  { ssr: false },
);

export default function WizardTextfield(props: TextfieldProps): ReactElement {
  const {
    value,
    onChange,
    componentType,
    subComponentType,
    isNumeric = false,
    error,
    borderColor,
    backgroundColor,
  } = props;
  const [content, setContent] = useState(value ? value.toString() : '');
  const [textFieldContent, setTextFieldContent] = useState(
    value ? value.toString() : '',
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
    // Dynamically import Quill and configure it
    import('quill/formats/link').then((Link) => {
      Link.default.sanitize = (url: string): string => {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          return `https://${url}`;
        }
        return url;
      };
    });
  }, []);

  useEffect(() => {
    // Prefill values when editing
    setTextFieldContent(value ? value.toString() : '');
  }, [value]);

  const convertToLocaleNumber = (value: string, separator: string): string => {
    return value.replace(separator === ',' ? /\./g : /,/g, separator);
  };

  const customToolbar = [
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ size: ['small', false, 'large', 'huge'] }], // custom dropdown
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['link'],
    [{ align: [] }],
  ];

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ): void => {
    const newValue = event.target.value;

    if (isNumeric) {
      let valueAsString = newValue;

      // Replace the opposite separator with the locale's separator
      valueAsString = convertToLocaleNumber(valueAsString, decimalSeparator);

      // Allow patterns with digits and one optional locale-specific separator
      const validPattern = new RegExp(`^-?\\d*\\${decimalSeparator}?\\d*$`);

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

  const handleEditorChange = (newContent: string): void => {
    setContent(newContent);
    // const textWithoutTags = quillRef.current?.getEditor().getText() || '';
    onChange(newContent);
  };

  return (
    <div>
      {componentType === tabComponentTypeEnum.information ? (
        // TODO check the quill version 2.0 when it is released
        isBrowser &&
        subComponentType === tabComponentSubTypeEnum.text && (
          <div className="block">
            <ReactQuill
              theme="snow"
              value={content}
              onChange={handleEditorChange}
              modules={{ toolbar: customToolbar }}
              className="text-base h-full w-full"
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
          className={`h-14 block border-4 rounded-lg`}
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
          />
        </div>
      )}
    </div>
  );
}
