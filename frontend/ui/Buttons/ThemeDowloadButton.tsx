'use client';

import { ReactElement, useState } from 'react';
import DashboardIcons from '../Icons/DashboardIcon';
import { CorporateInfo } from '@/types';
import {
  DEFAULT_THEME_FILE_NAME,
  downloadThemeJSON,
  sanitizeFileName,
} from '@/utils/downloadHelper';
import { buildThemeExport } from '@/utils/themeSchema';
import CheckBox from '../CheckBox';
import WizardTextfield from '../WizardTextfield';
import GenericButton from './GenericButton';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';

type ThemeDowloadButtonType = {
  corporateInfo: CorporateInfo | undefined;
  widgetPrimaryColor?: string;
  widgetFontColor?: string;
  borderColor: string;
  backgroundColor: string;
};

export default function ThemeDowloadButton(
  props: ThemeDowloadButtonType,
): ReactElement {
  const {
    corporateInfo,
    widgetPrimaryColor,
    widgetFontColor,
    borderColor,
    backgroundColor,
  } = props;
  const [isDisabled, setIsDisabled] = useState(false);
  const [exportWithLogos, setExporttWithLogos] = useState(true);
  const [onDownload, setOnDownload] = useState(false);
  const [fileName, setFileName] = useState(DEFAULT_THEME_FILE_NAME);

  const { openSnackbar } = useSnackbar();

  const widgetStyle = {
    backgroundColor: widgetPrimaryColor ?? '#3D4760',
    color: widgetFontColor || '#FFF',
  };

  const handleDownloadJSON = (): void => {
    if (fileName.trim().length === 0) {
      openSnackbar('Der Dateiname darf nicht leer sein.', 'warning');
      return;
    }
    if (!corporateInfo) {
      openSnackbar('Es ist kein Theme zum Exportieren geladen.', 'error');
      return;
    }

    setIsDisabled(true);

    // Whitelist-Export: ohne id/tenantId; Bild-Felder nur bei "Mit Bilder exportieren"
    const data = buildThemeExport(corporateInfo, exportWithLogos);
    downloadThemeJSON(
      data as CorporateInfo,
      `${sanitizeFileName(fileName)}.json`,
    );

    setOnDownload(false);
    setFileName(DEFAULT_THEME_FILE_NAME);
    setIsDisabled(false);
  };

  return (
    <div className="">
      {!onDownload ? (
        <div className="flex flex-wrap w-full">
          <button
            className="p-4 h-10 w-38 rounded-lg flex justify-center items-center"
            onClick={() => setOnDownload(true)}
            style={{ color: widgetStyle.color }}
            disabled={isDisabled}
          >
            <div className="flex items-center">
              <DashboardIcons
                iconName="Download"
                color={`${widgetStyle.color}`}
              />
              <div className="ml-2 hidden sm:block">Theme exportieren</div>
            </div>
          </button>
          <div>
            <CheckBox
              label={'Mit Bilder exportieren'}
              value={exportWithLogos}
              handleSelectChange={setExporttWithLogos}
            />
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center ">
          <div className="w-1/10">
            <WizardTextfield
              value={fileName}
              onChange={(value): void => {
                setFileName(value.toString());
              }}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
          </div>
          <div className="flex gap-1">
            <GenericButton
              label="Herunterladen"
              handleClick={handleDownloadJSON}
              backgroundColor={'transparent'}
            />
            <GenericButton
              label="Abbrechen"
              handleClick={() => {
                setOnDownload(false);
                setFileName(DEFAULT_THEME_FILE_NAME);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
