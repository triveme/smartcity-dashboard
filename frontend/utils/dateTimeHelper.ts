import { timeframeEnum } from '@/types';

const normalizeStartOfDay = (date: Date): Date => {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
};

const normalizeEndOfDay = (date: Date): Date => {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(23, 59, 59, 999);
  return normalizedDate;
};

export const getLatestAllowedDate = (fullDateRangeMax: Date): Date =>
  new Date(Math.min(fullDateRangeMax.getTime(), Date.now()));

export const shiftDateByMonths = (date: Date, months: number): Date => {
  const shiftedDate = new Date(date);
  const originalDay = shiftedDate.getDate();
  shiftedDate.setDate(1);
  shiftedDate.setMonth(shiftedDate.getMonth() + months);

  const lastDayOfMonth = new Date(shiftedDate);
  lastDayOfMonth.setMonth(lastDayOfMonth.getMonth() + 1, 0);
  shiftedDate.setDate(Math.min(originalDay, lastDayOfMonth.getDate()));

  return shiftedDate;
};

export const calculateEndDate = (
  value: timeframeEnum | string,
  minDate: Date,
  fullDateRangeMax: Date,
): Date | null => {
  let nextDate = new Date(minDate);

  switch (value) {
    case 'day':
      nextDate.setDate(nextDate.getDate());
      break;
    case 'day2':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'day3':
      nextDate.setDate(nextDate.getDate() + 2);
      break;

    case 'week':
      nextDate.setDate(nextDate.getDate() + 6);
      break;

    case 'week2':
      nextDate.setDate(nextDate.getDate() + 13);
      break;

    case 'week3':
      nextDate.setDate(nextDate.getDate() + 20);
      break;

    case 'month':
      nextDate = shiftDateByMonths(nextDate, 1);
      break;
    case 'quarter':
      nextDate = shiftDateByMonths(nextDate, 3);
      break;
    case 'year':
      nextDate = shiftDateByMonths(nextDate, 12);
      break;
    case 'year2':
      nextDate = shiftDateByMonths(nextDate, 24);
      break;
    case 'year3':
      nextDate = shiftDateByMonths(nextDate, 36);
      break;
    case '':
    default:
      return null;
  }

  return new Date(
    Math.min(
      normalizeEndOfDay(nextDate).getTime(),
      getLatestAllowedDate(fullDateRangeMax).getTime(),
    ),
  );
};

export const calculateStartDate = (
  value: timeframeEnum | string,
  maxDate: Date,
) => {
  let nextDate = new Date(maxDate);

  switch (value) {
    case 'day':
      nextDate.setDate(nextDate.getDate());
      break;
    case 'day2':
      nextDate.setDate(nextDate.getDate() - 1);
      break;
    case 'day3':
      nextDate.setDate(nextDate.getDate() - 2);
      break;

    case 'week':
      nextDate.setDate(nextDate.getDate() - 6);
      break;
    case 'week2':
      nextDate.setDate(nextDate.getDate() - 13);
      break;
    case 'week3':
      nextDate.setDate(nextDate.getDate() - 20);
      break;

    case 'month':
      nextDate = shiftDateByMonths(nextDate, -1);
      break;
    case 'quarter':
      nextDate = shiftDateByMonths(nextDate, -3);
      break;
    case 'year':
      nextDate = shiftDateByMonths(nextDate, -12);
      break;
    case 'year2':
      nextDate = shiftDateByMonths(nextDate, -24);
      break;
    case 'year3':
      nextDate = shiftDateByMonths(nextDate, -36);
      break;

    case '':
    default:
      return null;
  }
  return normalizeStartOfDay(nextDate);
};
