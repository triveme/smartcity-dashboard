'use client';
import { CorporateInfo, SidebarLogo } from '@/types';
import DashboardIcons from '../Icons/DashboardIcon';
import {
  Dispatch,
  ReactElement,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import GenericButton from './GenericButton';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import HorizontalDivider from '../HorizontalDivider';
import CheckBox from '../CheckBox';
import { omitImageFields, parseThemeFile } from '@/utils/themeSchema';

type ThemeUploadButtonType = {
  setNewTheme: (values: CorporateInfo) => void;
  ciColors: CorporateInfo | undefined;
  setHeaderLogoId: Dispatch<SetStateAction<string | null>>;
  setSidebarLogos: Dispatch<SetStateAction<SidebarLogo[]>>;
};

export default function ThemeUploadButton(
  props: ThemeUploadButtonType,
): ReactElement {
  const { setNewTheme, ciColors, setHeaderLogoId, setSidebarLogos } = props;

  const { openSnackbar } = useSnackbar();

  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileText, setFileText] = useState('');
  const [importWithLogos, setImportWithLogos] = useState(true);

  const downloadButtonStyle = {
    backgroundColor: ciColors?.headerPrimaryColor || '#2B3244',
    color: ciColors?.headerFontColor || 'FFF',
    fontSize: '1rem',
    borderRadius: ciColors?.panelBorderRadius,
    borderWidth: '1px',
    borderColor: ciColors?.headerFontColor,
  };

  const handleSetNewTheme = (): void => {
    if (fileText.length === 0) return;

    const { theme, errors, warnings } = parseThemeFile(
      fileText,
      ciColors?.tenantId,
    );

    if (errors.length > 0) {
      openSnackbar(
        `Ungültige Theme-Datei: ${errors.slice(0, 3).join(' | ')}`,
        'error',
      );
      return;
    }

    // Ohne Bilder bleiben alle aktuellen Bilder unverändert. Enthält die Datei nur Bilder,
    // gibt es nichts zu importieren: keine falsche Erfolgsmeldung.
    const data = importWithLogos ? theme : omitImageFields(theme);
    if (Object.keys(data).length === 0) {
      openSnackbar(
        'Die Datei enthält nur Bilder. Zum Importieren „Mit Bilder importieren“ aktivieren und die Datei erneut auswählen.',
        'warning',
      );
      return;
    }

    // Mit Bildern: Header/Sidebar werden komplett überschrieben, aber nur wenn die Datei
    // die Felder enthält.
    if (importWithLogos) {
      if ('headerLogoId' in theme)
        setHeaderLogoId(theme.headerLogoId as string | null);
      if ('sidebarLogos' in theme)
        setSidebarLogos(theme.sidebarLogos as SidebarLogo[]);
    }
    setNewTheme(data as unknown as CorporateInfo);

    const message = 'Theme erfolgreich importiert.';
    openSnackbar(
      warnings.length > 0
        ? `${message} Hinweis: ${warnings.join(' ')}`
        : message,
      warnings.length > 0 ? 'warning' : 'success',
    );
    setFileName('');
    setFileText('');
    setFile(null);
  };

  const fileHandler = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      openSnackbar('Bitte versuche es erneut.', 'error');
      return;
    }
    setFile(selectedFile);
    // gleiche Datei erneut auswählen können
    event.target.value = '';
  };

  const clearFile = (): void => {
    setFileName('');
    setFileText('');
    setFile(null);
  };

  useEffect(() => {
    if (file) {
      const setFileData = async (): Promise<void> => {
        setFileName(file.name);
        try {
          const t = await file.text();
          setFileText(t);
        } catch {
          setFileText('');
          setFileName('');
          setFile(null);
        }
      };

      setFileData();
    }
  }, [file]);

  return (
    <div>
      <div className="max-h-60 overflow-y-auto">
        <div>
          <input
            id="file-input"
            type="file"
            accept="application/json"
            style={{ display: 'none' }}
            onChange={fileHandler}
          />
          <div>
            <label htmlFor="file-input">
              {!fileName && (
                <div className="flex flex-wrap w-full">
                  <div className="flex items-center p-4">
                    <div className="flex items-center justify-center w-[20px] h-[20px]">
                      <DashboardIcons
                        iconName="Upload"
                        color={downloadButtonStyle.color}
                      />
                    </div>

                    <div
                      style={{ cursor: 'pointer' }}
                      className="ml-2 hidden sm:block"
                    >
                      Theme importieren
                    </div>
                  </div>
                  <div>
                    <CheckBox
                      label={'Mit Bilder importieren'}
                      value={importWithLogos}
                      handleSelectChange={setImportWithLogos}
                    />
                  </div>
                </div>
              )}
            </label>
            {fileName && (
              <div className="flex justify-between items-center ">
                <span className="p-4 mr-2">{fileName}</span>
                <div className="flex gap-1">
                  <GenericButton
                    label="Hochladen"
                    handleClick={handleSetNewTheme}
                    backgroundColor={'transparent'}
                  />
                  <GenericButton label="Entfernen" handleClick={clearFile} />
                </div>
              </div>
            )}
          </div>
          <HorizontalDivider />
        </div>
      </div>
    </div>
  );
}
