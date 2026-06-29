'use client';

import { ReactElement } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import WizardLabel from '@/ui/WizardLabel';

type DateRange = {
  min: Date;
  max: Date;
};

type LineChartDateRangeControlsProps = {
  fullDateRange: DateRange;
  minDate: Date;
  maxDate: Date;
  onMinDateChange: (date: Date | null) => void;
  onMaxDateChange: (date: Date | null) => void;
  filterColor?: string;
  filterTextColor?: string;
};

const DATE_PICKER_PORTAL_ID = 'line-chart-date-range-picker-portal';

export default function LineChartDateRangeControls(
  props: LineChartDateRangeControlsProps,
): ReactElement {
  const {
    fullDateRange,
    minDate,
    maxDate,
    onMinDateChange,
    onMaxDateChange,
    filterColor = '#F1B434',
    filterTextColor = '#FFFFFF',
  } = props;

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
            onChange={onMinDateChange}
            portalId={DATE_PICKER_PORTAL_ID}
            wrapperClassName="w-[250px] shrink-0"
            customInput={
              <input
                className="block h-10 w-full min-w-0 rounded-lg border-4 px-4 text-sm"
                readOnly
                style={inputStyle}
              />
            }
            dateFormat="yyyy-dd-MM"
            maxDate={fullDateRange.max}
            minDate={fullDateRange.min}
          />
        </div>
      </div>
      <div className="flex min-w-[260px] flex-none items-center gap-2">
        <WizardLabel label="Enddatum" />
        <div className="flex h-14 items-center">
          <DatePicker
            startDate={minDate}
            endDate={maxDate}
            selectsEnd
            selected={maxDate}
            onChange={onMaxDateChange}
            portalId={DATE_PICKER_PORTAL_ID}
            wrapperClassName="w-[250px] shrink-0"
            customInput={
              <input
                className="block h-10 w-full min-w-0 rounded-lg border-4 px-4 text-sm"
                readOnly
                style={inputStyle}
              />
            }
            dateFormat="yyyy-dd-MM"
            maxDate={fullDateRange.max}
            minDate={fullDateRange.min}
          />
        </div>
      </div>
    </div>
  );
}
