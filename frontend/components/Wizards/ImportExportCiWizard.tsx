import { CorporateInfo, SidebarLogo } from '@/types';
import ThemeDowloadButton from '@/ui/Buttons/ThemeDowloadButton';
import ThemeUploadButton from '@/ui/Buttons/ThemeUploadButton';
import { Dispatch, JSX, SetStateAction } from 'react';

type ImportExportCiWizardProps = {
  corporateInfo: CorporateInfo | undefined;
  setNewTheme: (values: CorporateInfo) => void;
  widgetPrimaryColor?: string;
  setHeaderLogoId: Dispatch<SetStateAction<string | null>>;
  setSidebarLogos: Dispatch<SetStateAction<SidebarLogo[]>>;
  widgetFontColor?: string;
  borderColor: string;
  backgroundColor: string;
};

export default function ImportExportCiWizard(
  props: ImportExportCiWizardProps,
): JSX.Element {
  const {
    setNewTheme,
    corporateInfo,
    widgetPrimaryColor,
    widgetFontColor,
    setHeaderLogoId,
    setSidebarLogos,
    borderColor,
    backgroundColor,
  } = props;

  return (
    <div>
      <div className="flex-column gap-5 items-center px-4 py-2">
        <ThemeDowloadButton
          corporateInfo={corporateInfo}
          widgetPrimaryColor={widgetPrimaryColor}
          widgetFontColor={widgetFontColor}
          borderColor={borderColor}
          backgroundColor={backgroundColor}
        />
        <ThemeUploadButton
          setNewTheme={setNewTheme}
          ciColors={corporateInfo}
          setHeaderLogoId={setHeaderLogoId}
          setSidebarLogos={setSidebarLogos}
        />
        <div className="flex flex-col sm:flex-row gap-4 mt-2">
          <div
            className="flex-1 min-w-0 rounded-lg p-4 text-sm"
            style={{ border: `1px solid ${borderColor}` }}
          >
            <div className="font-bold mb-2">Theme exportieren</div>
            <p>
              Speichert alle Einstellungen dieses Themes (Farben, Schriften,
              Texte, CSS) als JSON-Datei. Den Dateinamen können Sie vor dem
              Download ändern.
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>
                <strong>Mit Bilder exportieren:</strong> Nimmt die Logos in die
                Datei auf. Ohne diese Option enthält die Datei nur Farben und
                Einstellungen.
              </li>
              <li>
                Header-Logo, Favicon und Menü-Logo werden nur als Verweis
                gespeichert und funktionieren daher nur im selben Mandanten.
              </li>
            </ul>
          </div>
          <div
            className="flex-1 min-w-0 rounded-lg p-4 text-sm"
            style={{ border: `1px solid ${borderColor}` }}
          >
            <div className="font-bold mb-2">Theme importieren</div>
            <p>
              Wählen Sie eine zuvor exportierte JSON-Datei aus und klicken Sie
              auf „Hochladen“. Die Werte werden nur in die Eingabefelder
              übernommen.
            </p>
            <p>
              <strong>Wichtig:</strong> Klicken Sie nach dem Import auf{' '}
              <strong>„Speichern“</strong>, damit das neue Theme dauerhaft
              übernommen wird. Ohne Speichern gehen die importierten Änderungen
              verloren.
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-1">
              <li>
                <strong>Mit Bilder importieren:</strong> Ersetzt die aktuellen
                Logos durch die Logos aus der Datei. Ohne diese Option bleiben
                alle aktuellen Logos unverändert.
              </li>
              <li>
                Header-Logo, Favicon und Menü-Logo sind in der Datei nur die ID
                eines bereits gespeicherten Logos. Das Logo muss daher im
                Mandanten vorhanden sein. Logos der Seitenleiste sind dagegen
                als Bild in der Datei enthalten.
              </li>
              <li>
                Einstellungen, die in der Datei fehlen, bleiben unverändert.
                Ungültige oder unbekannte Einträge werden ignoriert, Sie
                erhalten dazu einen Hinweis.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
