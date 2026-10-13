'use client';

import { ComponentPropsWithRef, ReactElement } from 'react';
import DatePicker from 'react-datepicker';
import WizardLabel from '@/ui/WizardLabel';
import UniversalButton from '@/ui/Buttons/UniversalButton';
import {
  calculateEndDate,
  calculateStartDate,
  getLatestAllowedDate,
} from '@/utils/dateTimeHelper';
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
  isLoading?: boolean;
};

const DATE_PICKER_PORTAL_ID = 'line-chart-date-range-picker-portal';

export function ReadOnlyDatePickerInput(
  props: ComponentPropsWithRef<'input'>,
): ReactElement {
  return <input {...props} readOnly />;
}

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
  const maximumDate = getLatestAllowedDate(fullDateRange.max);
  let nextRange = {
    min: new Date(Math.min(dateRange.min.getTime(), maximumDate.getTime())),
    max: new Date(Math.min(dateRange.max.getTime(), maximumDate.getTime())),
  };

  if (nextRange.min > nextRange.max) {
    nextRange =
      changedBoundary === 'min'
        ? {
            min: nextRange.min,
            max: new Date(
              Math.min(
                normalizeEndOfDay(nextRange.min).getTime(),
                maximumDate.getTime(),
              ),
            ),
          }
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

  if (minimumStartDate) {
    const endDateFromMinimumStart = calculateEndDate(
      extendedTimeframe,
      minimumStartDate,
      fullDateRange.max,
    );

    if (endDateFromMinimumStart && nextRange.max > endDateFromMinimumStart) {
      minimumStartDate.setDate(minimumStartDate.getDate() + 1);
    }
  }

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
    isLoading = false,
  } = props;
  const maximumDate = getLatestAllowedDate(fullDateRange.max);

  const handleMinDateChange = (date: Date | null): void => {
    if (isLoading) return;

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
    if (isLoading) return;

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
            disabled={isLoading}
            onChange={handleMinDateChange}
            portalId={DATE_PICKER_PORTAL_ID}
            wrapperClassName="w-[250px] shrink-0"
            customInput={
              <ReadOnlyDatePickerInput
                className="block h-10 w-full min-w-0 rounded-lg border-4 px-4 text-sm"
                style={inputStyle}
              />
            }
            dateFormat="yyyy-MM-dd"
            maxDate={maximumDate}
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
            disabled={isLoading}
            onChange={handleMaxDateChange}
            portalId={DATE_PICKER_PORTAL_ID}
            wrapperClassName="w-[250px] shrink-0"
            customInput={
              <ReadOnlyDatePickerInput
                className="block h-10 w-full min-w-0 rounded-lg border-4 px-4 text-sm"
                style={inputStyle}
              />
            }
            dateFormat="yyyy-MM-dd"
            maxDate={maximumDate}
            minDate={extendedDateSelection ? undefined : fullDateRange.min}
          />
        </div>
      </div>
      {extendedDateSelection && (
        <UniversalButton
          handleClick={onLoadData}
          label="Aktualisieren"
          iconName="Update"
          fontColor={filterTextColor}
        />
      )}
    </div>
  );
}
