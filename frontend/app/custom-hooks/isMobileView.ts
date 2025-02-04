import { useState, useEffect } from 'react';

export const determineIsMobileView = (): boolean => {
  const [isMobileView, setIsMobileView] = useState<boolean>(
    window.innerWidth <= 768,
  );

  useEffect(() => {
    const handleResize = (): void => setIsMobileView(window.innerWidth <= 1024);

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobileView;
};
