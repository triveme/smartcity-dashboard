import { ChartData } from '@/types';

export function getLabelName(text: string, index: number): string {
  if (text) {
    const parts = text.split('|');

    if (parts.length > 1) {
      parts[0] = `Sensor ${index + 1} `;
    }
    return parts.join('|');
  }
  return `Sensor ${index}`;
}

export function getUniqueField(
  chartData: ChartData[],
  isName: boolean,
): string[] {
  const uniqueAttributes: string[] = [];
  for (let i = 0; i < chartData.length; i++) {
    const tempName = chartData[i].name;
    if (tempName) {
      const splitName = tempName.split('|');
      if (splitName && splitName.length && splitName.length > 0) {
        const attribute = splitName[isName ? 0 : 1];
        if (!uniqueAttributes.includes(attribute)) {
          uniqueAttributes.push(attribute);
        }
      }
    }
  }
  return uniqueAttributes;
}

export const calculateLeftGrid = (
  yAxisLabel: string,
  legendAlignment: string,
): number => {
  let leftGrid = 10;

  if (yAxisLabel && yAxisLabel !== '') {
    if (legendAlignment === 'Left') {
      leftGrid = 80;
    } else {
      leftGrid = 50;
    }
  }

  return leftGrid;
};

export const calculateBottomGrid = (
  xAxisLabel: string,
  allowZoom = false,
): number => {
  let bottomGrid = 30;

  if (xAxisLabel && allowZoom) bottomGrid = 80;
  if (xAxisLabel && !allowZoom) bottomGrid = 50;

  if (!xAxisLabel && allowZoom) bottomGrid = 80;
  if (!xAxisLabel && !allowZoom) bottomGrid = 30;

  return bottomGrid;
};

export const formatYAxisLabel = (label: string): string => {
  const maxCharsPerLine = 40;
  const words = label.split(' '); // Split label into individual words
  const result: string[] = [];
  let currentLine = '';

  for (const word of words) {
    // Check if adding the word exceeds the character limit
    if ((currentLine + word).length > maxCharsPerLine) {
      result.push(currentLine.trim()); // Push the current line to results
      currentLine = ''; // Start a new line
    }

    // Add the word to the current line
    currentLine += word + ' ';
  }

  // Push the last line to the result
  if (currentLine.trim()) {
    result.push(currentLine.trim());
  }

  return result.join('\n'); // Combine the lines with `\n`
};

export const calculateYAxisNameGap = (data: ChartData[]): number => {
  // Flatten all values across data arrays and find the maximum
  const maxValue = Math.max(
    ...data.flatMap((series) =>
      series.values.map(([, value]) => Math.abs(value)),
    ),
  );

  // Determine nameGap based on conditions
  if (maxValue < 1000) {
    return 45;
  } else if (maxValue >= 1000 && maxValue <= 99999) {
    return 60;
  } else {
    return 75;
  }
};

export const calculateMaxYAxisValue = (
  data: ChartData[],
  decimalPlaces: number | undefined,
): number => {
  let maxValue = Math.max(
    ...data.flatMap((series) => series.values.map(([, value]) => value)),
  );
  const factor = Math.pow(10, decimalPlaces ? decimalPlaces : 0);
  maxValue = maxValue * factor;
  if (maxValue < 0) {
    maxValue = Math.floor(maxValue * 0.9);
  } else {
    maxValue = Math.floor(maxValue * 1.1);
  }
  maxValue = maxValue / factor;
  return maxValue;
};

export const calculateMinYAxisValue = (
  data: ChartData[],
  decimalPlaces: number | undefined,
): number => {
  let minValue = Math.min(
    ...data.flatMap((series) => series.values.map(([, value]) => value)),
  );
  const factor = Math.pow(10, decimalPlaces ? decimalPlaces : 0);
  minValue = minValue * factor;
  if (minValue < 0) {
    minValue = Math.floor(minValue * 1.1);
  } else {
    minValue = Math.floor(minValue * 0.9);
  }
  minValue = minValue / factor;
  return minValue;
};

export const getChartDateFormatter = (
  representation: string | undefined,
): { year: string; month: string; day: string } | undefined => {
  if (representation === undefined) return undefined;

  switch (representation) {
    case 'Default':
      return {
        year: '{yearStyle|{yyyy}}',
        month: '{monthStyle|{MMM}}',
        day: '{dd}.{M}.',
      };
    case 'Only Year':
      return {
        year: '{yearStyle|{yyyy}}',
        month: '',
        day: '',
      };
    case 'Only Month':
      return {
        // displays Months and also the Year on first Month of the new year
        year: '{yearStyle|{yyyy}}\n{monthStyle|{MMM}}',
        month: '{monthStyle|{MMM}}',
        day: '',
      };
    default:
      return undefined;
  }
};
