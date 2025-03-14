export function generateResponsiveFontSize(
  baseSize: number,
  minScale = 0.2,
  maxScale = 1.6,
  preferredScale = 0.25,
): string {
  const baseSizeRem = baseSize / 16;
  const minSize = baseSizeRem * minScale;
  const maxSize = baseSizeRem * maxScale;
  const preferredBase = baseSizeRem * 0.7;

  return `clamp(${minSize}rem, ${preferredScale}vw + ${preferredBase}rem, ${maxSize}rem)`;
}
