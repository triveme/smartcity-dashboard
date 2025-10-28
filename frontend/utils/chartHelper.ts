import { ChartData } from '@/types';
import { Dictionary } from 'lodash';

type LabelMap = Map<number, [number, number, string]>;

function isSameDay(ts1: number, ts2: number): boolean {
  const d1 = new Date(ts1);
  const d2 = new Date(ts2);

  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
function getSameDayLabel(
  labelsMap: LabelMap,
  value: number,
): string | undefined {
  const keys = labelsMap.keys().toArray();
  for (let index = 0; index < keys.length; index++) {
    const element = keys[index];
    const sameDay = isSameDay(value, element);
    if (sameDay) {
      return labelsMap.get(element)![2];
    }
  }
}

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

export const getChartDateRichText = (
  representation: string,
): Dictionary<object> | undefined => {
  switch (representation) {
    case 'Default':
      return {
        yearStyle: {
          fontWeight: 'bold',
          fontSize: 15,
        },
        monthStyle: {
          fontWeight: 'bold',
          fontSize: 13,
          padding: [0, 0, 0, 10],
        },
        dayStyle: {
          fontSize: 13,
        },
        hourStyle: {
          fontSize: 10,
        },
        secondStyle: {
          fontSize: 9,
        },
      };
    case 'Only Year':
      return {
        yearStyle: {
          fontWeight: 'bold',
          fontSize: 15,
        },
      };
    case 'Only Month':
      return {
        yearStyle: {
          fontWeight: 'bold',
          fontSize: 15,
        },
        monthStyle: {
          fontWeight: 'bold',
          fontSize: 13,
          padding: [0, 0, 0, 10],
        },
      };

    /* If the representation not known, deactivate the richtext formatter */
    default:
      return undefined;
  }
};
export const getLabelMap = (
  representation: string | undefined,
  series: (echarts.LineSeriesOption | echarts.BarSeriesOption)[],
): Map<number, [number, number, string]> | undefined => {
  if (representation === 'Only Labels') {
    const labelMap = new Map();
    series.forEach((serie) => {
      if (serie.data) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        serie.data.forEach((dataset: any) => {
          const time = dataset[0];
          const timestamp = new Date(time).getTime();
          if (!labelMap.has(timestamp)) {
            labelMap.set(timestamp, [timestamp, dataset[1], dataset[2]]);
          }
        });
      }
    });
    return labelMap;
  } else {
    return undefined;
  }
};

export const getChartDateFormatter = (
  representation: string,
  labelsMap?: LabelMap,
):
  | {
      year: string;
      month: string;
      day: string;
      hour?: string;
      second?: string;
    }
  | undefined
  | ((value: number) => string) => {
  switch (representation) {
    case 'Default':
      return {
        year: '{yearStyle|{yyyy}}',
        month: '{monthStyle|{MMM}}',
        day: '{dayStyle|{dd}.{M}.}',
        hour: '{hourStyle|{HH}:{mm}}',
        second: '{secondStyle|{mm}:{ss}}',
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
    case 'Only Labels':
      if (labelsMap) {
        return (value: number): string => {
          if (labelsMap.has(value)) {
            return labelsMap.get(value)![2];
          } else {
            const r = getSameDayLabel(labelsMap, value);
            if (r) {
              return r;
            }
            return '';
          }
        };
      } else {
        return {
          year: '',
          month: '',
          day: '',
        };
      }

    /* If the representation not known, deactivate the date formatter */
    default:
      return undefined;
  }
};
