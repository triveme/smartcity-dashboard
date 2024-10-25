import { ReactElement, useEffect, useRef, useState } from 'react';
import ColorPicker, { ColorObject } from 'react-pick-color';

type ColorPickerComponentProps = {
  currentColor: string;
  handleColorChange: (color: string) => void;
  label: string;
};

type CustomStyle = React.CSSProperties & {
  '--nav-item-color': string; // Workaround for coloring issues with dynamic colors in tailwind
};

export default function ColorPickerComponent(
  props: ColorPickerComponentProps,
): ReactElement {
  const { currentColor, handleColorChange: onColorChange, label } = props;
  const [color, setColor] = useState({
    hex: currentColor || '#fff',
    rgb: { r: 255, g: 255, b: 255, a: 1 },
    hsl: { h: 0, s: 0, l: 1, a: 1 },
    hsv: { h: 0, s: 0, v: 1, a: 1 },
    alpha: 1,
  });
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const style: CustomStyle = { '--nav-item-color': color.hex };

  const handleInternalColorChange = (hex: string, alpha: number): void => {
    // Convert the alpha value to a two-digit hexadecimal string
    const alphaHex = Math.round(alpha * 255)
      .toString(16)
      .padStart(2, '0');

    // Concatenate the hex color and the alpha value
    const colorWithAlpha = `${hex}${alphaHex}`;

    onColorChange(colorWithAlpha); // Call the prop function
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsPickerOpen(false);
      }
    };

    if (isPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPickerOpen]);

  useEffect(() => {
    if (currentColor && currentColor !== `${color.hex},${color.alpha}`) {
      const [hex, alpha] = currentColor.split(',');
      const newColor = {
        ...color,
        hex: hex.trim(),
        alpha: parseFloat(alpha) || 1,
      };
      setColor(newColor);
    }
  }, [currentColor]);

  return (
    <div className="relative w-[300px] h-11 rounded-lg" ref={pickerRef}>
      <div
        className="bg-transparent w-72 h-11 rounded-lg flex items-center justify-between"
        style={style}
      >
        <div className="bg-white rounded-lg">
          <div
            className="w-24 h-11 rounded-md cursor-pointer border border-[#3D4760]"
            onClick={(): void => setIsPickerOpen(!isPickerOpen)}
            style={{ backgroundColor: 'var(--nav-item-color)' }}
          />
        </div>
        <div className="px-2 w-full">{label}</div>
      </div>
      {isPickerOpen && (
        <div className="absolute z-50">
          <ColorPicker
            color={color.hex}
            onChange={(color: ColorObject): void => {
              const newColor = {
                ...color,
                alpha: color.alpha || color.alpha === 0 ? color.alpha : 1, // Ensure alpha is set correctly
              };
              setColor(newColor);
              handleInternalColorChange(color.hex, newColor.alpha); // Use the internal function
            }}
            theme={{
              background: '#1D2330',
              inputBackground: '#59647D',
              borderColor: '1D2330',
              borderRadius: '4px',
              color: 'white',
              width: '320px',
            }}
          />
        </div>
      )}
    </div>
  );
}
