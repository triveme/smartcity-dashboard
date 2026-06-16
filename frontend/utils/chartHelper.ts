import { ChartData } from '@/types';
import { ECharts } from 'echarts';
import { Dictionary } from 'lodash';

type LabelMap = Map<number, [number, number, string]>;
const germanWeekdayFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'short',
});
const germanWeekdayLongFormatter = new Intl.DateTimeFormat('de-DE', {
  weekday: 'long',
});

export type WeekdayLabelMode = 'short' | 'long';

const getFontSizeInPx = (
  fontSize: string | number | undefined,
  fallback = 12,
): number => {
  if (typeof fontSize === 'number' && Number.isFinite(fontSize)) {
    return fontSize;
  }

  const parsedSize =
    typeof fontSize === 'string' ? Number.parseInt(fontSize, 10) : Number.NaN;

  return Number.isFinite(parsedSize) ? parsedSize : fallback;
};

export type SingleValueChartDatum =
  | number
  | string
  | [string, number | string, string?];

export type SingleValueChartTabData = {
  chartValues?: Array<number | string>;
  chartData?: Array<{
    id?: string;
    name?: string;
    values?: unknown[];
  }>;
  textValue?: string | number | null;
};

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
      if (splitName && splitName.length && splitName.length > 1) {
        const attribute = splitName[isName ? 0 : 1];
        if (!uniqueAttributes.includes(attribute)) {
          uniqueAttributes.push(attribute);
        }
      } else if (splitName && splitName.length && splitName.length == 1) {
        if (!uniqueAttributes.includes(splitName[0])) {
          uniqueAttributes.push(splitName[0]);
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
  advancedDateSelection = false,
): number => {
  let bottomGrid = 30;

  if (xAxisLabel && allowZoom) bottomGrid = 80;
  if (xAxisLabel && !allowZoom) bottomGrid = 50;

  if (!xAxisLabel && allowZoom) bottomGrid = 80;
  if (!xAxisLabel && !allowZoom) bottomGrid = 30;

  if (advancedDateSelection) bottomGrid += 60;
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
    case 'Default Without Month':
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
    case 'Default Without Month':
      return {
        year: '{yearStyle|{yyyy}}',
        month: '',
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
    case 'Weekdays':
      return (value: number): string => {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
          return '';
        }
        return germanWeekdayFormatter.format(date).replace(/\./g, '');
      };

    /* If the representation not known, deactivate the date formatter */
    default:
      return undefined;
  }
};

export const formatGermanWeekday = (
  value: number,
  mode: WeekdayLabelMode,
): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  if (mode === 'long') {
    return germanWeekdayLongFormatter.format(date);
  }

  return germanWeekdayFormatter.format(date).replace(/\./g, '');
};

export const getAdaptiveWeekdayFormatter = (
  availablePixelsPerTick: number,
  fontSize: string | number | undefined,
): ((value: number) => string) => {
  const resolvedFontSize = getFontSizeInPx(fontSize);
  const estimatedLongLabelWidth = 'Donnerstag'.length * resolvedFontSize * 0.62;
  const labelMode: WeekdayLabelMode =
    availablePixelsPerTick >= estimatedLongLabelWidth + 12 ? 'long' : 'short';

  return (value: number): string => formatGermanWeekday(value, labelMode);
};

// Consistent time label formatter (overrides eCharts auto switching)
export const formatTickByAggrPeriod = (
  tickValue: number | string,
  aggrPeriod: string,
  range?: { min: Date | number; max: Date | number } | null,
): string => {
  const d = new Date(tickValue);
  if (isNaN(d.getTime())) return '';

  const pad2 = (n: number): string => (n < 10 ? `0${n}` : String(n));
  const getTimeValue = (value: Date | number): number =>
    value instanceof Date ? value.getTime() : new Date(value).getTime();

  const yyyy = d.getFullYear();
  const MM = pad2(d.getMonth() + 1);
  const DD = pad2(d.getDate());
  const HH = pad2(d.getHours());
  const mm = pad2(d.getMinutes());

  switch (aggrPeriod) {
    case 'live':
    case 'day':
      return `${HH}:${mm}`;

    case 'week':
    case 'month':
      return `${DD}.${MM}`;

    case 'quarter': {
      const quarter = Math.floor(d.getMonth() / 3) + 1;
      return `Q${quarter} ${yyyy}`;
    }

    case 'year':
      return `${MM}.${yyyy}`;

    case 'year2':
    case 'year3':
      return `${yyyy}`;

    case 'user_defined': {
      const minTime =
        range?.min !== undefined ? getTimeValue(range.min) : Number.NaN;
      const maxTime =
        range?.max !== undefined ? getTimeValue(range.max) : Number.NaN;
      const spanMs =
        Number.isFinite(minTime) && Number.isFinite(maxTime)
          ? Math.abs(maxTime - minTime)
          : Number.NaN;
      const dayMs = 24 * 60 * 60 * 1000;

      if (Number.isFinite(spanMs) && spanMs <= 2 * dayMs) {
        return `${DD}.${MM}. ${HH}:${mm}`;
      }

      if (Number.isFinite(spanMs) && spanMs <= 90 * dayMs) {
        return `${DD}.${MM}`;
      }

      if (Number.isFinite(spanMs) && spanMs <= 730 * dayMs) {
        return `${MM}.${yyyy}`;
      }

      return `${yyyy}`;
    }

    default:
      return '';
  }
};

