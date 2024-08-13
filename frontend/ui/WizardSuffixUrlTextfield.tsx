import { ReactElement, useCallback, useState } from 'react';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';

type UrlTextfieldProps = {
  value: string | number;
  onChange: (value: string | number) => void;
  componentType?: string;
  error?: string;
  borderColor: string;
};
export default function WizardSuffixUrlTextfield(
  props: UrlTextfieldProps,
): ReactElement {
  const { value, onChange, error, borderColor } = props;
  const { openSnackbar } = useSnackbar();

  const validateUrl = useCallback((val: string): boolean => {
    const urlRegex = /^[a-zA-Z0-9_-]*$/;
    return urlRegex.test(val);
  }, []);

  const [inputValue, setInputValue] = useState('');

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value.replace(' ', '-');
      if (newValue !== inputValue && !validateUrl(newValue)) {
        openSnackbar(
          'Ungültiges URL-Format. Bitte verwenden Sie nur Buchstaben, Zahlen, Unterstriche und Bindestriche.',
          'error',
        );
      } else {
        onChange(newValue);
        setInputValue(newValue);
      }
    },
    [validateUrl, onChange, openSnackbar],
  );

  return (
    <div>
      <div
        className={`h-14 block border-4 rounded-lg`}
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
      </div>
    </div>
  );
}
