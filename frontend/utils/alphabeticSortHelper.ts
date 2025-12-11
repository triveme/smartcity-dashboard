const alphabeticSortHelper = (
  sensors: string[] | number[],
): string[] | number[] => {
  if (sensors.length === 0) return sensors;

  const allStings = sensors.every((item) => typeof item === 'string');

  if (allStings) {
    const collator = new Intl.Collator('de', {
      sensitivity: 'base',
      numeric: true,
    });
    const sorted = sensors.slice().sort(collator.compare);

    return sorted;
  }
  const sorted = sensors.slice().sort((a, b) => a - b);
  return sorted;
};

export default alphabeticSortHelper;