const getXAxisBounds = (
  sortedData: ChartData[],
  aggrPeriod: string,
  setXByAggrPeriod: boolean,
): { min?: number; max?: number } => {
  if (!sortedData || sortedData.length === 0) {
    return {
      min: undefined,
      max: undefined,
    };
  }

  let minTime = Infinity;
  let maxTime = -Infinity;

  sortedData.forEach((seriesItem) => {
    seriesItem.values.forEach(([timestamp]) => {
      const time = new Date(timestamp).getTime();

      if (!Number.isNaN(time)) {
        if (time < minTime) minTime = time;
        if (time > maxTime) maxTime = time;
      }
    });
  });

  if (minTime === Infinity || maxTime === -Infinity) {
    return {
      min: undefined,
      max: undefined,
    };
  }

  if (!setXByAggrPeriod || aggrPeriod === 'live') {
    return {
      min: minTime,
      max: maxTime,
    };
  }

  const end = new Date(maxTime);
  const start = new Date(maxTime);

  switch (aggrPeriod) {
    case 'day': {
      start.setTime(end.getTime() - 24 * 60 * 60 * 1000);
      break;
    }

    case 'week': {
      start.setTime(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    }

    case 'month': {
      start.setMonth(start.getMonth() - 1);
      break;
    }

    case 'quarter': {
      start.setMonth(start.getMonth() - 3);
      break;
    }

    case 'year': {
      start.setFullYear(start.getFullYear() - 1);
      break;
    }

    case 'year2': {
      start.setFullYear(start.getFullYear() - 2);
      break;
    }

    case 'year3': {
      start.setFullYear(start.getFullYear() - 3);
      break;
    }

    case 'user_defined': {
      return {
        min: minTime,
        max: maxTime,
      };
    }

    default: {
      return {
        min: minTime,
        max: maxTime,
      };
    }
  }

  return {
    min: start.getTime(),
    max: end.getTime(),
  };
};

export const sortFilteredData = (data: ChartData[]): ChartData[] => {
  const sortedChartData = [...data].sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
  );

  return sortedChartData;
};

// Sort sensor names to keep chart colors consistent
export const sortChartSensorNames = (sensors: string[]): string[] => {
  const sortedSensorsNames = [...sensors].sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase()),
  );
  return sortedSensorsNames;
};

export const setXAxisBounds = (
  sortedData: ChartData[],
  aggrPeriod: string,
  setXByAggrPeriod: boolean,
  setXAxisMin: (value?: number) => void,
  setXAxisMax: (value?: number) => void,
): void => {
  const { min, max } = getXAxisBounds(sortedData, aggrPeriod, setXByAggrPeriod);

  setXAxisMin(min);
  setXAxisMax(max);
};

export const extractNumericChartValue = (value: unknown): number | null => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().replace(',', '.');
    if (normalized === '') {
      return null;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return null;
    }

    if (value.length > 1 && typeof value[0] === 'string') {
      return extractNumericChartValue(value[1]);
    }

    return extractNumericChartValue(value[value.length - 1]);
  }

  if (value && typeof value === 'object' && 'value' in value) {
    return extractNumericChartValue((value as { value: unknown }).value);
  }

  return null;
};

export const resolveSingleValueChartNumber = (
  propValue: number | string,
  tabData?: SingleValueChartTabData,
  entityId?: string | null,
): number => {
  if (entityId && Array.isArray(tabData?.chartData)) {
    const entityMatch = tabData.chartData.find(
      (item) => item.id === entityId || item.name === entityId,
    );
    const entityValue = extractNumericChartValue(entityMatch?.values?.[0]);

    if (entityValue !== null) {
      return entityValue;
    }
  }

  const directValue = extractNumericChartValue(propValue);
  if (directValue !== null) {
    return directValue;
  }

  const chartValue = extractNumericChartValue(tabData?.chartValues?.[0]);
  if (chartValue !== null) {
    return chartValue;
  }

  const firstChartDataValue = extractNumericChartValue(
    tabData?.chartData?.[0]?.values?.[0],
  );
  if (firstChartDataValue !== null) {
    return firstChartDataValue;
  }

  const textValue = extractNumericChartValue(tabData?.textValue);
  if (textValue !== null) {
    return textValue;
  }

  return 0;
};

export function getSelectedLegendNames(chart: ECharts): string[] {
  const option = chart.getOption();
  const legend = Array.isArray(option.legend)
    ? option.legend[0]
    : option.legend;
  const selected = legend?.selected as Record<string, boolean> | undefined;
  const series = Array.isArray(option.series) ? option.series : [];

  return series
    .map((seriesItem) => seriesItem?.name)
    .filter((name): name is string => typeof name === 'string' && name !== '')
    .filter((name) => selected?.[name] !== false);
}
