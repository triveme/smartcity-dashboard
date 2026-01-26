'use client';

import { ReactElement, useEffect, useState } from 'react';
import { applyUserLocaleToNumber, roundToDecimal } from '@/utils/mathHelper';
import DashboardIcons from './Icons/DashboardIcon';
import { isValidDate } from '@/utils/validationHelper';
import { generateResponsiveFontSize } from '@/utils/fontUtil';
import { useSearchParams } from 'next/navigation';

type DashboardValuesProps = {
  decimalPlaces: number;
  value: string | number;
  unit: string;
  staticValues: number[];
  staticValuesColors: string[];
  staticValuesTexts: string[];
  staticValuesLogos: string[];
  fontColor: string;
  fontSize: string;
  unitFontSize: string;
  showTime: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tabData?: any;
};

export function DashboardValues(props: DashboardValuesProps): ReactElement {
  const {
    decimalPlaces,
    unit,
    staticValues,
    staticValuesColors,
    staticValuesTexts,
    staticValuesLogos,
    fontColor,
    fontSize,
    unitFontSize,
    showTime,
    tabData,
  } = props;

  let { value } = props;

  const searchParams = useSearchParams();
  const entityId = searchParams.get('entityId');

  if (entityId && tabData) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const findValue = (tabData.chartData as any[]).find(
      (x) => x.id === entityId,
    );
    if (findValue && findValue.values && findValue.values.length > 0) {
      value = findValue.values[0];
    }
  }

  const [label, setLabel] = useState<string>('');
  const [icon, setIcon] = useState<string>('');
  const [iconColor, setIconColor] = useState<string>('');

  let formattedValue;

  if (typeof value === 'number') {
    if (!isNaN(decimalPlaces)) {
      formattedValue = applyUserLocaleToNumber(
        roundToDecimal(value, decimalPlaces),
        navigator.language || 'de-DE',
      );
    } else {
      formattedValue = applyUserLocaleToNumber(
        roundToDecimal(value),
        navigator.language || 'de-DE',
      );
    }
  } else if (
    typeof value === 'string' &&
    value.includes('-') &&
    isValidDate(value)
  ) {
    const date = new Date(value);
    console.log('Date parsing:', {
      original: value,
      parsed: date,
      isValid: !isNaN(date.getTime()),
    });

    let cfg: Intl.DateTimeFormatOptions;
    if (showTime) {
      cfg = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };
    } else {
      cfg = {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
      };
    }

    formattedValue =
      date.getMonth() === 0 &&
      date.getDate() === 1 &&
      date.getHours() === 1 &&
      date.getMinutes() === 0
        ? date.getFullYear().toString()
        : date.toLocaleString(navigator.language || 'de-DE', cfg);
  } else {
    formattedValue = value;
  }

  function updateLabelIconColor(value: number): void {
    for (let i = 0; i < staticValues.length; i++) {
      if (value <= staticValues[i]) {
        setLabel(staticValuesTexts[i]);
        setIcon(staticValuesLogos[i]);
        setIconColor(staticValuesColors[i]);
        return;
      }
    }
    // If no match is found, use the last values in the arrays
    setLabel(staticValuesTexts[staticValuesTexts.length - 1]);
    setIcon(staticValuesLogos[staticValuesLogos.length - 1]);
    setIconColor(staticValuesColors[staticValuesColors.length - 1]);
  }

  // Update the label, icon, and color whenever the value changes
  useEffect(() => {
    if (typeof value === 'number' || value === '0') {
      updateLabelIconColor(Number(value));
    } else {
      setLabel('');
      setIcon('');
      setIconColor('');
    }
  }, [value, staticValues]);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center content-center p-4">
      <div
        className="flex justify-center items-center content-center text-center gap-2"
        style={{ color: fontColor }}
      >
        <DashboardIcons iconName={icon} color={iconColor} size="xl" />
        <div
          style={{
            fontSize: generateResponsiveFontSize(
              parseInt(fontSize || '14', 10),
            ),
          }}
        >
          {formattedValue}
        </div>
        <div
          style={{
            fontSize: generateResponsiveFontSize(
              parseInt(unitFontSize || '14', 10),
            ),
          }}
        >
          {unit || ''}
        </div>
      </div>

      {/* Label Display */}
      <div className="text-base text-center">{label}</div>
    </div>
  );
}
