import React, { ReactElement } from 'react';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import DashboardIcons from './Icons/DashboardIcon';

type SnackBarProps = {
  id: number;
  message: string;
  status: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
};

export default function SnackBar(props: SnackBarProps): ReactElement {
  const { message, status, onClose, id } = props;
  const { snackbars } = useSnackbar();

  const getColor = (status: SnackBarProps['status']): string => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
      default:
        return 'bg-gray-500';
    }
  };

  // Find the index of the current snackbar
  const index = snackbars.findIndex((snackbar) => snackbar.id === id);

  // Calculate position based on the index
  const bottomPosition = 5 + index * 60; //

  return (
    <div
      className={`fixed flex justify-between items-center bottom-${bottomPosition} right-5 p-2
      ${getColor(status)}
      text-white rounded-lg left-1/2 w-fit`}
      style={{
        bottom: `${bottomPosition}px`,
        transform: 'translate(-50%)',
        zIndex: 100,
      }}
    >
      {message}
      <button
        onClick={onClose}
        className="ml-2 cursor-pointer bg-transparent border-none justify-between"
      >
        <DashboardIcons iconName="XMark" color="white" />
      </button>
    </div>
  );
}
