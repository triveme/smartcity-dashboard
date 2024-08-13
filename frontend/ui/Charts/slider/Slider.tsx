'use client';

import DashboardIcons from '@/ui/Icons/DashboardIcon';
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
    labelColor,
    unit,
    value,
  } = props;

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
  const valuePosition = ((value - minValue) / (maxValue - minValue)) * 100;

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
    if (value < staticValuesTicks[i]) {
      displayedText = staticValuesTexts[i];
      break;
    }
  }
  if (value >= staticValuesTicks[staticValuesTicks.length - 1]) {
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
    <div className="flex flex-col items-center justify-center h-full w-full">
      <div className="mb-12">
        <span
          className="text-5xl font-monospace font-bold"
          style={{ color: iconColor }}
        >
          {value}
        </span>
        <span
          className="text-2xl font-monospace font-bold ml-2"
          style={{ color: iconColor }}
        >
          {unit}
        </span>
      </div>

      <div className="relative w-full max-w-sm mb-12">
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
          className="absolute left-0"
          style={{
            left: `${valuePosition}%`,
            transform: 'translateX(-50%)',
            top: '-25px',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="49"
            height="49"
            viewBox="0 0 49 49"
            transform="rotate(180)"
          >
            <path
              stroke="none"
              fill="#ffffff"
              d="M24.035898384862 10.715390309173a4 4 0 0 1 6.9282032302755 0l17.071796769724 19.569219381653a4 4 0 0 1 -3.4641016151378 6l-34.143593539449 0a4 4 0 0 1 -3.4641016151378 -6"
              transform="translate(-4, -4)"
            ></path>
            <path
              stroke="none"
              fill="#000000"
              d="M 20.4305 9.1081 a 3.4 3.4 90 0 1 5.889 0 l 14.511 16.6338 a 3.4 3.4 90 0 1 -2.9445 5.1 l -29.0221 0 a 3.4 3.4 90 0 1 -2.9445 -5.1"
            ></path>
          </svg>
        </div>

        {ticksWithLogos.length > 0 &&
          ticksWithLogos.map((tick, index) => (
            <div
              key={`${tick.position}-${tick.logo}-${index}`}
              className="absolute flex flex-col items-center pt-1"
              style={{
                left: `${tick.position}%`,
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
        <span className="text-2xl mt-6" style={{ color: labelColor }}>
          {displayedText}
        </span>
      </div>
    </div>
  );
}
