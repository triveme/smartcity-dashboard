type AuthDataType =
  | 'ngsi'
  | 'ngsi-v2'
  | 'ngsi-ld'
  | 'api'
  | 'static-endpoint'
  | 'usi'
  | 'internal'
  | 'sql';

export function sortFlattenedTimeSeriesData(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  flattenedData: any[],
  authDataType: AuthDataType,
  selectedLegendNames: string[],
  minRagnge: string | Date,
  maxRagnge: string | Date,
) {
  if (
    authDataType === 'ngsi' ||
    authDataType === 'ngsi-ld' ||
    authDataType === 'ngsi-v2'
  ) {
    const minTime = new Date(minRagnge).getTime();
    const maxTime = new Date(maxRagnge).getTime();
    const selectedLegendNameSet = new Set(
      selectedLegendNames
        .map((legendName) => legendName.trim().toLowerCase())
        .filter((legendName) => legendName !== ''),
    );

    if (!Number.isFinite(minTime) || !Number.isFinite(maxTime)) {
      return flattenedData;
    }

    const from = Math.min(minTime, maxTime);
    const to = Math.max(minTime, maxTime);

    return flattenedData.filter((item) => {
      const pointTime = new Date(item.index).getTime();
      const inRange = pointTime >= from && pointTime <= to;
      const legendSource =
        typeof item.seriesName === 'string' && item.seriesName !== ''
          ? item.seriesName
          : item.attrName;
      const inLegend =
        selectedLegendNameSet.size === 0 ||
        getLegendNameCandidates(legendSource).some((candidate) =>
          selectedLegendNameSet.has(candidate.toLowerCase()),
        );
      return inRange && inLegend;
    });
  } else if (authDataType === 'internal') {
    const minTime = new Date(minRagnge).getFullYear();
    const maxTime = new Date(maxRagnge).getFullYear();

    if (!Number.isFinite(minTime) || !Number.isFinite(maxTime)) {
      return flattenedData;
    }

    const from = Math.min(minTime, maxTime);
    const to = Math.max(minTime, maxTime);

    return flattenedData.filter((item) => {
      const pointTime = new Date(item.Jahr).getTime();
      const inRange = pointTime >= from && pointTime <= to;
      return inRange;
    });
  } else if (authDataType === 'usi') {
    // TODO: Implement visible-area filtering for USI exports.
    return flattenedData;
  }
}

function getLegendNameCandidates(seriesName: string): string[] {
  const candidates = new Set<string>();
  const trimmedName = seriesName.trim();

  if (seriesName !== '') {
    candidates.add(seriesName);
  }

  if (trimmedName !== '') {
    candidates.add(trimmedName);
  }

  const [sensorName] = seriesName
    .split('|')
    .map((part) => part.trim())
    .filter((part) => part !== '');

  if (sensorName) {
    candidates.add(sensorName);
  }

  return Array.from(candidates);
}
