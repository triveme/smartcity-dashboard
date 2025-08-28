import { ReactElement, useEffect, useRef, useState } from 'react';
import { Sketch, SwatchPresetColor } from '@uiw/react-color';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

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
  const [colorPickerPresets, setColorPickerPresets] = useState<
    SwatchPresetColor[] | false
  >(false);

  const params = useParams();
  const tenant = (params.tenant as string) || undefined;

  const { data: corporateInfo, refetch: refetchCorporateInfo } = useQuery({
    queryKey: ['corporate-info'],
    queryFn: () => getCorporateInfosWithLogos(tenant),
    enabled: false,
  });

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
      refetchCorporateInfo();
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPickerOpen]);

  useEffect(() => {
    let presetColors = corporateInfo
      ? [
          corporateInfo.dashboardPrimaryColor,
          corporateInfo.headerPrimaryColor,
          corporateInfo.menuPrimaryColor,
          corporateInfo.panelPrimaryColor,
          corporateInfo.widgetPrimaryColor,
          corporateInfo.fontColor,
          corporateInfo.headerFontColor,
          corporateInfo.dashboardFontColor,
          corporateInfo.menuActiveFontColor,
          corporateInfo.menuActiveColor,
          corporateInfo.menuFontColor,
          corporateInfo.menuHoverColor,
          corporateInfo.menuHoverFontColor,
          corporateInfo.panelFontColor,
          corporateInfo.widgetFontColor,
        ]
      : false;

    if (presetColors) {
      presetColors = Array.from(
        new Set(presetColors.filter((color) => color !== null)),
      );
      setColorPickerPresets(presetColors);
    } else {
      setColorPickerPresets(false);
    }
  }, [corporateInfo]);

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
              presetColors={colorPickerPresets}
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
