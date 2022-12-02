import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

import colors from "theme/colors";
import borderRadius from "theme/border-radius";
import { WidgetCard } from "components/elements/widget-card";
import { DashboardWrapper } from "components/elements/dashboard-wrapper";

export function PrivacyPolicy() {
  return (
    <DashboardWrapper>
      <WidgetCard>
        <Box>
          <Typography variant="h2" noWrap component="div" marginBottom={1}>
            Datenschutzerklärung
          </Typography>
        </Box>
        <Paper
          style={{
            height: "100%",
            padding: 10,
            borderRadius: borderRadius.componentRadius,
            backgroundColor: colors.panelBackground,
          }}
          elevation={0}
        >
          <Box sx={{ mr: 70, ml: 1.2 }}>
            <p>
              Diese Datenschutzerklärung gilt für die Datenverarbeitung durch:
            </p>
            <Typography marginBottom={0} variant="h3">
              Verantwortlich:
            </Typography>
            <p>
              KielRegion GmbH
              <br />
              Geschäftsführung Jana Haverbier <br />
              Wissenschaftspark Kiel
              <br />
              Neufeldtstraße 6<br />
              24118 Kiel
              <br />
              Telefon: 0431 – 53 03 55 0<br />
              E-Mail: j.haverbier@kielregion.de
              <br />
            </p>

            <Typography marginBottom={0} variant="h3">
              Datenschutzbeauftragte:
            </Typography>

            <p>
              Dr. Cornelia Fessler <br />
              Wissenschaftspark Kiel
              <br />
              Neufeldtstraße 6<br />
              24118 Kiel
              <br />
              Telefon: 0431 – 53 03 55 17
              <br />
              E-Mail: c.fessler@kielregion.de
              <br />
            </p>

            <p>
              HRB 10353 KI, Amtsgericht Kiel
              <br />
              Geschäftsführung und inhaltlich verantwortlich:
              <br />
              Ulrike Schrabback-Wielatt
            </p>

            <p>
              Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen
              Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten
              vertraulich und entsprechend der gesetzlichen
              Datenschutzvorschriften sowie dieser Datenschutzerklärung.
            </p>
            <p>
              Die Nutzung unserer Webseite ist in der Regel ohne Angabe
              personenbezogener Daten möglich. Soweit auf unseren Seiten
              personenbezogene Daten (beispielsweise Name, Anschrift oder
              E-Mail-Adressen) erhoben werden, erfolgt dies, soweit möglich,
              stets auf freiwilliger Basis. Diese Daten werden ohne Ihre
              ausdrückliche Zustimmung nicht an Dritte weitergegeben.
            </p>
            <p>
              Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B.
              bei der Kommunikation per E-Mail) Sicherheitslücken aufweisen
              kann. Ein lückenloser Schutz der Daten vor dem Zugriff durch
              Dritte ist nicht möglich.
            </p>

            <Typography marginBottom={0} variant="h3">
              Cookies
            </Typography>

            <p>
              Die Internetseiten verwenden teilweise so genannte Cookies.
              Cookies richten auf Ihrem Rechner keinen Schaden an und enthalten
              keine Viren. Cookies dienen dazu, unser Angebot
              nutzerfreundlicher, effektiver und sicherer zu machen. Cookies
              sind kleine Textdateien, die auf Ihrem Rechner abgelegt werden und
              die Ihr Browser speichert.
            </p>
            <p>
              Die meisten der von uns verwendeten Cookies sind so genannte
              „Session-Cookies“. Sie werden nach Ende Ihres Besuchs automatisch
              gelöscht. Andere Cookies bleiben auf Ihrem Endgerät gespeichert,
              bis Sie diese löschen. Diese Cookies ermöglichen es uns, Ihren
              Browser beim nächsten Besuch wiederzuerkennen.
            </p>

            <p>
              Sie können Ihren Browser so einstellen, dass Sie über das Setzen
              von Cookies informiert werden und Cookies nur im Einzelfall
              erlauben, die Annahme von Cookies für bestimmte Fälle oder
              generell ausschließen sowie das automatische Löschen der Cookies
              beim Schließen des Browsers aktivieren. Bei der Deaktivierung von
              Cookies kann die Funktionalität dieser Website eingeschränkt sein.
            </p>

            <Typography marginBottom={0} variant="h3">
              Server-Log-Files
            </Typography>
            <ul style={{ fontSize: "0.85rem", color: colors.textDark }}>
              <li>Browsertyp und Browserversion</li>
              <li>verwendetes Betriebssystem</li>
              <li>Referrer URL</li>
              <li>Hostname des zugreifenden Rechners</li>
              <li>Uhrzeit der Serveranfrage</li>
            </ul>
            <p>
              Eine Zusammenführung dieser Daten mit anderen Datenquellen wird
              nicht vorgenommen. Wir behalten uns vor, diese Daten nachträglich
              zu prüfen, wenn uns konkrete Anhaltspunkte für eine rechtswidrige
              Nutzung bekannt werden.
            </p>
            <p>
              Die meisten der von uns verwendeten Cookies sind so genannte
              „Session-Cookies“. Sie werden nach Ende Ihres Besuchs automatisch
              gelöscht. Andere Cookies bleiben auf Ihrem Endgerät gespeichert,
              bis Sie diese löschen. Diese Cookies ermöglichen es uns, Ihren
              Browser beim nächsten Besuch wiederzuerkennen.
            </p>
            <Typography marginBottom={0} variant="h3">
              Newsletterdaten
            </Typography>
            <p>
              Diese Website nutzt den Dienst des Newsletter-Anbieters Mailchimp:
              The Rocket Science Group, LLC, 675 Ponce de Leon Ave NE, Suite
              5000, Atlanta, GA 30308 USA.
            </p>
            <p>
              Wenn Sie den auf der Webseite angebotenen Newsletter beziehen
              möchten, benötigen wir von Ihnen eine E-Mail-Adresse sowie
              Informationen, welche uns die Überprüfung gestatten, dass Sie der
              Inhaber der angegebenen E-Mail-Adresse sind und mit dem Empfang
              des Newsletters einverstanden sind. Weitere Daten werden nicht
              erhoben. Diese Daten verwenden wir ausschließlich für den Versand
              der angeforderten Informationen und geben sie nicht an Dritte
              weiter.
            </p>
            <p>
              Die erteilte Einwilligung zur Speicherung der Daten, der
              E-Mail-Adresse sowie deren Nutzung zum Versand des Newsletters
              können Sie jederzeit widerrufen, etwa über den “Austragen”-Link im
              Newsletter.
            </p>

            <Typography marginBottom={0} variant="h3">
              Google Maps
            </Typography>
            <p>
              Die Website nutzt die Landkarten des Dienstes „Google Maps“ des
              Drittanbieters Google LLC, 1600 Amphitheatre Parkway, Mountain
              View, CA 94043, USA. Die Datenschutzerklärung können Sie unter
              https://www.google.com/policies/privacy/ einsehen.
            </p>
            <p>
              Sofern Sie die in unserer Website eingebundene Komponente Google
              Maps aufrufen, speichert Google über Ihren Internet-Browser ein
              Cookie auf Ihrem Endgerät. Dabei werden Ihre Nutzereinstellungen
              und -daten verarbeitet. Hierbei können wir nicht ausschließen,
              dass Google Server in den USA einsetzt.
            </p>

            <Typography marginBottom={0} variant="h3">
              YouTube
            </Typography>
            <p>
              Die Website verwendet für die Einbindung von Videos den Anbieter
              YouTube LLC , 901 Cherry Avenue, San Bruno, CA 94066, USA,
              vertreten durch Google Inc., 1600 Amphitheatre Parkway, Mountain
              View, CA 94043, USA.
            </p>
            <p>
              Normalerweise werden Ihre Daten (z.B. Ihre IP-Adresse) bereits bei
              Aufruf einer Seite mit eingebetteten Videos an YouTube gesendet
              und Cookies auf Ihrem Rechner installiert. Um das zu verhindern,
              sind unsere YouTube Videos mit dem erweiterten Datenschutzmodus
              auf unserer Website eingebunden. Dadurch werden von YouTube keine
              Informationen über die Besucher/-innen mehr gespeichert, es sei
              denn, sie sehen sich das Video an.
            </p>
            <p>
              Mit der YouTube 2-Klick-Lösung werden Sie vor dem Anschauen des
              Videos darauf hingewiesen, dass Ihre Daten an YouTube übermittelt
              werden, sobald Sie das Video anklicken. Sind Sie bei YouTube
              eingeloggt, wird diese Information auch Ihrem Benutzerkonto
              zugeordnet (dies können Sie verhindern, indem Sie sich vor dem
              Aufrufen des Videos bei YouTube ausloggen).
            </p>
            <p>
              Wie YouTube Ihre Daten verwendet und speichert, können Sie der
              Datenschutzerklärung von YouTube unter
              www.google.de/intl/de/policies/privacy/ entnehmen.
            </p>

            <Typography marginBottom={0} variant="h3">
              Google Analytics
            </Typography>
            <p>
              Diese Website nutzt Funktionen des Webanalysedienstes Google
              Analytics. Anbieter ist die Google Inc., 1600 Amphitheatre Parkway
              Mountain View, CA 94043, USA.
            </p>
            <p>
              Google Analytics verwendet so genannte “Cookies”. Das sind
              Textdateien, die auf Ihrem Computer gespeichert werden und die
              eine Analyse der Benutzung der Website durch Sie ermöglichen. Die
              durch den Cookie erzeugten Informationen über Ihre Benutzung
              dieser Website werden in der Regel an einen Server von Google in
              den USA übertragen und dort gespeichert. Mehr Informationen zum
              Umgang mit Nutzerdaten bei Google Analytics finden Sie in der
              Datenschutzerklärung von Google:
              https://support.google.com/analytics/answer/6004245?hl=de
            </p>

            <Typography marginBottom={0} variant="h3">
              Browser Plugin
            </Typography>
            <p>
              Sie können die Speicherung der Cookies durch eine entsprechende
              Einstellung Ihrer Browser-Software verhindern; wir weisen Sie
              jedoch darauf hin, dass Sie in diesem Fall gegebenenfalls nicht
              sämtliche Funktionen dieser Website vollumfänglich werden nutzen
              können. Sie können darüber hinaus die Erfassung der durch den
              Cookie erzeugten und auf Ihre Nutzung der Website bezogenen Daten
              (inkl. Ihrer IP-Adresse) an Google sowie die Verarbeitung dieser
              Daten durch Google verhindern, indem Sie das unter dem folgenden
              Link verfügbare Browser-Plugin herunterladen und installieren:
            </p>
            <p>https://tools.google.com/dlpage/gaoptout?hl=de</p>

            <p>
              Widerspruch gegen Datenerfassung <br />
              Sie können die Erfassung Ihrer Daten durch Google Analytics
              verhindern, indem Sie auf folgenden Link klicken. Es wird ein
              Opt-Out-Cookie gesetzt, der die Erfassung Ihrer Daten bei
              zukünftigen Besuchen dieser Website verhindert: Google Analytics
              deaktivieren
            </p>

            <Typography marginBottom={0} variant="h3">
              IP-Anonymisierung
            </Typography>
            <p>
              Wir nutzen die Funktion “Aktivierung der IP-Anonymisierung” auf
              dieser Webseite. Dadurch wird Ihre IP-Adresse von Google jedoch
              innerhalb von Mitgliedstaaten der Europäischen Union oder in
              anderen Vertragsstaaten des Abkommens über den Europäischen
              Wirtschaftsraum zuvor gekürzt. Nur in Ausnahmefällen wird die
              volle IP-Adresse an einen Server von Google in den USA übertragen
              und dort gekürzt. Im Auftrag des Betreibers dieser Website wird
              Google diese Informationen benutzen, um Ihre Nutzung der Website
              auszuwerten, um Reports über die Websiteaktivitäten
              zusammenzustellen und um weitere mit der Websitenutzung und der
              Internetnutzung verbundene Dienstleistungen gegenüber dem
              Websitebetreiber zu erbringen. Die im Rahmen von Google Analytics
              von Ihrem Browser übermittelte IP-Adresse wird nicht mit anderen
              Daten von Google zusammengeführt.
            </p>

            <Typography marginBottom={0} variant="h3">
              SSL-Verschlüsselung
            </Typography>
            <p>
              Diese Seite nutzt aus Gründen der Sicherheit und zum Schutz der
              Übertragung vertraulicher Inhalte, wie zum Beispiel der Anfragen,
              die Sie an uns als Seitenbetreiber senden, eine
              SSL-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie
              daran, dass die Adresszeile des Browsers von “http://” auf
              “https://” wechselt und an dem Schloss-Symbol in Ihrer
              Browserzeile.
            </p>
            <p>
              Wenn die SSL Verschlüsselung aktiviert ist, können die Daten, die
              Sie an uns übermitteln, nicht von Dritten mitgelesen werden.
            </p>

            <Typography marginBottom={0} variant="h3">
              Auskunft, Löschung, Sperrung
            </Typography>
            <p>
              Sie haben jederzeit das Recht auf unentgeltliche Auskunft über
              Ihre gespeicherten personenbezogenen Daten, deren Herkunft und
              Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf
              Berichtigung, Sperrung oder Löschung dieser Daten. Hierzu sowie zu
              weiteren Fragen zum Thema personenbezogene Daten können Sie sich
              jederzeit unter der im Impressum angegebenen Adresse an uns
              wenden.
            </p>
          </Box>

          <br />
        </Paper>
      </WidgetCard>
    </DashboardWrapper>
  );
}
