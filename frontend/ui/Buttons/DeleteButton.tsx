import { ReactElement, useState } from 'react';
import DashboardIcons from '../Icons/DashboardIcon';

type DeleteButtonProps = {
  onDeleteClick: () => void;
};

export default function DeleteButton(props: DeleteButtonProps): ReactElement {
  const { onDeleteClick } = props;
  const [isDeleting, setIsDeleting] = useState(false);

  const onClick = async (): Promise<void> => {
    setIsDeleting(true); // Disable the button
    try {
      await onDeleteClick();
    } finally {
      setIsDeleting(false); // Re-enable the button regardless of success or failure
    }
  };

  return (
    <div className="text-white">
      <button
        className={`p-2 bg-[#FA4141] hover:bg-[#DC3939] h-19 w-48 rounded-lg flex justify-evenly items-center align-middle content-center ${
          isDeleting ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={onClick}
        disabled={isDeleting}
      >
        <DashboardIcons iconName="Trashcan" color="white" />
        <div>Löschen</div>
      </button>
    </div>
  );
}
