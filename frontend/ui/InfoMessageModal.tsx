import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { CSSProperties, ReactElement, useEffect, useRef } from 'react';

type InfoMessageModalProps = {
  isVisible: boolean;
  headline: string;
  message: string;
  infoModalBackgroundColor: string;
  infoModalFontColor: string;
  informationTextFontColor: string;
  informationTextFontSize: string;
  onClose: () => void;
};

export default function InfoMessageModal({
  isVisible,
  headline,
  message,
  infoModalBackgroundColor,
  infoModalFontColor,
  informationTextFontColor,
  informationTextFontSize,
  onClose,
}: InfoMessageModalProps): ReactElement | null {
  const modalRef = useRef<HTMLDivElement>(null);

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
  };

  const fontStyle: CSSProperties = {
    color: informationTextFontColor ?? '#FFF',
    fontSize: informationTextFontSize,
    height: '90%',
  };

  return (
    <div className="fixed inset-0 z-[999] bg-[#1E1E1E] bg-opacity-70 flex flex-col justify-center items-center">
      <div
        ref={modalRef}
        className="relative rounded-lg p-6 shadow-md w-[90%] md:w-1/2 h-[90vh] md:h-4/6 overflow-y-auto"
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
          className={`h-5/6 w-full ql-editor no-border-ql-editor overflow-y-auto`}
          dangerouslySetInnerHTML={{
            __html: message || '',
          }}
        />
      </div>
    </div>
  );
}
