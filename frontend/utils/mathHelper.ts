export function roundToDecimal(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function calculateAverage(arr: number[]): number {
  if (arr.length === 0) {
    // Handle the case where the array is empty to avoid division by zero.
    throw new Error('Cannot calculate the average of an empty array');
  }

  const sum = arr.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0,
  );
  const average = sum / arr.length;
  return average;
}

export function calculateDeviationPercentage(
  currentValue: number,
  averageValue: number,
): number {
  // Ensure that the averageValue is not zero to avoid division by zero.
  if (averageValue === 0) {
    throw new Error('Average value cannot be zero');
  }

  // Calculate the deviation in percentage.
  const deviationPercentage =
    ((currentValue - averageValue) / averageValue) * 100;

  return deviationPercentage;
}
