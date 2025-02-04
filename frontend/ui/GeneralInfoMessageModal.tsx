import { determineIsMobileView } from '@/app/custom-hooks/isMobileView';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { CSSProperties, ReactElement, useEffect, useRef } from 'react';

type GeneralInfoMessageModalProps = {
  isVisible: boolean;
  headline: string;
  message: string;
  onClose: () => void;
  infoModalBackgroundColor: string;
  infoModalFontColor: string;
};

export default function GeneralInfoMessageModal({
  isVisible,
  headline,
  message,
  onClose,
  infoModalBackgroundColor,
  infoModalFontColor,
}: GeneralInfoMessageModalProps): ReactElement | null {
  const modalRef = useRef<HTMLDivElement>(null);
  const isMobileView = determineIsMobileView();

  const fontStyle = {
    color: infoModalFontColor,
    height: '90%',
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const infoModalStyle: CSSProperties = {
    backgroundColor: infoModalBackgroundColor,
    color: infoModalFontColor,
    width: isMobileView ? '90%' : '50%',
    maxHeight: isMobileView ? '80vh' : '70vh',
  };

  return (
    <div className="fixed w-full h-full z-50 inset-0 bg-[#1E1E1E] bg-opacity-70 flex flex-col justify-center items-center">
      <div
        ref={modalRef}
        className="rounded-lg p-6 shadow-md w-1/2 h-4/6"
        style={infoModalStyle}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FontAwesomeIcon
              icon={faExclamationCircle}
              size="lg"
              className="mr-3"
            />
            <h2 className="text-xl">{headline}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:opacity-70"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div
          style={fontStyle}
          className="h-5/6 w-full ql-editor no-border-ql-editor text-lg overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: message || '' }}
        ></div>
      </div>
    </div>
  );
}
