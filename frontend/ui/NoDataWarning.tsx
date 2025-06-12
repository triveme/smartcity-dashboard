import { ReactElement } from 'react';

import DashboardIcons from '@/ui/Icons/DashboardIcon';

type NoDataWarningProps = {
  iconColor: string;
  fontColor: string;
};

export default function NoDataWarning(props: NoDataWarningProps): ReactElement {
  const { iconColor, fontColor } = props;

  return (
    <div
      className={`w-full h-full justify-center content-center flex items-center gap-4`}
    >
      <DashboardIcons iconName={'Attention'} color={iconColor} size="sm" />
      <div className="text-lg font-bold" style={{ color: fontColor }}>
        Keine Datenverbindung{' '}
      </div>
    </div>
  );
}
