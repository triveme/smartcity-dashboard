import { ChartData } from '@/types';

export type SingleSelectionLegendState = string[] | null;

function normalizeLegendNames(legendNames: string[]): string[] {
  return legendNames.filter(
    (legendName, index): legendName is string =>
      typeof legendName === 'string' &&
      legendName !== '' &&
      legendNames.indexOf(legendName) === index,
  );
}

export function getLineChartLegendNames(chartData: ChartData[]): string[] {
  return normalizeLegendNames(chartData.map((series) => series.name));
}

export function getEffectiveSingleSelectionLegendNames(
  allLegendNames: string[],
  selectionState: SingleSelectionLegendState,
): string[] {
  const normalizedLegendNames = normalizeLegendNames(allLegendNames);

  if (normalizedLegendNames.length === 0) {
    return [];
  }

  if (selectionState === null) {
    return normalizedLegendNames;
  }

  const selectedLegendSet = new Set(selectionState);
  const filteredSelection = normalizedLegendNames.filter((legendName) =>
    selectedLegendSet.has(legendName),
  );

  return selectionState.length > 0 && filteredSelection.length === 0
    ? normalizedLegendNames
    : filteredSelection;
}

export function areSingleSelectionLegendStatesEqual(
  currentState: SingleSelectionLegendState,
  nextState: SingleSelectionLegendState,
): boolean {
  if (currentState === nextState) {
    return true;
  }

  if (currentState === null || nextState === null) {
    return currentState === nextState;
  }

  if (currentState.length !== nextState.length) {
    return false;
  }

  return currentState.every(
    (legendName, index) => legendName === nextState[index],
  );
}

export function reconcileSingleSelectionLegendState(
  allLegendNames: string[],
  selectionState: SingleSelectionLegendState,
): SingleSelectionLegendState {
  const normalizedLegendNames = normalizeLegendNames(allLegendNames);
  if (selectionState === null) {
    return null;
  }

  const effectiveSelection = getEffectiveSingleSelectionLegendNames(
    normalizedLegendNames,
    selectionState,
  );

  if (selectionState.length > 0 && effectiveSelection.length === 0) {
    return null;
  }

  if (effectiveSelection.length === normalizedLegendNames.length) {
    return null;
  }

  return effectiveSelection;
}

type GetNextSingleSelectionLegendStateArgs = {
  allLegendNames: string[];
  clickedLegendName?: string;
  currentSelectionState: SingleSelectionLegendState;
};

export function getNextSingleSelectionLegendState(
  args: GetNextSingleSelectionLegendStateArgs,
): SingleSelectionLegendState {
  const normalizedLegendNames = normalizeLegendNames(args.allLegendNames);

  if (
    !args.clickedLegendName ||
    !normalizedLegendNames.includes(args.clickedLegendName)
  ) {
    return reconcileSingleSelectionLegendState(
      normalizedLegendNames,
      args.currentSelectionState,
    );
  }

  const currentSelection = getEffectiveSingleSelectionLegendNames(
    normalizedLegendNames,
    args.currentSelectionState,
  );
  const areAllLegendItemsSelected =
    currentSelection.length === normalizedLegendNames.length;

  if (areAllLegendItemsSelected) {
    return [args.clickedLegendName];
  }

  if (currentSelection.includes(args.clickedLegendName)) {
    const nextSelection = currentSelection.filter(
      (legendName) => legendName !== args.clickedLegendName,
    );

    return nextSelection;
  }

  const nextSelection = normalizedLegendNames.filter(
    (legendName) =>
      currentSelection.includes(legendName) ||
      legendName === args.clickedLegendName,
  );

  return reconcileSingleSelectionLegendState(
    normalizedLegendNames,
    nextSelection,
  );
}

export function buildSingleSelectionLegendSelectedMap(
  allLegendNames: string[],
  selectionState: SingleSelectionLegendState,
): Record<string, boolean> | undefined {
  const normalizedLegendNames = normalizeLegendNames(allLegendNames);

  if (normalizedLegendNames.length === 0) {
    return undefined;
  }

  const effectiveSelection = getEffectiveSingleSelectionLegendNames(
    normalizedLegendNames,
    selectionState,
  );

  if (effectiveSelection.length === normalizedLegendNames.length) {
    return undefined;
  }

  const selectedLegendSet = new Set(effectiveSelection);

  return Object.fromEntries(
    normalizedLegendNames.map((legendName) => [
      legendName,
      selectedLegendSet.has(legendName),
    ]),
  );
}
