'use client';

import { CSSProperties, ReactElement } from 'react';

type LineChartLegendSelectionControlsProps = {
  filterColor?: string;
  filterTextColor?: string;
  isAllSelected: boolean;
  isSelectionEmpty: boolean;
  onSelectAll: () => void;
  onDeselectAll: () => void;
};

function getButtonStyle(
  isActive: boolean,
  filterColor: string,
  filterTextColor: string,
): CSSProperties {
  return {
    color: isActive ? filterTextColor : filterColor,
    backgroundColor: isActive ? filterColor : 'transparent',
    borderColor: filterColor,
  };
}

export default function LineChartLegendSelectionControls(
  props: LineChartLegendSelectionControlsProps,
): ReactElement {
  const {
    filterColor = '#F1B434',
    filterTextColor = '#FFFFFF',
    isAllSelected,
    isSelectionEmpty,
    onSelectAll,
    onDeselectAll,
  } = props;

  return (
    <div className="flex flex-none items-center gap-2">
      <button
        className="min-w-[110px] rounded-lg border-2 px-4 py-2 text-sm transition-colors"
        onClick={onSelectAll}
        style={getButtonStyle(isAllSelected, filterColor, filterTextColor)}
        type="button"
      >
        Alle Sensoren
      </button>
      <button
        className="min-w-[110px] rounded-lg border-2 px-4 py-2 text-sm transition-colors"
        onClick={onDeselectAll}
        style={getButtonStyle(isSelectionEmpty, filterColor, filterTextColor)}
        type="button"
      >
        Keine Sensoren
      </button>
    </div>
  );
}
