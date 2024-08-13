import { Dashboard, GroupingElement } from '@/types';

export function reorderList(
  list: GroupingElement[],
  startIndex: number,
  endIndex: number,
): GroupingElement[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

export function reorderDashboardList(
  list: Dashboard[],
  startIndex: number,
  endIndex: number,
): Dashboard[] {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}
