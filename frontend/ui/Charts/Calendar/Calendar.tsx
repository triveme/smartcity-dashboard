'use client';
import React, { CSSProperties, ReactElement, useEffect, useRef } from 'react';
import { useState } from 'react';
import { DayPicker, Locale, Matcher, type DayProps } from 'react-day-picker';
import 'react-day-picker/style.css';
import { de } from 'date-fns/locale';
import css from './Calendar.module.css';
import { CalendarData } from '@/types';
import {
  getCalendarModifiers,
  sortCalendarData,
  type SortedCalendarData,
} from '@/utils/calendarHelper';

type CalendarOptions = {
  components?: { Day?: (props: DayProps) => ReactElement };
  showOutsideDays?: boolean;
  defaultMonth?: Date;
  startMonth?: Date;
  endMonth?: Date;
  numberOfMonths?: number;
  disabled?: Matcher | Matcher[];
  modifiers?: Record<string, Matcher>;
  modifiersStyles?: Record<string, React.CSSProperties>;
  modifiersClassNames?: Record<string, string>;
  classNames?: Record<string, string>;
  locale?: Locale;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  hideNavigation?: boolean;
};
type CalendarProps = {
  data: CalendarData[];
  calendarBookedColor: string;
  calendarPrivatBookedColor: string;
  calendarOrganisationBookedColor: string;
  calendarMonthAfterCurrent: number;
  calendarMonthBeforeCurrent: number;
  calendarDisplayedMonthsCount: number;
  splitDay?: boolean;
  fontColor: string;
  height?: number;
};
type CSSVariableStyle = CSSProperties & Record<`--${string}`, string>;

export default function Calendar(props: CalendarProps): ReactElement {
  const [sortedData, setSortedData] = useState<SortedCalendarData>();
  const calendarContainerRef = useRef<HTMLDivElement>(null);

  const {
    data,
    calendarMonthAfterCurrent,
    calendarMonthBeforeCurrent,
    calendarDisplayedMonthsCount,
    calendarBookedColor,
    calendarPrivatBookedColor,
    calendarOrganisationBookedColor,
    splitDay,
    fontColor,
    height,
  } = props;

  const today = new Date();
  const currYear = today.getFullYear();
  const currMonth = today.getMonth();

  //CSS variables for dynamic styling
  const calendarVars: CSSVariableStyle = {
    '--calendar-booked-color': calendarBookedColor,
    '--calendar-organisation-color': calendarOrganisationBookedColor,
    '--calendar-privat-color': calendarPrivatBookedColor,
    '--calendar-font-color': fontColor,
  };

  useEffect(() => {
    setSortedData(sortCalendarData(data, splitDay));
  }, [data, splitDay]);

  const calendarModifiers = getCalendarModifiers(sortedData);

  const options: CalendarOptions = {
    showOutsideDays: false,
    locale: de,
    weekStartsOn: 1,
    defaultMonth: new Date(currYear, currMonth),
    startMonth: new Date(currYear, currMonth - calendarMonthBeforeCurrent),
    endMonth: new Date(currYear, currMonth + calendarMonthAfterCurrent),
    numberOfMonths: calendarDisplayedMonthsCount,
    disabled: [{ before: today }],
    modifiers: calendarModifiers,
    modifiersClassNames: {
      today: css.today,
      booked: css.booked,
      organisationsBook: css.organisation,
      privatBook: css.privat,
      bookedPrivat: css.bookedPrivat,
      bookedOrganisation: css.bookedOrganisation,
      privatOrganisation: css.privatOrganisation,
      allBookings: css.allBookings,
      multipleBooked: css.multipleBooked,
      multiplePrivat: css.multiplePrivat,
      multipleOrganisation: css.multipleOrganisation,
    },
    hideNavigation: true,
  };

  return (
    <div
      className={
        height === 0 ? 'relative w-full' : 'relative h-full overflow-y-auto'
      }
      ref={calendarContainerRef}
    >
      <div className={css.calendar} style={calendarVars}>
        <DayPicker {...options} />
      </div>
    </div>
  );
}
