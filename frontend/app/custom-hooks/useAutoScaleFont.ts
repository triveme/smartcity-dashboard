import { useState, useEffect } from 'react';

type UseAutoScaleFontProps = {
  minSize: number;
  maxSize: number;
  divisor: number;
  containerRef?: React.RefObject<HTMLElement>; // Optional reference to container
};

export default function useAutoScaleFont({
  minSize,
  maxSize,
  divisor,
  containerRef, // Pass a container ref if available
}: UseAutoScaleFontProps): number {
  const [fontSize, setFontSize] = useState<number>(minSize);

  useEffect(() => {
    const handleResize = (): void => {
      // Use container width if available, otherwise fallback to window width
      const containerWidth = containerRef?.current
        ? containerRef.current.offsetWidth
        : window.innerWidth;

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
  }, [minSize, maxSize, divisor, containerRef]);

  return fontSize;
}
