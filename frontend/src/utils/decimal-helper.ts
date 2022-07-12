export function roundDecimalPlaces(num: string | number, decimals?: number) {
  if (decimals && decimals > 0 && decimals < 6) {
    return parseFloat(Number(num).toFixed(decimals));
  }
  return parseInt(Number(num).toFixed(0));
}
