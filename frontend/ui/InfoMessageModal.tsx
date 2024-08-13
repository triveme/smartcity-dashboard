import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ReactElement, useEffect, useRef } from 'react';

type InfoMessageModalProps = {
  isVisible: boolean;
  headline: string;
  message: string;
  onClose: () => void;
};

export default function InfoMessageModal({
  isVisible,
  headline,
  message,
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

  return (
    <div className="fixed z-50 inset-0 bg-[#1E1E1E] bg-opacity-70 flex flex-col justify-center items-center">
      <div
        ref={modalRef}
        className="rounded-lg bg-white text-black p-6 shadow-md w-1/2"
      >
        <div className="flex items-center mb-4">
          <FontAwesomeIcon
            icon={faExclamationCircle}
            size="lg"
            className="text-black mr-3"
          />
          <h2 className="text-xl">{headline}</h2>
        </div>
        <span className="text-justify">{message}</span>
      </div>
    </div>
  );
}
