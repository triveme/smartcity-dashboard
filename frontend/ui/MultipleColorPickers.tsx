import { ReactElement } from 'react';
import ColorPickerComponent from './ColorPickerComponent';

type MultipleColorPickerProps = {
  colors?: string[] | null; // Optional and can be `null`
  totalFields: number;
  label: string;
  onColorChange: (index: number, newColor: string) => void;
};

export default function MultipleColorPicker({
  colors = [],
  totalFields,
  label,
  onColorChange,
}: MultipleColorPickerProps): ReactElement {
  const validColors =
    colors && colors.length && colors.length > 0
      ? colors
      : Array(totalFields).fill('#FFFFFF');

  return (
    <div>
      {Array.from({ length: totalFields }, (_, index) => (
        <div className="mt-3" key={index}>
          <ColorPickerComponent
            currentColor={validColors[index] || '#FFFFFF'}
            handleColorChange={(newColor: string): void =>
              onColorChange(index, newColor)
            }
            label={`${label} ${index + 1}`}
          />
        </div>
      ))}
    </div>
  );
}
