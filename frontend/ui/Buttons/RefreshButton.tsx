import { ReactElement, useState } from 'react';
import DashboardIcons from '../Icons/DashboardIcon';

type RefreshButtonProps = {
  handleClick: () => void;
  fontColor: string;
  hoverColor: string;
  backgroundColor: string;
};

export default function RefreshButton(props: RefreshButtonProps): ReactElement {
  const { handleClick, fontColor, hoverColor, backgroundColor } = props;
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = (): void => {
    setIsHovered(true);
  };

  const handleMouseLeave = (): void => {
    setIsHovered(false);
  };

  const buttonStyle = {
    backgroundColor: backgroundColor,
    ...(isHovered && {
      backgroundColor: hoverColor,
    }),
    color: fontColor,
  };

  return (
    <div>
      <button
        className="p-2 h-16 w-16 rounded-lg flex justify-evenly items-center align-middle content-center transition-colors ease-in-out duration-300"
        onClick={handleClick}
        style={buttonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <DashboardIcons iconName={'Update'} color={fontColor} />
      </button>
    </div>
  );
}
