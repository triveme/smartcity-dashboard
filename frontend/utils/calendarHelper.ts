import { CalendarData } from '@/types';

export type CalendarCategory = 'booked' | 'privat' | 'organisation';
export type NormalizedCalendarEntry = {
  id: string;
  date: Date;
  name: string;
  usage: string;
  category: CalendarCategory;
};
export type SortedCalendarData = Record<
  CalendarCategory,
  NormalizedCalendarEntry[]
>;
export type CalendarModifiers = Record<string, Date[]>;
const CALENDAR_CATEGORIES: CalendarCategory[] = [
  'booked',
  'privat',
  'organisation',
];

function getDateKey(date: Date): string {
  return [date.getFullYear(), date.getMonth(), date.getDate()].join('-');
}

export function getEntriesForDate(
  sortedData: SortedCalendarData | undefined,
  date: Date,
): NormalizedCalendarEntry[] {
  if (!sortedData) return [];
  const dateKey = getDateKey(date);
  return CALENDAR_CATEGORIES.flatMap((category) =>
    sortedData[category].filter((entry) => getDateKey(entry.date) === dateKey),
  );
}

export function getCalendarModifiers(
  sortedData?: SortedCalendarData,
): CalendarModifiers {
  const modifiers: CalendarModifiers = {
    booked: [],
    privatBook: [],
    organisationsBook: [],
    bookedPrivat: [],
    bookedOrganisation: [],
    privatOrganisation: [],
    allBookings: [],
    multipleBooked: [],
    multiplePrivat: [],
    multipleOrganisation: [],
  };
  if (!sortedData) return modifiers;
  const byDate = new Map<string, Set<CalendarCategory>>(),
    counts = new Map<string, number>(),
    dates = new Map<string, Date>();
  CALENDAR_CATEGORIES.forEach((category) =>
    sortedData[category].forEach((entry) => {
      const key = getDateKey(entry.date);
      dates.set(key, entry.date);
      counts.set(key, (counts.get(key) ?? 0) + 1);
      const set = byDate.get(key) ?? new Set<CalendarCategory>();
      set.add(category);
      byDate.set(key, set);
    }),
  );
  byDate.forEach((set, key) => {
    const date = dates.get(key);
    if (!date) return;
    const entryCount = counts.get(key) ?? 0;
    const b = set.has('booked'),
      p = set.has('privat'),
      o = set.has('organisation');
    if (set.size === 1) {
      if (entryCount > 1) {
        if (b) modifiers.multipleBooked.push(date);
        if (p) modifiers.multiplePrivat.push(date);
        if (o) modifiers.multipleOrganisation.push(date);
      } else {
        if (b) modifiers.booked.push(date);
        if (p) modifiers.privatBook.push(date);
        if (o) modifiers.organisationsBook.push(date);
      }
    } else if (set.size === 3) modifiers.allBookings.push(date);
    else if (b && p) modifiers.bookedPrivat.push(date);
    else if (b && o) modifiers.bookedOrganisation.push(date);
    else if (p && o) modifiers.privatOrganisation.push(date);
  });
  return modifiers;
}

export function sortCalendarData(
  data: CalendarData[],
  splitDay = false,
): SortedCalendarData {
  const sortedData: SortedCalendarData = {
    booked: [],
    privat: [],
    organisation: [],
  };
  const map: Record<string, CalendarCategory> = {
    'Nutzung: Gebucht': 'booked',
    'Nutzung: Privat': 'privat',
    'Nutzung: Verein': 'organisation',
  };
  const processedDateKeys = new Set<string>();

  data.forEach((entry) => {
    const usageKey = String(entry.usage.value);
    const category = map[usageKey] as CalendarCategory | undefined;
    const date = new Date(entry.date.value);
    if (!category || Number.isNaN(date.getTime())) return;

    const dateKey = getDateKey(date);
    // In collapsed mode we intentionally keep only the first entry per day.
    if (!splitDay && processedDateKeys.has(dateKey)) return;

    processedDateKeys.add(dateKey);
    sortedData[category].push({
      id: entry.id,
      date,
      name: String(entry.name.value),
      usage: String(entry.usage.value),
      category,
    });
  });
  Object.values(sortedData).forEach((entries) =>
    entries.sort((a, b) => a.date.getTime() - b.date.getTime()),
  );
  return sortedData;
}
