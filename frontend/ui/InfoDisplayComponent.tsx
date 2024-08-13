import { ReactElement } from 'react';
import DashboardIcons from './Icons/DashboardIcon';

type InfoDisplayComponentProps = {
  headline: string;
  value: string;
  icon?: string;
  iconColor?: string;
};

export default function InfoDisplayComponent(
  props: InfoDisplayComponentProps,
): ReactElement {
  const { headline, value, icon, iconColor } = props;

  return (
    <div className="flex flex-col items-center p-4 bg-[#2B3244] text-rose-800 rounded-lg">
      <div className="text-sm font-bold">{headline}</div>
      <div className="text-lg flex items-center">
        {icon && iconColor && (
          <span className="mr-2">
            <DashboardIcons iconName={icon} color={iconColor} />
          </span>
        )}
        {value}
      </div>
    </div>
  );
}
