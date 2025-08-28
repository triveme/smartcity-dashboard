import { ReactElement } from 'react';
import DashboardIcons from '../Icons/DashboardIcon';

type GenericButtonProps = {
  label: string;
  handleClick: () => void;
  fontColor?: string;
  icon?: string;
  backgroundColor?: string;
};

export default function GenericButton(props: GenericButtonProps): ReactElement {
  const { label, handleClick, fontColor, icon, backgroundColor } = props;

  const buttonStyle = {
    color: fontColor ?? 'bg-[#FFFFFF]',
    backgroundColor: backgroundColor || '#91D9FF',
  };

  return (
    <div className="py-4 flex justify-center items-center content-center">
      <button
        style={buttonStyle}
        className="p-4 h-10 w-full rounded-lg flex justify-center items-center content-center hover:bg-[#2B3244] transition-colors ease-in-out duration-300"
        onClick={handleClick}
      >
        {icon && (
          <span style={{ display: 'inline-block' }} className="mr-2">
            <DashboardIcons iconName={icon} color={fontColor} size="lg" />
          </span>
        )}
        <div style={{ whiteSpace: 'nowrap' }}>{label}</div>
      </button>
    </div>
  );
}
