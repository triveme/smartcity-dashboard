import { useState, useEffect } from 'react';

type UseAutoScaleFontProps = {
  minSize: number;
  maxSize: number;
  divisor: number;
};

export default function useAutoScaleFont({
  minSize,
  maxSize,
  divisor,
}: UseAutoScaleFontProps): number {
  const [fontSize, setFontSize] = useState<number>(minSize);

  useEffect(() => {
    const handleResize = (): void => {
      const containerWidth = window.innerWidth;
      const newFontSize = Math.max(
        minSize,
        Math.min(maxSize, containerWidth / divisor),
      );

      setFontSize(newFontSize);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [minSize, maxSize, divisor]);

  return fontSize;
}
