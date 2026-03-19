'use client';

import { ReactElement, useEffect } from 'react';
import { createPortal } from 'react-dom';

type ImageLightboxProps = {
  src: string | null;
  alt?: string;
  onClose: () => void;
  overlayBackgroundColor?: string;
  panelBackgroundColor?: string;
  buttonTextColor?: string;
};

export default function ImageLightbox({
  src,
  alt,
  onClose,
  overlayBackgroundColor = 'transparent',
  panelBackgroundColor = '#FFFFFF',
  buttonTextColor = '#2563EB',
}: ImageLightboxProps): ReactElement | null {
  useEffect(() => {
    if (!src) return;
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [src, onClose]);

  if (!src || typeof document === 'undefined') return null;

  const lightbox = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      style={{ backgroundColor: overlayBackgroundColor }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt ? `Bildansicht: ${alt}` : 'Bildansicht'}
    >
      <div
        className="flex flex-col items-center gap-4 rounded-lg"
        style={{ backgroundColor: panelBackgroundColor, padding: '20px' }}
      >
        <img
          src={src}
          alt={alt || 'Bild'}
          className="max-h-[75vh] max-w-[85vw] object-contain"
          onClick={(event): void => event.stopPropagation()}
        />
        <button
          type="button"
          className="px-4 py-1 text-sm font-semibold"
          style={{ backgroundColor: 'transparent', color: buttonTextColor }}
          onClick={(event): void => {
            event.stopPropagation();
            onClose();
          }}
        >
          Schließen
        </button>
      </div>
    </div>
  );

  return createPortal(lightbox, document.body);
}
