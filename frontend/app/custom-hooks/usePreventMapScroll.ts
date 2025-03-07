import { useEffect, useRef, RefObject } from 'react';

export function usePreventMapScroll(): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let isScrolling = false;
    let startY = 0;

    const preventWheel = (e: WheelEvent): void => {
      e.stopPropagation();
    };

    const preventTouch = (e: TouchEvent): void => {
      if (e.touches.length !== 1) return;
      startY = e.touches[0].pageY;
      isScrolling = true;
      e.preventDefault(); // Prevent default only when starting to scroll
    };

    const handleTouchMove = (e: TouchEvent): void => {
      if (!isScrolling || e.touches.length !== 1) return;

      const currentY = e.touches[0].pageY;
      const deltaY = currentY - startY;

      if (
        (element.scrollTop === 0 && deltaY > 0) ||
        (element.scrollHeight - element.scrollTop === element.clientHeight &&
          deltaY < 0)
      ) {
        e.preventDefault(); // Prevent overscroll
      }

      element.scrollTop -= deltaY;
      startY = currentY;
    };

    const endTouch = (): void => {
      isScrolling = false;
    };

    element.addEventListener('wheel', preventWheel, { passive: false });
    element.addEventListener('touchstart', preventTouch, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', endTouch);

    return () => {
      element.removeEventListener('wheel', preventWheel);
      element.removeEventListener('touchstart', preventTouch);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', endTouch);
    };
  }, []);

  return ref;
}
