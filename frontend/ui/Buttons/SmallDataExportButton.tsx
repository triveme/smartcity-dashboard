'use client';

import { ReactElement, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import DashboardIcons from '../Icons/DashboardIcon';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import { downloadCSV } from '@/utils/downloadHelper';

type SmallDataExportButtonProps = {
  id: string;
  type: string;
  widgetPrimaryColor?: string;
  widgetFontColor?: string;
};

export default function SmallDataExportButton(
  props: SmallDataExportButtonProps,
): ReactElement {
  const { id, type, widgetPrimaryColor, widgetFontColor } = props;
  const { openSnackbar } = useSnackbar();
  const [isDisabled, setIsDisabled] = useState(false);

  const widgetStyle = {
    backgroundColor: widgetPrimaryColor ?? '#3D4760',
    color: widgetFontColor || '#FFF',
  };

  const auth = useAuth();
  const accessToken = auth.user?.access_token || '';

  const handleDownloadCSV = async (): Promise<void> => {
    setIsDisabled(true);
    await downloadCSV(accessToken, id, type, openSnackbar);
    setTimeout(() => setIsDisabled(false), 5000);
  };

  return (
    <button
      style={{ color: widgetStyle.color }}
      onClick={handleDownloadCSV}
      disabled={isDisabled}
    >
      <DashboardIcons
        iconName="Download"
        color={`${widgetStyle.color}`}
        size="lg"
      />
    </button>
  );
}
