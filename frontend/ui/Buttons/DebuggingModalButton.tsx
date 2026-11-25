'use client';

import { ReactElement, useState, CSSProperties, useEffect } from 'react';
import React from 'react';
import PageHeadline from '../PageHeadline';
import { CorporateInfo, QueryConfig } from '@/types';
import WizardLabel from '../WizardLabel';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-regular-svg-icons';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import DashboardIcons from '@/ui/Icons/DashboardIcon';

type DebuggingModalButtonProps = {
  ciColors: CorporateInfo | undefined;
  widgetData: unknown;
  queryConfig: QueryConfig;
  queryData: unknown;
  handleResetWidgetData: () => Promise<void>;
};

function hasDebugData(data: unknown): boolean {
  if (data === null || data === undefined) return false;
  if (Array.isArray(data)) return data.length > 0;
  if (typeof data === 'object') {
    return Object.keys(data as Record<string, unknown>).length > 0;
  }
  if (typeof data === 'string') return data.trim().length > 0;
  return true;
}

export default function DebuggingModalButton(
  props: DebuggingModalButtonProps,
): ReactElement {
  const {
    ciColors,
    widgetData,
    queryConfig,
    queryData,
    handleResetWidgetData,
  } = props;
  const [openConfirm, setOpenConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [widgetDataData, setWidgetDataData] = useState('');
  const [queryDataData, setQueryData] = useState('');
  const [queryConfigNewData, setQueryConfigNewData] = useState<QueryConfig>(
    queryConfig as QueryConfig,
  );

  const { openSnackbar } = useSnackbar();

  useEffect(() => {
    setWidgetDataData(
      widgetData === undefined ? '' : (JSON.stringify(widgetData) ?? ''),
    );
    setQueryData(
      queryData === undefined ? '' : (JSON.stringify(queryData) ?? ''),
    );
    setQueryConfigNewData(queryConfig);
  }, [widgetData, queryConfig, queryData]);

  const lastUpdate = new Date(queryConfigNewData?.updatedAt || new Date());

  const formattedDate = new Intl.DateTimeFormat('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(lastUpdate);

  const hasWidgetData = hasDebugData(widgetData);
  const hasQueryData = hasDebugData(queryData);
  const isWidgetDataPending = hasQueryData && !hasWidgetData;
  const isQueryDataPending = hasWidgetData && !hasQueryData;

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isModalOpen) return;

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setIsModalOpen(false);
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isModalOpen]);

  const buttonStyle: CSSProperties = {
    backgroundColor: ciColors?.menuPrimaryColor || '#3D4760',
    color: ciColors?.menuFontColor || '#FFF',
  };

  const modalStyle: CSSProperties = {
    height: 'auto',
    backgroundColor: ciColors?.panelPrimaryColor ?? '#3D4760',
    borderRadius: ciColors?.panelBorderRadius,
    borderWidth: ciColors?.panelBorderSize,
    borderColor: ciColors?.panelBorderColor,
    color: ciColors?.panelFontColor,
  };

  const handleCopyAll = async (data: string): Promise<void> => {
    if (!data) return;
    try {
      await navigator.clipboard.writeText(data);
      openSnackbar('Element wurde kopiert', 'success');
    } catch (error) {
      openSnackbar(
        'Etwas ist schiefgelaufen. Bitte versuche es erneut.',
        'error',
      );
    }
  };

  return (
    <div>
      <button
        type="button"
        aria-label="Open debug window"
        className="p-4 h-10 w-38 rounded-lg flex justify-center items-center"
        onClick={() => setIsModalOpen(!isModalOpen)}
        style={buttonStyle}
      >
        <div className="flex items-center">
          <div className=" hidden sm:block">Debug-Fenster</div>
        </div>
      </button>
      {isModalOpen && (
        <div
          className="fixed z-50 inset-0 bg-[#1E1E1E] bg-opacity-70 flex flex-col justify-center items-center"
          role="presentation"
        >
          <div
            className="relative w-4/5 max-w-5xl h-[85vh] max-h-[850px] p-8 rounded-lg flex flex-col overflow-hidden"
            style={modalStyle}
            role="dialog"
            aria-modal="true"
            aria-label="Debugging-Fenster"
          >
            <div className="flex mb-4 justify-between items-center">
              <div>
                <PageHeadline
                  headline="Debugging-Fenster"
                  fontColor={ciColors?.panelFontColor || '#FFFFFF'}
                />
              </div>
              <p className="mr-4">
                Zuletzt aktualisiert:
                {` ${formattedDate} Uhr `}
              </p>
            </div>
            <button
              type="button"
              aria-label="Close debug window"
              onClick={() => setIsModalOpen(!isModalOpen)}
              className="absolute top-4 right-4"
            >
              <FontAwesomeIcon icon={faTimesCircle} size="lg" />
            </button>
            <div
              className="flex-1 min-h-0 flex flex-col gap-4 p-4 overflow-hidden"
              style={{
                backgroundColor: ciColors?.dashboardPrimaryColor || '#2B3244',
                color: ciColors?.dashboardFontColor || '#FFFFFF',
                borderRadius: ciColors?.panelBorderRadius,
              }}
            >
              <div className="flex-1 min-h-0 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <WizardLabel label="Widget-Data" />
                  <div>
                    <div className="flex h-8 items-center mr-2">
                      <button
                        type="button"
                        onClick={() => handleCopyAll(widgetDataData)}
                        className="flex h-full px-2 justify-center items-center  rounded hover hover:bg-[#C7D2EE]"
                        style={{
                          color: ciColors?.headerFontColor || 'FFF',
                          fontSize: '1rem',
                          borderRadius: ciColors?.panelBorderRadius,
                          borderColor: ciColors?.headerFontColor,
                        }}
                      >
                        <DashboardIcons iconName="Copy" color="#4CAF50" />
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden border p-3"
                  style={{
                    borderRadius: ciColors?.panelBorderRadius,
                    borderColor: ciColors?.panelBorderColor,
                  }}
                >
                  {isWidgetDataPending ? (
                    <p className="italic opacity-75">
                      Widget-Data wird noch verarbeitet ...
                    </p>
                  ) : hasWidgetData ? (
                    <p>{widgetDataData}</p>
                  ) : (
                    <p className="italic opacity-75">
                      Keine Widget-Daten verfügbar.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex-1 min-h-0 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <WizardLabel label="Datenplatform-Data" />
                  <div>
                    <div className="flex h-8 items-center mr-2">
                      <button
                        type="button"
                        onClick={() => handleCopyAll(queryDataData)}
                        className="flex h-full px-2 justify-center items-center  rounded hover hover:bg-[#C7D2EE]"
                        style={{
                          color: ciColors?.headerFontColor || 'FFF',
                          fontSize: '1rem',
                          borderRadius: ciColors?.panelBorderRadius,
                          borderColor: ciColors?.headerFontColor,
                        }}
                      >
                        <DashboardIcons iconName="Copy" color="#4CAF50" />
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden border p-3"
                  style={{
                    borderRadius: ciColors?.panelBorderRadius,
                    borderColor: ciColors?.panelBorderColor,
                  }}
                >
                  {isQueryDataPending ? (
                    <p className="italic opacity-75">
                      Datenplatform-Data wird noch verarbeitet ...
                    </p>
                  ) : hasQueryData ? (
                    <p>{queryDataData}</p>
                  ) : (
                    <p className="italic opacity-75">
                      Keine Datenplatform-Daten verfügbar.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <button
                type="button"
                className="flex justify-center items-center px-3 py-2 min-w-20  bg-red-500 hover:bg-[#C7D2EE] text-white rounded disabled:bg-gray-400 disabled:opacity-50"
                onClick={() => setOpenConfirm(!openConfirm)}
                style={{
                  borderRadius: ciColors?.panelBorderRadius,
                }}
                disabled={openConfirm || isResetting}
              >
                Daten löschen
              </button>
              {openConfirm && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex justify-center items-center px-3 py-2 min-w-20 hover:bg-[#C7D2EE] text-white rounded"
                    style={{
                      backgroundColor: ciColors?.cancelButtonColor || '#8388A4',
                    }}
                    onClick={() => {
                      setOpenConfirm(!openConfirm);
                    }}
                  >
                    <div>Abbrechen</div>
                  </button>
                  <button
                    type="button"
                    className="flex justify-center items-center px-3 py-2 min-w-20 hover:bg-[#C7D2EE] text-white rounded"
                    style={{
                      backgroundColor: ciColors?.saveButtonColor || ' #91D9FF',
                    }}
                    disabled={isResetting}
                    onClick={() => {
                      setIsResetting(true);
                      void handleResetWidgetData().finally(() => {
                        setIsResetting(false);
                        setOpenConfirm(false);
                      });
                    }}
                  >
                    <div>Bestätigen</div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
