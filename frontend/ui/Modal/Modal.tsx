'use client';

import { CorporateInfo } from '@/types';
import type React from 'react';
import { CSSProperties, useEffect } from 'react';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  ciColors: CorporateInfo;
}

const Modal = ({ onClose, children, ciColors }: ModalProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    };
  }, [onClose]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.currentTarget === event.target) {
      onClose();
    }
  };

  const modalStyle: CSSProperties = {
    height: 'auto',
    backgroundColor: ciColors.panelPrimaryColor ?? '#3D4760',
    borderRadius: ciColors.panelBorderRadius,
    borderWidth: ciColors.panelBorderSize,
    borderColor: ciColors.panelBorderColor,
    color: ciColors.panelFontColor,
  };

  return (
    <div
      className="fixed z-50 inset-0 bg-[#1E1E1E] bg-opacity-70 flex flex-col justify-center items-center"
      onClick={handleBackdropClick}
    >
      <div
        className="p-8 rounded-lg w-1/3 flex flex-col justify-between"
        style={modalStyle}
      >
        {children}
      </div>
    </div>
  );
};
export default Modal;
