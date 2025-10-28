import { applyUserLocaleToNumber, roundToDecimal } from './mathHelper';

const formatTimestamp = (
  paramArray: unknown[],
  labelMap?: Map<number, [number, number, string]> | undefined,
): string => {
  // Get the timestamp from the first param and format it
  const firstParam = paramArray[0] as { axisValue: string };
  const timestamp = firstParam?.axisValue;
  let formattedTimestamp: string;
  if (labelMap?.has(+timestamp)) {
    formattedTimestamp = labelMap.get(+timestamp)![2] || '';
  } else {
    formattedTimestamp = timestamp
      ? new Date(timestamp).toLocaleString(navigator.language || 'de-DE', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        })
      : timestamp;
  }
  return formattedTimestamp;
};

export const generateTooltipContent = (
  params: unknown,
  decimalPlaces: number | undefined,
  labelMap?: Map<number, [number, number, string]> | undefined,
): string => {
  const paramArray = Array.isArray(params) ? params : [params];
  const formattedTimestamp = formatTimestamp(paramArray, labelMap);
  let tooltipContent = `<div style="font-weight: bold; margin-bottom: 8px;">${formattedTimestamp}</div>`;

  // Show all series values at this point
  paramArray.forEach((param: unknown) => {
    const typedParam = param as {
      value: [string, number | null];
      color: string;
      seriesName: string;
    };

    const value = typedParam.value[1];
    const formattedValue =
      value !== null && value !== undefined
        ? applyUserLocaleToNumber(
            roundToDecimal(Number(value), decimalPlaces),
            navigator.language || 'de-DE',
          )
        : 'No data';

    tooltipContent += `
                <div style="display: flex; align-items: center; margin: 4px 0;">
                  <span style="display: inline-block; width: 10px; height: 10px; background-color: ${typedParam.color}; border-radius: 50%; margin-right: 8px;"></span>
                  <span style="margin-right: 8px;">${typedParam.seriesName}:</span>
                  <span style="font-weight: bold;">${formattedValue}</span>
                </div>
              `;
  });

  return tooltipContent;
};
