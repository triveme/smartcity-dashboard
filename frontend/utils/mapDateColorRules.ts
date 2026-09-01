import { MapDateColorRule } from '@/types';

export function getMapDateThreshold(
  rule: MapDateColorRule,
  now: Date = new Date(),
): Date {
  const reference = new Date(now);

  switch (rule.anchor) {
    case 'start_of_day':
      reference.setHours(0, 0, 0, 0);
      break;
    case 'start_of_week': {
      const daysSinceMonday = (reference.getDay() + 6) % 7;
      reference.setDate(reference.getDate() - daysSinceMonday);
      reference.setHours(0, 0, 0, 0);
      break;
    }
    case 'start_of_month':
      reference.setDate(1);
      reference.setHours(0, 0, 0, 0);
      break;
  }

  const amount =
    rule.offsetDirection === 'before' ? -rule.offsetValue : rule.offsetValue;
  switch (rule.offsetUnit) {
    case 'hour':
      reference.setHours(reference.getHours() + amount);
      break;
    case 'day':
      reference.setDate(reference.getDate() + amount);
      break;
    case 'week':
      reference.setDate(reference.getDate() + amount * 7);
      break;
    case 'month':
      reference.setMonth(reference.getMonth() + amount);
      break;
  }

  return reference;
}
