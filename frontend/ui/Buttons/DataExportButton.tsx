'use client';

import { ReactElement, useState, CSSProperties } from 'react';
import DashboardIcons from '../Icons/DashboardIcon';
import { useQuery } from '@tanstack/react-query';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage } from '@/utils/tenantHelper';
import React from 'react';
import { useAuth } from 'react-oidc-context';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import { downloadCSV } from '@/utils/downloadHelper';

type DataExportButtonProps = {
  id: string;
  type: string;
  menuStyle?: CSSProperties;
};

export default function DataExportButton(
  props: DataExportButtonProps,
): ReactElement {
  const { id, type, menuStyle } = props;
  const auth = useAuth();
  const accessToken = auth.user?.access_token || '';
  const tenant = getTenantOfPage();
  const { openSnackbar } = useSnackbar();
  const [isDisabled, setIsDisabled] = useState(false);

  const { data } = useQuery({
    queryKey: ['corporate-info'],
    queryFn: () => getCorporateInfosWithLogos(tenant),
    enabled: false,
  });

  const downloadButtonStyle = {
    backgroundColor: data?.headerPrimaryColor || '#2B3244',
    color: data?.headerFontColor || 'FFF',
    fontSize: '1rem',
  };

  const handleDownloadCSV = async (): Promise<void> => {
    setIsDisabled(true);
    await downloadCSV(accessToken, id, type, openSnackbar);
    setTimeout(() => setIsDisabled(false), 5000);
  };

  return (
    <div>
      <button
        className="p-4 h-10 w-38 rounded-lg flex justify-center items-center"
        onClick={handleDownloadCSV}
        style={menuStyle ? menuStyle : downloadButtonStyle}
        disabled={isDisabled}
      >
        <div className="flex items-center">
          <DashboardIcons
            iconName="Download"
            color={menuStyle ? menuStyle.color : downloadButtonStyle.color}
          />
          <div className="ml-2 hidden sm:block">Datenexport</div>
        </div>
      </button>
    </div>
  );
}
