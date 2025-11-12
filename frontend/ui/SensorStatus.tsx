'use client';
import TrafficLight from '@/assets/icons/TrafficLight';
import { useEffect, useState } from 'react';

type SensorStatusProps = {
  count: number;
  defaultColor?: string;
  color1?: string;
  color2?: string;
  color3?: string;
  isLayoutVertical: boolean;
  size?: number;
  thresholdMin: number | string;
  thresholdMax?: number | string;
  value: number | string;
};

const SensorStatusComponent: React.FC<SensorStatusProps> = ({
  count = 2,
  defaultColor = '#808080',
  color1 = '#FF0000',
  color3 = '#00FF00',
  color2 = count == 2 ? color3 : '#ffff00',
  isLayoutVertical = false,
  size = 66,
  thresholdMin,
  thresholdMax = Number.MAX_VALUE,
  value,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  useEffect(() => {
    let activeIdx = 0;

    const numValue = Number(value);
    const treshholdMinValue = Number(thresholdMin);
    const treshholdMaxValue = Number(thresholdMax);
    if (
      !isNaN(numValue) &&
      !isNaN(treshholdMinValue) &&
      treshholdMaxValue &&
      !isNaN(treshholdMaxValue)
    ) {
      if (count == 2) {
        activeIdx = numValue >= treshholdMinValue ? 1 : 0;
      } else {
        if (numValue <= treshholdMinValue) {
          activeIdx = 0;
        } else if (numValue >= treshholdMaxValue) {
          activeIdx = 2;
        } else {
          activeIdx = 1;
        }
      }
    } else {
      if (value == thresholdMin) {
        activeIdx = 1;
      } else if (value == thresholdMax) {
        activeIdx = 2;
      } else {
        activeIdx = 0;
      }
    }

    setActiveIndex(activeIdx);
  }, [value, thresholdMin, thresholdMax]);

  const getLightColor = (idx: number | undefined): string => {
    switch (idx) {
      case 0:
        return activeIndex == 0 ? color1 : defaultColor;
      case 1:
        return activeIndex == 1 ? color2 : defaultColor;
      case 2:
        return activeIndex == 2 ? color3 : defaultColor;
      default:
        return defaultColor;
    }
  };

  return (
    <div
      className={`w-full h-full overflow-auto flex ${isLayoutVertical ? 'flex-col' : 'flex-row'}`}
    >
      {Array.from({ length: count }, (_, i) => (
        <TrafficLight
          key={i}
          size={(size / count).toString()}
          fillColor={getLightColor(i)}
        />
      ))}
    </div>
  );
};

export default SensorStatusComponent;
