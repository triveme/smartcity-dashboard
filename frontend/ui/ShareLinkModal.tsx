'use client';

import React, {
  CSSProperties,
  ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

type ShareLinkModalProps = {
  isVisible: boolean;
  sharingUrl: string;
  modalStyle: CSSProperties;
  onClose: () => void;
};

export default function ShareLinkModal({
  isVisible,
  sharingUrl,
  modalStyle,
  onClose,
}: ShareLinkModalProps): ReactElement | null {
  const [isCopied, setIsCopied] = useState(false);
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

  const handleCopyClick = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(sharingUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="fixed z-50 inset-0 bg-[#1E1E1E] bg-opacity-70 flex flex-col justify-center items-center">
      <div
        ref={modalRef}
        className="rounded-lg p-6 shadow-md w-1/2"
        style={modalStyle}
      >
        <div className="text-xl font-bold mb-4">Link teilen</div>
        <div className="flex items-center h-14 border-4 rounded-lg gap-x-4 mb-4">
          <input
            type="text"
            value={sharingUrl}
            readOnly
            className="p-4 text-base h-full w-full"
            style={modalStyle}
          />
          <button
            onClick={handleCopyClick}
            className="p-2 mr-2 rounded"
            style={modalStyle}
          >
            <FontAwesomeIcon icon={faCopy} />
          </button>
        </div>
        {isCopied && <div className="text-sm">Link kopiert!</div>}
      </div>
    </div>
  );
}
