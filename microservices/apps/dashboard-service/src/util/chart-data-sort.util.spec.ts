import { sortFlattenedTimeSeriesData } from './chart-data-sort.util';

describe('Internal CSV year filtering', () => {
  const rows = [
    { Jahr: 2023, Value: 1 },
    { Jahr: 2024, Value: 2 },
    { Jahr: '2025', Value: 3 },
    { Jahr: 2026, Value: 4 },
    { Jahr: '2027', Value: 5 },
    { Jahr: '', Value: 6 },
    { Jahr: 'invalid', Value: 7 },
    { Value: 8 },
  ];

  it.each([false, true])(
    'includes boundary years with reversed bounds: %s',
    (reversed) => {
      const from = '2024-06-01T12:00:00.000Z';
      const to = '2026-06-01T12:00:00.000Z';

      expect(
        sortFlattenedTimeSeriesData(
          rows,
          'internal',
          [],
          reversed ? to : from,
          reversed ? from : to,
        ),
      ).toEqual(rows.slice(1, 4));
    },
  );
});
