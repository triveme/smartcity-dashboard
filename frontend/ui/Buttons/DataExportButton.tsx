'use client';

import { ReactElement, useState, CSSProperties } from 'react';
import DashboardIcons from '../Icons/DashboardIcon';
import React from 'react';
import { useAuth } from 'react-oidc-context';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import { downloadCSV } from '@/utils/downloadHelper';
import PageHeadline from '../PageHeadline';

type DataExportButtonProps = {
  id: string;
  type: string;
  menuStyle?: CSSProperties;
  headerFontColor?: string;
  headerPrimaryColor?: string;
  panelFontColor?: string;
  widgetFontColor?: string;
};

export default function DataExportButton(
  props: DataExportButtonProps,
): ReactElement {
  const {
    id,
    type,
    menuStyle,
    headerFontColor,
    headerPrimaryColor,
    panelFontColor,
    widgetFontColor,
  } = props;

  const auth = useAuth();
  const accessToken = auth.user?.access_token || '';
  const { openSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);

  const downloadButtonStyle = {
    backgroundColor: headerPrimaryColor || '#2B3244',
    color: headerFontColor || 'FFF',
    fontSize: '1rem',
  };

  const handleDownloadCSV = async (): Promise<void> => {
    setIsLoading(true);
    await downloadCSV(accessToken, id, type, openSnackbar);
    setIsLoading(false);
  };

  return (
    <div>
      <button
        className="p-4 h-10 w-38 rounded-lg flex justify-center items-center"
        onClick={handleDownloadCSV}
        style={menuStyle ? menuStyle : downloadButtonStyle}
        disabled={isLoading}
      >
        <div className="flex items-center">
          <DashboardIcons
            iconName="Download"
            color={menuStyle ? menuStyle.color : downloadButtonStyle.color}
          />
          <div className="ml-2 hidden sm:block">Datenexport</div>
        </div>
      </button>

      {/* Loading Modal */}
      {isLoading && (
        <div className="fixed z-50 inset-0 bg-[#1E1E1E] bg-opacity-70 flex flex-col justify-center items-center">
          <div
            className="p-10 rounded-lg w-2/4 flex flex-col justify-between"
            style={{
              backgroundColor: headerPrimaryColor || '#2B3244',
              color: headerFontColor || 'FFF',
            }}
          >
            <PageHeadline
              headline="Datenexport"
              fontColor={panelFontColor || '#FFFFFF'}
            />
            <div className="flex flex-col items-center justify-center py-8">
              <DashboardIcons
                iconName="Spinner"
                color={menuStyle ? menuStyle.color : downloadButtonStyle.color}
              />
              <p
                className="mt-4 text-base"
                style={{ color: widgetFontColor || '#FFFFFF' }}
              >
                Daten werden exportiert...
                <br />
                Je nach Größe des Dashboards kann es etwas dauern.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
