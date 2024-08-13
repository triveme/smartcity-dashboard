import React, { useState, useRef } from 'react';

type ValueSelectionSliderProps = {
  value: number;
  onChange: (newValue: number) => void;
  minValue: number;
  maxValue: number;
  borderColor: string;
};

export default function ValueSelectionSlider(
  props: ValueSelectionSliderProps,
): React.ReactElement {
  const { value, minValue, maxValue, onChange, borderColor } = props;
  const [isSliding, setIsSliding] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const filledWidth = ((value - minValue) / (maxValue - minValue)) * 100;
  const step = 4;

  const updateValue = (clientX: number): void => {
    if (!sliderRef.current) return;

    const rect = sliderRef.current.getBoundingClientRect();
    const newPosition = clientX - rect.left;
    const percentage = newPosition / rect.width;

    let newValue = minValue + percentage * (maxValue - minValue);
    newValue = Math.round(newValue / step) * step;
    newValue = Math.min(Math.max(newValue, minValue), maxValue);

    onChange(newValue);
  };

  const handleMouseDown: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault(); // Prevent default behavior
    setIsSliding(true);
    updateValue(event.clientX);

    const handleMouseMove = (moveEvent: MouseEvent): void => {
      updateValue(moveEvent.clientX);
    };

    const handleMouseUp = (upEvent: MouseEvent): void => {
      setIsSliding(false);
      updateValue(upEvent.clientX);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleChange = (newValue: number): void => {
    onChange(newValue);
    if (!isSliding) {
      setIsSliding(true);
    }
  };

  const renderDots = (): React.ReactElement[] => {
    const dots: React.ReactElement[] = [];
    for (let i = minValue; i <= maxValue; i += step) {
      dots.push(
        <div
          key={i}
          className="absolute pl-1/2 w-1.5  h-1.5 rounded-full bg-black opacity-50"
          style={{
            left: `${((i - minValue) / (maxValue - minValue)) * 99}%`, // 99% to prevent dots from overflowing
            top: '15%',
            borderColor: borderColor,
          }}
        ></div>,
      );
    }
    return dots;
  };

  return (
    <div className="flex w-full pl-2 pr-2 items-center">
      <div
        className="flex w-full pl-2 pr-2 items-center h-14 border-4 rounded-lg justify-center"
        style={{ borderColor: borderColor }}
      >
        <div
          className="relative  w-full h-2 bg-[#59647D] rounded-full"
          ref={sliderRef}
        >
          <div
            className="absolute h-2 rounded-full bg-[#91D9FF]"
            style={{ width: `${filledWidth}%` }}
          ></div>
          {renderDots()}
          <input
            id="small-range"
            type="range"
            min={minValue}
            max={maxValue}
            value={value}
            onChange={(e): void => handleChange(Number(e.target.value))}
            className="absolute pr-2 w-full h-2 opacity-0 cursor-pointer"
          />
          <div
            className={`absolute w-5 h-5 rounded-full bg-[#91D9FF] shadow border-2 border-opacity-80 -ml-3 -top-2/3 cursor-pointer select-none ${
              isSliding ? 'scale-110' : ''
            }`}
            style={{ left: `${filledWidth}%` }}
            onMouseDown={handleMouseDown}
          >
            {isSliding && (
              <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 select-none">
                <div className="relative shadow-md">
                  <div className="bg-[#91D9FF] text-white text-xs rounded py-1 px-4">
                    {value}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
