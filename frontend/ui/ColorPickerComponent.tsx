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
  const { currentColor, handleColorChange, label } = props;
  const [color, setColor] = useState(currentColor || '#fff');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const style: CustomStyle = { '--nav-item-color': color };

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
    if (currentColor && currentColor !== color) {
      setColor(currentColor);
      handleColorChange(currentColor);
    }
  }, [currentColor, color]);

  return (
    <div className="relative w-[300px] h-11 rounded-lg" ref={pickerRef}>
      <div
        className="bg-transparent w-72 h-11 rounded-lg flex items-center justify-between"
        style={style}
      >
        <div
          className="bg-[var(--nav-item-color)] w-32 h-11 rounded-lg cursor-pointer border border-[#3D4760]"
          onClick={(): void => setIsPickerOpen(!isPickerOpen)}
        />
        <div className="px-2 w-full">{label}</div>
      </div>
      {isPickerOpen && (
        <div className="absolute z-50">
          <ColorPicker
            color={color}
            onChange={(color: ColorObject): void => {
              setColor(color.hex);
              handleColorChange(color.hex);
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
