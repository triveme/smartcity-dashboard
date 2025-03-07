'use client';

import { ReactElement, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import DashboardIcons from '../Icons/DashboardIcon';
import { useQuery } from '@tanstack/react-query';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage } from '@/utils/tenantHelper';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import { downloadCSV } from '@/utils/downloadHelper';

type SmallDataExportButtonProps = {
  id: string;
  type: string;
};

export default function SmallDataExportButton(
  props: SmallDataExportButtonProps,
): ReactElement {
  const { id, type } = props;
  const tenant = getTenantOfPage();
  const { openSnackbar } = useSnackbar();
  const [isDisabled, setIsDisabled] = useState(false);

  const { data } = useQuery({
    queryKey: ['corporate-info'],
    queryFn: () => getCorporateInfosWithLogos(tenant),
    enabled: false,
  });

  const widgetStyle = {
    backgroundColor: data?.widgetPrimaryColor ?? '#3D4760',
    color: data?.widgetFontColor || '#FFF',
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
