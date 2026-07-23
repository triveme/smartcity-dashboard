import { extendedTimeframeEnum } from '@/types';

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
export const calculateEndDate = (
  value: extendedTimeframeEnum | string,
  minDate: Date,
  fullDateRangeMax: Date,
): Date | null => {
  const nextDate = new Date(minDate);

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
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case '':
    default:
      return null;
  }

  const endDate = nextDate > fullDateRangeMax ? fullDateRangeMax : nextDate;
  return normalizeEndOfDay(endDate);
};

export const calculateStartDate = (
  value: extendedTimeframeEnum | string,
  maxDate: Date,
) => {
  const nextDate = new Date(maxDate);

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
      nextDate.setMonth(nextDate.getMonth() - 1);
      break;

    case '':
    default:
      return null;
  }
  return normalizeStartOfDay(nextDate);
};
