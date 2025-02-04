'use client';

import DashboardIcons from '@/ui/Icons/DashboardIcon';
import { applyUserLocaleToNumber, roundToDecimal } from '@/utils/mathHelper';
import { ReactElement } from 'react';

interface Level {
  color: string;
  width: number;
}

interface SliderProps {
  minValue: number;
  maxValue: number;
  staticValues: number[];
  staticValuesColors: string[];
  staticValuesTicks: number[];
  staticValuesLogos: string[];
  staticValuesTexts: string[];
  iconColor: string;
  labelColor: string;
  unit: string;
  value: number;
  bigValueFontSize: string;
  bigValueFontColor: string;
  labelFontSize: string;
  labelFontColor: string;
  arrowColor: string;
  unitFontSize: string;
}

export default function Slider(props: SliderProps): ReactElement {
  const {
    minValue,
    maxValue,
    staticValues,
    staticValuesColors,
    staticValuesTicks,
    staticValuesLogos,
    staticValuesTexts,
    iconColor,
    unit,
    value,
    bigValueFontSize,
    bigValueFontColor,
    labelFontSize,
    labelFontColor,
    arrowColor,
    unitFontSize,
  } = props;

  if (!staticValues || staticValues.length <= 0) {
    return <div>ERROR</div>;
  }

  // Make sure the value never goes below or above min/max
  const clampedValue = Math.min(Math.max(value, minValue), maxValue);

  // Calculate the percentage width for each static value range
  const levels: Level[] = [];
  let previousValue = minValue;
  staticValues.forEach((staticValue, index) => {
    const width = ((staticValue - previousValue) / (maxValue - minValue)) * 100;
    levels.push({
      color: staticValuesColors[index],
      width: width,
    });
    previousValue = staticValue;
  });

  // Calculate the position of the current value on the slider
  const valuePosition =
    ((clampedValue - minValue) / (maxValue - minValue)) * 100;

  // Calculate positions for ticks and logos
  const ticksWithLogos = staticValuesTicks.map((tick, index) => {
    const tickPosition = ((tick - minValue) / (maxValue - minValue)) * 100;
    return {
      position: tickPosition,
      logo: staticValuesLogos[index],
    };
  });

  // Determine which staticValuesText to display based on the current value
  let displayedText = '';
  for (let i = 0; i < staticValuesTicks.length; i++) {
    if (clampedValue < staticValuesTicks[i]) {
      displayedText = staticValuesTexts[i];
      break;
    }
  }
  if (clampedValue >= staticValuesTicks[staticValuesTicks.length - 1]) {
    displayedText = staticValuesTexts[staticValuesTicks.length - 1];
  }

  // Generate a single gradient string for the background with smooth transitions
  const gradientStops: string[] = [];
  let accumulatedWidth = 0;
  staticValuesColors.forEach((color, index) => {
    const nextColor = staticValuesColors[index + 1] || color;
    const currentWidth = levels[index].width;
    gradientStops.push(`${color} ${accumulatedWidth}%`);
    accumulatedWidth += currentWidth;
    gradientStops.push(`${nextColor} ${accumulatedWidth}%`);
  });
  const gradientString = gradientStops.join(', ');

  return (
    <div className="flex flex-col items-center justify-center h-full w-full overflow-hidden">
      <div className="mb-12">
        <span
          className="text-5xl"
          style={{
            color: bigValueFontColor,
            fontSize: `${bigValueFontSize}px` || '48px',
          }}
        >
          {applyUserLocaleToNumber(
            roundToDecimal(clampedValue),
            navigator.language || 'de-DE',
          )}
        </span>
        <span
          className="text-2xl ml-2"
          style={{ color: bigValueFontColor, fontSize: `${unitFontSize}px` }}
        >
          {unit}
        </span>
      </div>

      <div className="relative w-full px-4 mb-12">
        <div
          className="relative flex h-6 border border-gray-500 rounded-full overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(to right, ${gradientString})`,
          }}
        >
          {ticksWithLogos.map((tick, index) => (
            <div
              key={`${tick.position}-${tick.logo}-${index}`}
              className="absolute top-0 h-full"
              style={{
                left: `${tick.position}%`,
                transform: 'translateX(-50%)',
                visibility: 'hidden',
              }}
            >
              <div className="w-1 h-8 bg-black"></div>
            </div>
          ))}
        </div>
        <div
          className="absolute left-0 px-4 rotate-180"
          style={{
            left: `${valuePosition < 8 ? 8 : valuePosition > 90 ? 90 : valuePosition}%`,
            transform: 'translateX(-50%)',
            top: '-25px',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="49"
            height="49"
            viewBox="0 0 49 49"
            className="rotate-180"
          >
            <path
              stroke="none"
              fill="#ffffff"
              d="M24.035898384862 10.715390309173a4 4 0 0 1 6.9282032302755 0l17.071796769724 19.569219381653a4 4 0 0 1 -3.4641016151378 6l-34.143593539449 0a4 4 0 0 1 -3.4641016151378 -6"
              transform="translate(-4, -4)"
            ></path>
            <path
              stroke="none"
              fill={arrowColor}
              d="M 20.4305 9.1081 a 3.4 3.4 90 0 1 5.889 0 l 14.511 16.6338 a 3.4 3.4 90 0 1 -2.9445 5.1 l -29.0221 0 a 3.4 3.4 90 0 1 -2.9445 -5.1"
            ></path>
          </svg>
        </div>

        {ticksWithLogos.length > 0 &&
          ticksWithLogos.map((tick, index) => (
            <div
              key={`${tick.position}-${tick.logo}-${index}`}
              className="absolute flex flex-col items-center pt-1 px-4"
              style={{
                left: `${tick.position < 8 ? 8 : tick.position > 90 ? 90 : tick.position}%`,
                transform: 'translateX(-50%)',
                top: '32px',
              }}
            >
              <DashboardIcons
                iconName={tick.logo}
                color={iconColor}
                size="xl"
              />
            </div>
          ))}
      </div>
      <div className="text-center">
        <span
          className="text-2xl mt-6"
          style={{
            color: labelFontColor || '#FFFFF',
            fontSize: `${labelFontSize}px` || '24px',
          }}
        >
          {displayedText}
        </span>
      </div>
    </div>
  );
}
