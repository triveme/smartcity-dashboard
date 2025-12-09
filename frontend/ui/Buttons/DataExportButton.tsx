'use client';

import { ReactElement, useState, CSSProperties, useEffect } from 'react';
import DashboardIcons from '../Icons/DashboardIcon';
import React from 'react';
import { useAuth } from 'react-oidc-context';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import { downloadCSV, getAvailableWidgets } from '@/utils/downloadHelper';
import PageHeadline from '../PageHeadline';
import { CorporateInfo } from '@/types';
import CheckBox from '../CheckBox';
import HorizontalDivider from '../HorizontalDivider';

type DataExportButtonProps = {
  id: string;
  type: string;
  menuStyle?: CSSProperties;
  headerFontColor?: string;
  headerPrimaryColor?: string;
  panelFontColor?: string;
  widgetFontColor?: string;
  ciColors: CorporateInfo;
};

type AvailabelWidgetType = {
  id: string;
  name: string;
  panelName: string;
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
    ciColors,
  } = props;

  const auth = useAuth();
  const accessToken = auth.user?.access_token || '';
  const { openSnackbar } = useSnackbar();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [availableWidgets, setAvailableWidgets] = useState<
    AvailabelWidgetType[]
  >([]);
  const [selectedWidgetIds, setSelectedWidgetIds] = useState<string[]>([]);

  const allSelected =
    availableWidgets.length > 0 &&
    selectedWidgetIds.length === availableWidgets.length;

  const modalStyle: CSSProperties = {
    height: 'auto',
    backgroundColor: ciColors.panelPrimaryColor ?? '#3D4760',
    // fontSize: '1.5rem',
    borderRadius: ciColors.panelBorderRadius,
    borderWidth: ciColors.panelBorderSize,
    borderColor: ciColors.panelBorderColor,
    color: ciColors.panelFontColor,
  };

  const downloadButtonStyle = {
    backgroundColor: headerPrimaryColor || '#2B3244',
    color: headerFontColor || 'FFF',
    fontSize: '1rem',
    borderRadius: ciColors.panelBorderRadius,
    borderWidth: '1px',
    borderColor: headerFontColor,
  };

  const dataexportButtonStyle = {
    backgroundColor: headerPrimaryColor || '#2B3244',
    color: headerFontColor || 'FFF',
    fontSize: '1rem',
  };

  const handleToggleSnackbar = (): void => {
    setIsModalOpen((prev) => !prev);
  };

  const handleDownloadCSV = async (): Promise<void> => {
    if (selectedWidgetIds.length === 0) {
      return;
    }

    setIsLoading(true);
    await downloadCSV(accessToken, id, type, openSnackbar, selectedWidgetIds);
    setIsLoading(false);
    handleToggleSnackbar();
  };

  const getAllAvalilableWidgets = async (): Promise<void> => {
    const dashboard = await getAvailableWidgets(accessToken, id);

    if (!dashboard || !dashboard.panels) {
      return;
    }

    const result = dashboard.panels.flatMap((panel) => {
      return panel.widgets.map((widget) => {
        return {
          id: widget.id as string,
          name: widget.name,
          panelName: panel.name,
        };
      });
    });

    setAvailableWidgets(result);
  };

  const handleToggleWidget = (id: string, checked: boolean): void => {
    setSelectedWidgetIds((prev) =>
      checked
        ? prev.includes(id)
          ? prev
          : [...prev, id]
        : prev.filter((x) => x !== id),
    );
  };

  const handleToggleAll = (isSelected: boolean): void => {
    if (isSelected) {
      const allIds = availableWidgets.map((w) => w.id);
      setSelectedWidgetIds(allIds);
    } else {
      setSelectedWidgetIds([]);
    }
  };

  useEffect(() => {
    getAllAvalilableWidgets();
  }, [accessToken, id, type]);

  return (
    <div>
      <button
        className="p-4 h-10 w-38 rounded-lg flex justify-center items-center"
        onClick={handleToggleSnackbar}
        style={menuStyle ? menuStyle : dataexportButtonStyle}
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
      {isModalOpen && (
        <div className="fixed z-50 inset-0 bg-[#1E1E1E] bg-opacity-70 flex flex-col justify-center items-center">
          <div
            className="p-8 rounded-lg w-1/3 flex flex-col justify-between"
            style={modalStyle}
          >
            <div className="mb-4">
              <PageHeadline
                headline="Data Export Manager"
                fontColor={panelFontColor || '#FFFFFF'}
              />
            </div>
            <div className="flex flex-col justify-center w-full">
              <CheckBox
                label={allSelected ? 'Alle abwählen' : 'Alle auswählen'}
                value={allSelected}
                handleSelectChange={(isSelected) => handleToggleAll(isSelected)}
              />
              <HorizontalDivider />
            </div>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <DashboardIcons
                  iconName="Spinner"
                  color={
                    menuStyle ? menuStyle.color : downloadButtonStyle.color
                  }
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
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {availableWidgets.map((widget, indx) => {
                  return (
                    <div
                      key={indx}
                      className="flex flex-col justify-center w-full"
                    >
                      <CheckBox
                        label={`${widget.panelName} - ${widget.name}`}
                        value={selectedWidgetIds.includes(widget.id)}
                        handleSelectChange={(isSelected) =>
                          handleToggleWidget(widget.id, isSelected)
                        }
                      />
                      <HorizontalDivider />
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-4 flex flex-row justify-center justify-center items-center gap-3">
              <button
                className="p-4 h-10 w-38 rounded-lg flex justify-center items-center"
                onClick={handleToggleSnackbar}
                style={menuStyle ? menuStyle : downloadButtonStyle}
                disabled={isLoading}
              >
                <div className="flex items-center">
                  <div className="hidden sm:block">Abbrechnen</div>
                </div>
              </button>
              <button
                className="p-4 h-10 w-38 rounded-lg flex justify-center items-center"
                onClick={handleDownloadCSV}
                style={menuStyle ? menuStyle : downloadButtonStyle}
                disabled={
                  isLoading || selectedWidgetIds.length > 0 ? false : true
                }
              >
                <div className="flex items-center">
                  <div className="hidden sm:block">Download</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
