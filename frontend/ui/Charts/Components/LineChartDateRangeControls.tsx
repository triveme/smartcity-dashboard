'use client';

import { ReactElement, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import WizardLabel from '@/ui/WizardLabel';
import UniversalButton from '@/ui/Buttons/UniversalButton';
import { calculateEndDate, calculateStartDate } from '@/utils/dateTimeHelper';
import { LineChartDateRange } from '@/utils/Charts/lineChartZoom';

type LineChartDateRangeControlsProps = {
  fullDateRange: LineChartDateRange;
  minDate: Date;
  maxDate: Date;
  onDateRangeChange: (dateRange: LineChartDateRange | null) => void;
  filterColor?: string;
  filterTextColor?: string;
  extendedDateSelection: boolean;
  extendedTimeframe: string;
  onLoadData: () => Promise<void>;
};

const DATE_PICKER_PORTAL_ID = 'line-chart-date-range-picker-portal';

function normalizeStartOfDay(date: Date): Date {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
}

function normalizeEndOfDay(date: Date): Date {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(23, 59, 59, 999);
  return normalizedDate;
}

function constrainDateRange({
  dateRange,
  changedBoundary,
  extendedDateSelection,
  extendedTimeframe,
  fullDateRange,
}: {
  dateRange: LineChartDateRange;
  changedBoundary: 'min' | 'max';
  extendedDateSelection: boolean;
  extendedTimeframe: string;
  fullDateRange: LineChartDateRange;
}): LineChartDateRange {
  let nextRange = dateRange;

  if (nextRange.min > nextRange.max) {
    nextRange =
      changedBoundary === 'min'
        ? { min: nextRange.min, max: normalizeEndOfDay(nextRange.min) }
        : { min: normalizeStartOfDay(nextRange.max), max: nextRange.max };
  }

  if (!extendedDateSelection || nextRange.min >= fullDateRange.min) {
    return nextRange;
  }

  const maximumEndDate = calculateEndDate(
    extendedTimeframe,
    nextRange.min,
    fullDateRange.max,
  );

  if (!maximumEndDate || nextRange.max <= maximumEndDate) {
    return nextRange;
  }

  if (changedBoundary === 'min') {
    return { min: nextRange.min, max: maximumEndDate };
  }

  const minimumStartDate = calculateStartDate(extendedTimeframe, nextRange.max);

  return minimumStartDate
    ? { min: minimumStartDate, max: nextRange.max }
    : nextRange;
}

export default function LineChartDateRangeControls(
  props: LineChartDateRangeControlsProps,
): ReactElement {
  const {
    fullDateRange,
    minDate,
    maxDate,
    onDateRangeChange,
    filterColor = '#F1B434',
    filterTextColor = '#FFFFFF',
    extendedDateSelection,
    extendedTimeframe,
    onLoadData,
  } = props;

  const handleMinDateChange = (date: Date | null): void => {
    if (!date) {
      onDateRangeChange(null);
      return;
    }

    onDateRangeChange(
      constrainDateRange({
        dateRange: { min: normalizeStartOfDay(date), max: maxDate },
        changedBoundary: 'min',
        extendedDateSelection,
        extendedTimeframe,
        fullDateRange,
      }),
    );
  };

  const handleMaxDateChange = (date: Date | null): void => {
    if (!date) {
      onDateRangeChange(null);
      return;
    }

    onDateRangeChange(
      constrainDateRange({
        dateRange: { min: minDate, max: normalizeEndOfDay(date) },
        changedBoundary: 'max',
        extendedDateSelection,
        extendedTimeframe,
        fullDateRange,
      }),
    );
  };

  const inputStyle = {
    color: filterTextColor,
    backgroundColor: filterColor,
    border: filterColor,
    borderRadius: '6px',
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-1">
      <div className="flex min-w-[260px] flex-none items-center gap-2">
        <WizardLabel label="Startdatum" />
        <div className="flex h-14 items-center">
          <DatePicker
            startDate={minDate}
            endDate={maxDate}
            selectsStart
            selected={minDate}
            onChange={handleMinDateChange}
            portalId={DATE_PICKER_PORTAL_ID}
            wrapperClassName="w-[250px] shrink-0"
            customInput={
              <input
                className="block h-10 w-full min-w-0 rounded-lg border-4 px-4 text-sm"
                readOnly
                style={inputStyle}
              />
            }
            dateFormat="yyyy-MM-dd"
            maxDate={fullDateRange.max}
            minDate={extendedDateSelection ? undefined : fullDateRange.min}
          />
        </div>
      </div>
      <div className="flex min-w-[260px] flex-none mr-4 items-center gap-2">
        <WizardLabel label="Enddatum" />
        <div className="flex h-14 items-center">
          <DatePicker
            startDate={minDate}
            endDate={maxDate}
            selectsEnd
            selected={maxDate}
            onChange={handleMaxDateChange}
            portalId={DATE_PICKER_PORTAL_ID}
            wrapperClassName="w-[250px] shrink-0"
            customInput={
              <input
                className="block h-10 w-full min-w-0 rounded-lg border-4 px-4 text-sm"
                readOnly
                style={inputStyle}
              />
            }
            dateFormat="yyyy-MM-dd"
            maxDate={fullDateRange.max}
            minDate={extendedDateSelection ? undefined : fullDateRange.min}
          />
        </div>
      </div>
      {extendedDateSelection && (
        <UniversalButton handleClick={onLoadData} label="Historische Daten" />
      )}
    </div>
  );
}
