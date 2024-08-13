import { ReactElement } from 'react';
import DashboardIcons from '../Icons/DashboardIcon';

type CollapseButtonProps = {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export default function CollapseButton(
  props: CollapseButtonProps,
): ReactElement {
  const { isOpen, setIsOpen } = props;

  const handleButtonClick = (): void => {
    setIsOpen(!isOpen);
  };

  return (
    <button
      onClick={handleButtonClick}
      className="p-4 bg-[#91D9FF] hover:bg-[#82C3E5] h-8 w-8 rounded-lg flex justify-center items-center transition-colors ease-in-out duration-300"
    >
      <DashboardIcons
        iconName="ChevronUp"
        color="#2B3244"
        className={`transform ${
          isOpen ? 'rotate-0' : 'rotate-180'
        } transition-transform ease-in-out duration-300`}
      />
    </button>
  );
}
