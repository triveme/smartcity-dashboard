import { ReactElement, useEffect, useRef, useState } from 'react';
import { Sketch } from '@uiw/react-color';

type ColorPickerComponentProps = {
  currentColor: string;
  handleColorChange: (color: string) => void;
  label: string;
  width?: number;
};

type CustomStyle = React.CSSProperties & {
  '--nav-item-color': string; // Workaround for coloring issues with dynamic colors in tailwind
};

export default function ColorPickerComponent(
  props: ColorPickerComponentProps,
): ReactElement {
  const { width = 300, currentColor, handleColorChange, label } = props;
  const [hex, setHex] = useState(currentColor ? currentColor : '#FFFFFF');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const style: CustomStyle = { '--nav-item-color': hex };
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentColor) {
      setHex(currentColor);
    }
  }, [currentColor]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setIsPickerOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Enter' || event.key === 'Escape') {
        setIsPickerOpen(false);
      }
    };

    if (isPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPickerOpen]);

  return (
    <>
      <div className={`relative w-[${width}px] h-11 rounded-lg`}>
        <div
          className="bg-transparent w-full h-11 rounded-lg flex items-center justify-between"
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
          <div ref={pickerRef} className="absolute z-50">
            <Sketch
              style={{ marginLeft: 20 }}
              color={hex}
              onChange={(color) => {
                setHex(color.hexa);
                handleColorChange(color.hexa);
              }}
            />
          </div>
        )}
      </div>
    </>
  );
}
