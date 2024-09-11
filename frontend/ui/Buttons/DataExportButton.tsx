'use client';
import { ReactElement } from 'react';
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
};

export default function DataExportButton(
  props: DataExportButtonProps,
): ReactElement {
  const { id, type } = props;
  const auth = useAuth();
  const accessToken = auth.user?.access_token || '';
  const tenant = getTenantOfPage();
  const { openSnackbar } = useSnackbar();

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
    await downloadCSV(accessToken, id, type, openSnackbar);
  };

  return (
    <div>
      <button
        className="p-4 h-10 w-38 rounded-lg flex justify-center items-center"
        onClick={handleDownloadCSV}
        style={downloadButtonStyle}
      >
        <div className="flex items-center">
          <DashboardIcons
            iconName="Download"
            color={downloadButtonStyle.color}
          />
          <div className="ml-2">Datenexport</div>
        </div>
      </button>
    </div>
  );
}
