import axios from "axios";
import jimp from "jimp";

const PREVIEW_WIDTH = 150;
const PREVIEW_HEIGHT = 100;

const POI_DATA = {
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1499966685, 51.2547507047],
      },
      properties: {
        HAUPTNAME: "Hauptbahnhof Wuppertal",
        NAMEN:
          "Hauptbahnhof Wuppertal (Elberfeld), Wuppertal (Elberfeld) Hauptbahnhof",
        STRASSE: "Döppersberg",
        STADT: "Wuppertal",
        PLZ: "42103",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "DB-, S-, Regional-Bahnhof und Fernbahnnetz",
        HAUPTTHEMA: "Bahnhöfe",
        THEMEN: "Bahnhöfe",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Bahnhof%20Elberf-015-02-05-0270%20%28Kopie%29.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=4&dateiname_bild=Bahnhof%20Elberf-015-02-05-0270%20%28Kopie%29.jpg&name_strecke=POI%20-%20Stadt%20Wuppertal%20-08-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "hbf-wuppertal",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 1",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1466475538, 51.2572321672],
      },
      properties: {
        HAUPTNAME: "Von der Heydt-Museum",
        NAMEN:
          "Von der Heydt-Kunstmuseum, kunstwissenschaftliche Fachbibliothek Von der Heydt-Museum, Stadtbetrieb Von der Heydt-Museum",
        STRASSE: "Turmhof 8",
        STADT: "Wuppertal",
        PLZ: "42103",
        TELEFON: "+49-202-563-6231",
        FAX: "+49-202-563-8091",
        EMAIL: "von-der-heydt-museum@stadt.wuppertal.de",
        URL: "https://www.wuppertal.de/kultur-bildung/heydt/index.php",
        ART_INFO: "Träger",
        INFO: "Kunstmuseum der Stadt Wuppertal",
        HAUPTTHEMA: "Museen und Galerien",
        THEMEN:
          "Sehenswürdigkeiten, Veranstaltungsorte, Museen und Galerien, Bibliotheken",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Von%20der%20Heydt-Museum-016-01-25-001%20%281%29.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=2&dateiname_bild=Von%20der%20Heydt-Museum-016-01-25-001%20%281%29.jpg&name_strecke=Von%20der%20Heydt-Museum-Kunsthalle&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "museum-heydt",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 1",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1405218849, 51.2532125479],
      },
      properties: {
        HAUPTNAME: "Schwimmoper",
        NAMEN: "Hallenbad Johannisberg, Stadtbad Johannisberg",
        STRASSE: "Südstraße 29",
        STADT: "Wuppertal",
        PLZ: "42103",
        TELEFON: "+49-202-563-2630",
        FAX: "+49-202-563-8057",
        EMAIL:
          "sport-baeder@stadt.wuppertal.de?subject=Anfrage%20zu:%20Schwimmoper",
        URL: "https://www.wuppertal.de/tourismus-freizeit/baeder/schwimmoper.php",
        ART_INFO: "Hinweis",
        INFO: "städtisches Hallenbad mit Sauna (mit Außengelände), Fitnessraum und Cafeteria",
        HAUPTTHEMA: "Schwimmbäder",
        THEMEN: "Schwimmbäder, Gebäude und Bauwerke, Sehenswürdigkeiten",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Schwimmoper-011-034.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=1&dateiname_bild=Schwimmoper-011-034.jpg&name_strecke=Schwimmoper%20-%20Wuppertal&format=0&fl=",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "schwimmoper",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1902603785, 51.2672682321],
      },
      properties: {
        HAUPTNAME: "Störstein Tuffi",
        NAMEN: "Tuffi, Störstein Elefant, Skulptur in der Wupper, Tuffi",
        STRASSE: "Friedrich-Engels-Allee/Adlerbrücke",
        STADT: "Wuppertal",
        PLZ: "42283",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: "https://neue-ufer-wuppertal.de/de/aktuelles/nuwe-liste/veranstaltung/details/69.html",
        ART_INFO: "Art",
        INFO: "Störsteine fördern die Eigendynamik des Flusses, tragen zur Sauerstoffanreicherung bei (Material: Basaltlava; Gestaltung: Bernd Bergkemper; Idee: Verein Neue Ufer Wupper; Auftraggeber: Wupperverband; Sponsor: Dr. Werner Jackstädt-Stiftung)",
        HAUPTTHEMA: "Gebäude und Bauwerke",
        THEMEN: "Gebäude und Bauwerke, Sehenswürdigkeiten",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Elefant%20Tuffi-020-09-11-2-047.jpg",
        WEB_BILD:
          "http://fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=1&dateiname_bild=Elefant%20Tuffi-020-09-11-2-031.jpg&name_strecke=Elefant%20Tuffi%20-%202020%20-%2001%20-%20ist%20zur%FCck%20in%20der%20Wupper&format=0&fl=",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "stoerstein-tuffi",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1494010914, 51.2457342277],
      },
      properties: {
        HAUPTNAME: "Bergische Universität",
        NAMEN: "Uni Wuppertal, Universität",
        STRASSE: "Gaußstraße 20",
        STADT: "Wuppertal",
        PLZ: "42119",
        TELEFON: "+49-202-439-0",
        FAX: "+49-202-439-2901",
        EMAIL: null,
        URL: "http://www.uni-wuppertal.de",
        ART_INFO: "Art",
        INFO: "Hochschule",
        HAUPTTHEMA: "Bildungseinrichtungen",
        THEMEN: "Bildungseinrichtungen",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Berg-Uni-016-02-11-023.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=1&dateiname_bild=Berg-Uni-016-02-11-023.jpg&name_strecke=Bergische%20Universit%E4t%20-%20Wuppertal%20-01-&format=0&fl=",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "buw",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 1",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.2058308093, 51.2646407225],
      },
      properties: {
        HAUPTNAME: "Barmer Anlagen",
        NAMEN: "Erholungsraum 3",
        STRASSE: null,
        STADT: "Wuppertal",
        PLZ: null,
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "Parkanlage",
        HAUPTTHEMA: "Grünanlagen und Wälder",
        THEMEN: "Grünanlagen und Wälder",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Barm-Anl-014-04-18-013.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=1&dateiname_bild=Barm-Anl-014-04-18-013.jpg&name_strecke=Barmer%20Anlagen%20-05-%20Parklandschaften&format=0&fl=",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "park-barmer-anlagen",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1343218803, 51.2523835214],
      },
      properties: {
        HAUPTNAME: "Haltestelle Robert-Daum-Platz",
        NAMEN:
          "Schwebebahn-Bahnhof Robert-Daum-Platz, Schwebebahn-Haltestelle Robert-Daum-Platz, Robert-Daum-Platz - Schwebebahn-Haltestelle",
        STRASSE: "Tannenbergstraße",
        STADT: "Wuppertal",
        PLZ: "42103",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "Schwebebahn-Haltestelle",
        HAUPTTHEMA: "Schwebebahn-Haltestellen",
        THEMEN: "Schwebebahn-Haltestellen",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Schwebebahn-016-03-11-011.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=6&dateiname_bild=Schwebebahn-016-03-11-011.jpg&name_strecke=Schwebebahn%20-%20Wahrzeichen%20von%20Wuppertal%20-03-%20Bahnh%F6fe%20-03-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "hs-robert-daum-platz",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1426759998, 51.2553751615],
      },
      properties: {
        HAUPTNAME: "Haltestelle Ohligsmühle",
        NAMEN:
          "Schwebebahn-Bahnhof Ohligsmühle / Stadthalle, Schwebebahn-Haltestelle Ohligsmühle / Stadthalle, Ohligsmühle / Stadthalle - Schwebebahn-Haltestelle",
        STRASSE: null,
        STADT: "Wuppertal",
        PLZ: "42103",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "Schwebebahn-Haltestelle",
        HAUPTTHEMA: "Schwebebahn-Haltestellen",
        THEMEN: "Schwebebahn-Haltestellen",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Fotos%20-%20Schwebeb-01--77.jpg\n",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=5&dateiname_bild=Fotos%20-%20Schwebeb-01--77.jpg&name_strecke=POI%20-%20Stadt%20Wuppertal%20-13-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "hs-ohlingsmuehle",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1254342693, 51.2486421816],
      },
      properties: {
        HAUPTNAME: "Haltestelle Pestalozzistraße",
        NAMEN:
          "Schwebebahn-Bahnhof Pestalozzistraße, Schwebebahn-Haltestelle Pestalozzistraße, Pestalozzistraße - Schwebebahn-Haltestelle",
        STRASSE: "Pestalozzistraße",
        STADT: "Wuppertal",
        PLZ: "42117",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "Schwebebahn-Haltestelle",
        HAUPTTHEMA: "Schwebebahn-Haltestellen",
        THEMEN: "Schwebebahn-Haltestellen",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Schwebebahn-016-03-11-026.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=4&dateiname_bild=Schwebebahn-016-03-11-026.jpg&name_strecke=Schwebebahn%20-%20Wahrzeichen%20von%20Wuppertal%20-04-%20Bahnh%F6fe%20-04-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "hs-pestalozzistrasse",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1544772226, 51.2557012825],
      },
      properties: {
        HAUPTNAME: "Haltestelle Kluse",
        NAMEN:
          "Schwebebahn-Bahnhof Kluse / Schauspielhaus, Schwebebahn-Haltestelle Kluse / Schauspielhaus, Kluse / Schauspielhaus - Schwebebahn-Haltestelle",
        STRASSE: null,
        STADT: "Wuppertal",
        PLZ: "42103",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "Schwebebahn-Haltestelle",
        HAUPTTHEMA: "Schwebebahn-Haltestellen",
        THEMEN: "Schwebebahn-Haltestellen",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/OBI-Stadt%20Wuppert-016-02-25-.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=2&dateiname_bild=OBI-Stadt%20Wuppert-016-02-25-.jpg&name_strecke=Schwebebahn%20-%20Wahrzeichen%20von%20Wuppertal%20-02-%20Bahnh%F6fe%20-02-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "hs-kluse",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.2067426614, 51.2723763473],
      },
      properties: {
        HAUPTNAME: "Haltestelle Werther Brücke",
        NAMEN:
          "Schwebebahn-Bahnhof Werther Brücke, Schwebebahn-Haltestelle Werther Brücke, Werther Brücke - Schwebebahn-Haltestelle",
        STRASSE: null,
        STADT: "Wuppertal",
        PLZ: "42275",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "Schwebebahn-Haltestelle",
        HAUPTTHEMA: "Schwebebahn-Haltestellen",
        THEMEN: "Schwebebahn-Haltestellen",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Werther%20Br-014-03-24-003.jpg\n",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?name_strecke=Alte-Neue%20Schwebebahn%20Station%20-%20Werther%20Br%FCcke%20-02-&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "hs-werther-bruecke",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1325159575, 51.252654687],
      },
      properties: {
        HAUPTNAME: "FOM Hochschule",
        NAMEN:
          "FOM Hochschule für Oekonomie & Management, Private Universität in Wuppertal, Hochschulzentrum Wuppertal Haus der Impulse",
        STRASSE: "Robert-Daum-Platz 7",
        STADT: "Wuppertal",
        PLZ: "42117",
        TELEFON: "+49-800-1959595",
        FAX: null,
        EMAIL: "studienberatung@fom-wuppertal.de",
        URL: "https://www.fom.de/de/Hochschulzentrum/wuppertal.html",
        ART_INFO: "Art",
        INFO: "Hochschule",
        HAUPTTHEMA: "Bildungseinrichtungen",
        THEMEN: "Bildungseinrichtungen",
        URL_BILD: null,
        WEB_BILD: null,
        URHEBER: null,
        KEYURL: "fom-hochschule",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.0883050211, 51.2363983457],
      },
      properties: {
        HAUPTNAME: "Haltestelle Hammerstein",
        NAMEN:
          "Schwebebahn-Bahnhof Hammerstein, Schwebebahn-Haltestelle Hammerstein, Hammerstein - Schwebebahn-Haltestelle",
        STRASSE: "Kaiserstraße",
        STADT: "Wuppertal",
        PLZ: "42329",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "Schwebebahn-Haltestelle",
        HAUPTTHEMA: "Schwebebahn-Haltestellen",
        THEMEN: "Schwebebahn-Haltestellen",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/POI-Stadt%20Wupp-016-02-24-045.jpg\n",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=2&dateiname_bild=POI-Stadt%20Wupp-016-02-24-045.jpg&name_strecke=Schwebebahn%20-%20Wahrzeichen%20von%20Wuppertal%20-01-%20Bahnh%F6fe%20-01-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "hs-hammerstein",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.2317307404, 51.2784916093],
      },
      properties: {
        HAUPTNAME: "Schwarzbachtrasse",
        NAMEN: "Projekt Schwarzbachtrasse, Trasse Schwarzbachtrasse",
        STRASSE: null,
        STADT: "Wuppertal",
        PLZ: null,
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: "https://www.wuppertal.de/microsite/klimaschutz/mobilitaet/weitere-inhalte/startseite-radverkehr.php",
        ART_INFO: "Sportarten",
        INFO: "2 km langer Geh-, Rad- und Inlinerweg; ausgehend vom ehemaligen Bahnhof Wichlinghausen am Wohngebiet Hilgershöhe vorbei nach Langerfeld; durch Corona wurde die formale Eröffnung auf unbestimmte Zeit verschoben",
        HAUPTTHEMA: "Freizeitsportangebote",
        THEMEN: "Freizeitsportangebote",
        URL_BILD: null,
        WEB_BILD: null,
        URHEBER: null,
        KEYURL: "schwarzbachtrasse",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1185275298, 51.2489638206],
      },
      properties: {
        HAUPTNAME: "Haltestelle Westende",
        NAMEN:
          "Schwebebahn-Bahnhof Westende, Schwebebahn-Haltestelle Westende, Westende - Schwebebahn-Haltestelle",
        STRASSE: "Friedrich-Ebert-Straße",
        STADT: "Wuppertal",
        PLZ: "42115",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "Schwebebahn-Haltestelle",
        HAUPTTHEMA: "Schwebebahn-Haltestellen",
        THEMEN: "Schwebebahn-Haltestellen",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Schwebebahn-016-03-11-033.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=6&dateiname_bild=Schwebebahn-016-03-11-033.jpg&name_strecke=Schwebebahn%20-%20Wahrzeichen%20von%20Wuppertal%20-04-%20Bahnh%F6fe%20-04-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "hs-westende",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1629311064, 51.2550610733],
      },
      properties: {
        HAUPTNAME: "die börse",
        NAMEN: "Kommunikationszentrum, Börse",
        STRASSE: "Wolkenburg 100",
        STADT: "Wuppertal",
        PLZ: "42119",
        TELEFON: "+49-202-243220",
        FAX: "+49-202-2432222",
        EMAIL: "info@dieboerse-wtal.de",
        URL: "http://www.dieboerse-wtal.de",
        ART_INFO: "Art",
        INFO: "überregional bekanntes Kommunikations- und Kulturzentrum und eines der ältesten und größten soziokulturellen Zentren Deutschlands",
        HAUPTTHEMA: "Veranstaltungsorte",
        THEMEN: "soziale Einrichtungen, Veranstaltungsorte",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/POI-Stadt%20Wuppertal-001-020.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=6&dateiname_bild=POI-Stadt%20Wuppertal-001-020.jpg&name_strecke=POI%20-%20Stadt%20Wuppertal%20-03-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "club-die-boerse",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.194863032, 51.2672083333],
      },
      properties: {
        HAUPTNAME: "Bahnhof Barmen",
        NAMEN:
          "Bahnhof Wuppertal-Barmen, Barmen Bahnhof, Wuppertal-Barmen Bahnhof",
        STRASSE: "Hans-Dietrich-Genscher-Platz",
        STADT: "Wuppertal",
        PLZ: "42283",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "DB- und S-Bahnhof",
        HAUPTTHEMA: "Bahnhöfe",
        THEMEN: "Bahnhöfe",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Bahnhof%20Barm-014-02-22-.jpg\n",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?name_strecke=Barmer%20Bahnhof%20-%20Wuppertal&fl=",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "bf-barmen",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 1",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.083668921, 51.2510019724],
      },
      properties: {
        HAUPTNAME: "Schloss Lüntenbeck",
        NAMEN: "Schloss Lüntenbeck GmbH & Co. KG",
        STRASSE: "Lüntenbeck 1",
        STADT: "Wuppertal",
        PLZ: "42327",
        TELEFON: "+49-202-29876-87",
        FAX: "+49-202-29876-67",
        EMAIL: "info@schloss-luentenbeck.de",
        URL: "http://www.schloss-luentenbeck.de",
        ART_INFO: "Art",
        INFO: "für Ausstellungen und Kleinkunst genutzter ehemaliger Rittersitz mit überregional bekanntem Weihnachtsmarkt",
        HAUPTTHEMA: "Gebäude und Bauwerke",
        THEMEN: "Veranstaltungsorte, Sehenswürdigkeiten, Gebäude und Bauwerke",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Schloss%20Luentenbeck-016-02-24-005.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=4&dateiname_bild=Schloss%20Luentenbeck-016-02-24-005.jpg&name_strecke=Schloss%20L%FCntenbeck&format=0&fl=",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "schloss-luentenbeck",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 1",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.2057850895, 51.26905287],
      },
      properties: {
        HAUPTNAME: "Hochschule der Bildenden Künste",
        NAMEN:
          "Hochschule der Bildenden Künste Essen, Standort Wuppertal, HBK Essen, Standort Wuppertal, Kunsthochschule",
        STRASSE: "Gewerbeschulstr.",
        STADT: "Wuppertal",
        PLZ: "42289",
        TELEFON: "+49-201-95989800",
        FAX: null,
        EMAIL: null,
        URL: "https://www.hbk-essen.de/de/news/eroffnung/175",
        ART_INFO: "Art",
        INFO: "Hochschule",
        HAUPTTHEMA: "Bildungseinrichtungen",
        THEMEN: "Bildungseinrichtungen",
        URL_BILD: null,
        WEB_BILD: null,
        URHEBER: null,
        KEYURL: "hs-bildende-kuenste",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.152466579, 51.2573791078],
      },
      properties: {
        HAUPTNAME: "Bergische Musikschule",
        NAMEN: "Stadtbetrieb Bergische Musikschule",
        STRASSE: "Hofaue 51",
        STADT: "Wuppertal",
        PLZ: "42103",
        TELEFON: "+49-202-563-7070",
        FAX: null,
        EMAIL: "bergische.musikschule@stadt.wuppertal.de",
        URL: "https://www.wuppertal.de/bergische-musikschule",
        ART_INFO: "Art",
        INFO: "zentraler Standort der Musikschule der Stadt Wuppertal (Sitz der Musikschulleitung und der Bezirksleitung Wuppertal Mitte) mit regelmäßigen Theateraufführungen, Lesungen und Konzerten",
        HAUPTTHEMA: "Bildungseinrichtungen",
        THEMEN: "Veranstaltungsorte, Bildungseinrichtungen",
        URL_BILD: null,
        WEB_BILD: null,
        URHEBER: null,
        KEYURL: "bergische-musikschule",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1740171715, 51.2624793042],
      },
      properties: {
        HAUPTNAME: "Haltestelle Völklinger Straße",
        NAMEN:
          "Schwebebahn-Bahnhof Völklinger Straße, Schwebebahn-Haltestelle Völklinger Straße, Völklinger Straße - Schwebebahn-Haltestelle",
        STRASSE: "Völklinger Straße",
        STADT: "Wuppertal",
        PLZ: "42285",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "Schwebebahn-Haltestelle",
        HAUPTTHEMA: "Schwebebahn-Haltestellen",
        THEMEN: "Schwebebahn-Haltestellen",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/POI-Stadt%20Wupp-016-02-16-010.jpg\n",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=1&dateiname_bild=POI-Stadt%20Wupp-016-02-16-010.jpg&name_strecke=POI%20-%20Stadt%20Wuppertal%20-21-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "hs-voelklinger-strasse",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.0677311067, 51.2303367247],
      },
      properties: {
        HAUPTNAME: "Haltestelle Vohwinkel",
        NAMEN:
          "Schwebebahn-Bahnhof Vohwinkel, Schwebebahn-Haltestelle Vohwinkel, Vohwinkel - Schwebebahn-Haltestelle",
        STRASSE: "Vohwinkeler Straße",
        STADT: "Wuppertal",
        PLZ: "42327",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "westliche Schwebebahn-Endhaltestelle  mit angrenzender Wagenhalle und Wendeschleife",
        HAUPTTHEMA: "Schwebebahn-Haltestellen",
        THEMEN: "Schwebebahn-Haltestellen",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/POI-Stadt%20Wupp-016-02-24-078.jpg\n",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=6&dateiname_bild=POI-Stadt%20Wupp-016-02-24-078.jpg&name_strecke=Schwebebahn%20-%20Wahrzeichen%20von%20Wuppertal%20-01-%20Bahnh%F6fe%20-01-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "hs-vohwinkel",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 1",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1032854465, 51.2409442882],
      },
      properties: {
        HAUPTNAME: "Haltestelle Zoo / Stadion",
        NAMEN:
          "Schwebebahn-Bahnhof Zoo / Stadion, Schwebebahn-Haltestelle Zoo / Stadion, Zoo / Stadion - Schwebebahn-Haltestelle",
        STRASSE: null,
        STADT: "Wuppertal",
        PLZ: "42327",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "Schwebebahn-Haltestelle",
        HAUPTTHEMA: "Schwebebahn-Haltestellen",
        THEMEN: "Schwebebahn-Haltestellen",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/POI-Stadt%20Wupp-016-02-24-092.jpg\n",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=8&dateiname_bild=POI-Stadt%20Wupp-016-02-24-092.jpg&name_strecke=Schwebebahn%20-%20Wahrzeichen%20von%20Wuppertal%20-01-%20Bahnh%F6fe%20-01-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "hs-zoo-stadion",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 1",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1450332915, 51.2667464877],
      },
      properties: {
        HAUPTNAME: "Utopiastadt",
        NAMEN:
          "clownfisch, Mirker Bahnhof, Bahnhof Mirke, Hutmacher, Coworking-Space",
        STRASSE: "Mirker Straße 48",
        STADT: "Wuppertal",
        PLZ: "42105",
        TELEFON: "+49-202-393-48657",
        FAX: "+49-202-393-48741",
        EMAIL: "info@clownfisch.eu",
        URL: "https://www.utopiastadt.eu/",
        ART_INFO: "Art",
        INFO: "Kultur- und Kreativquartier als Stadtlabor für Utopien und bürgerschaftliches Engagement zur Stadtentwicklung im geschichtsträchtigen Bahnhof Mirke",
        HAUPTTHEMA: "Veranstaltungsorte",
        THEMEN:
          "Veranstaltungsorte, soziale Einrichtungen, Dienstleistungsangebote",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Utopiastadt-016-06-10-011.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=1&dateiname_bild=Utopiastadt-016-06-10-011.jpg&name_strecke=Utopiastadt%-03-&format=0&fl=",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "utopiastadt",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.16388461, 51.2632549788],
      },
      properties: {
        HAUPTNAME: "Hardtanlage",
        NAMEN: "Erholungsraum 20, Hardt",
        STRASSE: null,
        STADT: "Wuppertal",
        PLZ: null,
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "Parkanlage",
        HAUPTTHEMA: "Grünanlagen und Wälder",
        THEMEN: "Grünanlagen und Wälder",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Hardt-013-04-22-015%20%28Kopie%29.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=4&dateiname_bild=Hardt-013-04-22-015%20%28Kopie%29.jpg&name_strecke=Fr%FChling%20auf%20der%20Hardt%20-2-&format=0&fl=",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "park-hardtanlage",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.2006903802, 51.272098929],
      },
      properties: {
        HAUPTNAME: "Polizeiwache Barmen Innenstadt",
        NAMEN:
          "Bezirksdienststelle Wache Alter Markt, Wache Alter Markt, Polizei Alter Markt, Polizei Barmen Innenstadt",
        STRASSE: "Johannes Rau Platz 2",
        STADT: "Wuppertal",
        PLZ: "42275",
        TELEFON: "+49-202-284-6540",
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Behördenzweig",
        INFO: null,
        HAUPTTHEMA: "Polizeidienststellen",
        THEMEN: "Polizeidienststellen",
        URL_BILD: null,
        WEB_BILD: null,
        URHEBER: null,
        KEYURL: "polizei-barmen",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1466984416, 51.2643040692],
      },
      properties: {
        HAUPTNAME: "Alte Feuerwache",
        NAMEN:
          "Nachbarschaftsheim Wuppertal e.V., Das Gesunde Kinderhaus, Internationales Jugend- und Begegnungszentrum, Gathedrale, Filmreihe Offstream, Offstream, Talflimmern",
        STRASSE: "Gathe 6",
        STADT: "Wuppertal",
        PLZ: "42107",
        TELEFON: "+49-202-24519-80",
        FAX: "+49-202-2549084",
        EMAIL: "info@altefeuerwache-wuppertal.de",
        URL: "https://www.altefeuerwache-wuppertal.de",
        ART_INFO: "Art der Einrichtung",
        INFO: 'Begegnungsstätte (Schwerpunkte: Kinder und Jugendlichenarbeit, interkulturelle Begegnung) mit Open-Air-Filmprogramm "Talflimmern" in den Sommermonaten',
        HAUPTTHEMA: "soziale Einrichtungen",
        THEMEN: "Veranstaltungsorte, soziale Einrichtungen",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/POI-Stadt%20Wupp-06-016-02-13-014.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=2&dateiname_bild=POI-Stadt%20Wupp-06-016-02-13-014.jpg&name_strecke=POI%20-%20Stadt%20Wuppertal%20-20-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "alte-feuerwache",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1899707596, 51.2659788714],
      },
      properties: {
        HAUPTNAME: "Theater am Engelsgarten",
        NAMEN: "Wuppertaler Bühnen, Schauspiel Wuppertal",
        STRASSE: "Engelsstraße 18",
        STADT: "Wuppertal",
        PLZ: "42283",
        TELEFON: "+49-202-563-76666",
        FAX: "+49-202-563-8078",
        EMAIL: "info@wuppertaler-buehnen.de",
        URL: "http://www.wuppertaler-buehnen.de",
        ART_INFO: "Hinweis",
        INFO: 'Spielstätte der Sparte "Schauspiel Wuppertal" der Wuppertaler Bühnen und Sinfonieorchester GmbH in Teilbereich des Historischen Zentrums (160 Sitzplätze)',
        HAUPTTHEMA: "Theater",
        THEMEN: "Theater, Veranstaltungsorte",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Theater%20Engels-016-03-07-004.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=10&dateiname_bild=Theater%20Engels-016-03-07-004.jpg&name_strecke=Engels%20Haus%20-%20Theater%20am%20Engelsgarten%20-11-&format=0&fl=",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "theater-engelsgarten",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 1",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1454981211, 51.2559867104],
      },
      properties: {
        HAUPTNAME: "Polizeiwache Elberfeld Innenstadt",
        NAMEN:
          "Bezirksdienststelle Wache Innenstadt, Polizei Elberfeld Innenstadt",
        STRASSE: "Schloßbleiche 40 / Eingang Wirmhof",
        STADT: "Wuppertal",
        PLZ: "42103",
        TELEFON: "+49-202-284-6420",
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Behördenzweig",
        INFO: null,
        HAUPTTHEMA: "Polizeidienststellen",
        THEMEN: "Polizeidienststellen",
        URL_BILD: null,
        WEB_BILD: null,
        URHEBER: null,
        KEYURL: "polizei-elberfeld",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1491747296, 51.2560494896],
      },
      properties: {
        HAUPTNAME: "Wuppertal Touristik",
        NAMEN:
          "Infozentrum Wuppertaler Marketing GmbH, Informationszentrum am Döppersberg",
        STRASSE: "Alte Freiheit 23",
        STADT: "Wuppertal",
        PLZ: "42103",
        TELEFON: "+49-202-563-2270",
        FAX: "+49-202-563-8052",
        EMAIL: "wuppertaltouristik@wuppertal-marketing.de",
        URL: "http://www.wuppertalshop.de/",
        ART_INFO: "Organisationstyp",
        INFO: "Kundenzentrum für die touristischen Programme der Wuppertal Marketing GmbH; Öffnungszeiten:  montags bis samstags von 10 bis 19 Uhr",
        HAUPTTHEMA: "Stadtverwaltung",
        THEMEN: "Stadtverwaltung",
        URL_BILD: null,
        WEB_BILD: null,
        URHEBER: null,
        KEYURL: "wuppertal-touristik",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1617785224, 51.2572007489],
      },
      properties: {
        HAUPTNAME: "Arbeitsgericht",
        NAMEN: "Arbeitsgericht Wuppertal, ArbG Wuppertal",
        STRASSE: "Eiland 2",
        STADT: "Wuppertal",
        PLZ: "42103",
        TELEFON: "+49-202-498-0",
        FAX: "+49-202-498-9400",
        EMAIL: "poststelle@arbg-wuppertal.nrw.de",
        URL: "http://www.arbg-wuppertal.nrw.de",
        ART_INFO: "Behördenzweig",
        INFO: "Arbeitsgerichtsbarkeit NRW",
        HAUPTTHEMA: "Behörden",
        THEMEN: "Behörden",
        URL_BILD: null,
        WEB_BILD: null,
        URHEBER: null,
        KEYURL: "arbeitsgericht",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1276942283, 51.2555131278],
      },
      properties: {
        HAUPTNAME: "Briller Viertel",
        NAMEN: null,
        STRASSE: null,
        STADT: "Wuppertal",
        PLZ: "42115",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "Villenviertel aus der Gründerzeit",
        HAUPTTHEMA: "Gebäude und Bauwerke",
        THEMEN: "Sehenswürdigkeiten, Gebäude und Bauwerke",
        URL_BILD:
          "http://fotokraemer-wuppertal.de/images/Briller%20Viertel-016-05-19-015.jpg",
        WEB_BILD:
          "http://fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=3&dateiname_bild=Briller%20Viertel-016-05-19-015.jpg&name_strecke=Briller%20Viertel%20Wuppertal%20-02-&format=0&fl=",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "briller-viertel",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1999749875, 51.2720312788],
      },
      properties: {
        HAUPTNAME: "Rathaus Barmen",
        NAMEN: "Rathaus Wuppertal, Barmer Rathaus, Wuppertaler Rathaus",
        STRASSE: "Johannes-Rau-Platz 1",
        STADT: "Wuppertal",
        PLZ: "42275",
        TELEFON: "+49-202-563-0",
        FAX: null,
        EMAIL: "stadtverwaltung@stadt.wuppertal.de",
        URL: "http://www.wuppertal.de",
        ART_INFO: "Art",
        INFO: "historisches Rathaus der früheren Stadt Barmen, jetzt Wuppertaler Rathaus",
        HAUPTTHEMA: "Gebäude und Bauwerke",
        THEMEN: "Gebäude und Bauwerke, Stadtverwaltung",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Rathausvorplatz-015-06-25-437.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=7&dateiname_bild=Rathausvorplatz-015-06-25-437.jpg&name_strecke=POI%20-%20Stadt%20Wuppertal%20-10-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "rathaus-barmen",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 1",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1624257487, 51.2580388976],
      },
      properties: {
        HAUPTNAME: "Haltestelle Landgericht",
        NAMEN:
          "Schwebebahn-Bahnhof Landgericht, Schwebebahn-Haltestelle Landgericht, Landgericht - Schwebebahn-Haltestelle",
        STRASSE: "Martin-Gauger-Straße",
        STADT: "Wuppertal",
        PLZ: "42103",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "Schwebebahn-Haltestelle",
        HAUPTTHEMA: "Schwebebahn-Haltestellen",
        THEMEN: "Schwebebahn-Haltestellen",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/POI-Stadt%20Wuppertal-001-043.jpg\n",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=3&dateiname_bild=POI-Stadt%20Wuppertal-001-043.jpg&name_strecke=POI%20-%20Stadt%20Wuppertal%20-06-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "hs-landgericht",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1625733059, 51.2576766963],
      },
      properties: {
        HAUPTNAME: "Landgericht",
        NAMEN: "Landgericht Wuppertal",
        STRASSE: "Eiland 1",
        STADT: "Wuppertal",
        PLZ: "42103",
        TELEFON: "+49-202-498-0",
        FAX: "+49-202-498-3504",
        EMAIL: "poststelle@lg-wuppertal.nrw.de",
        URL: "http://www.lg-wuppertal.nrw.de",
        ART_INFO: "Behördenzweig",
        INFO: "Gericht der ordentlichen Gerichtsbarkeit des Landes NRW",
        HAUPTTHEMA: "Behörden",
        THEMEN: "Behörden",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/POI-Stadt%20Wuppertal-001-025.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=4&dateiname_bild=POI-Stadt%20Wuppertal-001-025.jpg&name_strecke=POI%20-%20Stadt%20Wuppertal%20-04-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "landgericht",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.2214038158, 51.2742178914],
      },
      properties: {
        HAUPTNAME: "Bahnhof Oberbarmen",
        NAMEN:
          "Bahnhof Wuppertal-Oberbarmen, Oberbarmen Bahnhof, Wuppertal-Oberbarmen Bahnhof",
        STRASSE: "Rittershauser Brücke",
        STADT: "Wuppertal",
        PLZ: "42277",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "DB- und S-Bahnhof",
        HAUPTTHEMA: "Bahnhöfe",
        THEMEN: "Bahnhöfe",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Bahn-Ober-013-06-07-002.jpg\n",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?name_strecke=POI%20-%20Stadt%20Wuppertal%20-19-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "bf-oberbarmen",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 1",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1444857901, 51.262598434],
      },
      properties: {
        HAUPTNAME: "Nordstadt Elberfeld",
        NAMEN: null,
        STRASSE: null,
        STADT: "Wuppertal",
        PLZ: "42105",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "Altbaugebiet aus der Zeit um 1900",
        HAUPTTHEMA: "Gebäude und Bauwerke",
        THEMEN: "Gebäude und Bauwerke, Sehenswürdigkeiten",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/POI-Stadt%20Wupp-016-02-24-026.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=6&dateiname_bild=POI-Stadt%20Wupp-016-02-24-026.jpg&name_strecke=Haus%20Frontseiten%20-02-&format=0&fl=",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "nordstadt",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1890583454, 51.2670867683],
      },
      properties: {
        HAUPTNAME: "Haltestelle Adlerbrücke",
        NAMEN:
          "Schwebebahn-Bahnhof Adlerbrücke / Opernhaus, Schwebebahn-Haltestelle Adlerbrücke / Opernhaus, Adlerbrücke / Opernhaus - Schwebebahn-Haltestelle",
        STRASSE: null,
        STADT: "Wuppertal",
        PLZ: "42283",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "Schwebebahn-Haltestelle",
        HAUPTTHEMA: "Schwebebahn-Haltestellen",
        THEMEN: "Schwebebahn-Haltestellen",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Schwebebahn-016-02-03-035.jpg\n",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=3&dateiname_bild=Schwebebahn-016-02-03-035.jpg&name_strecke=Schwebebahn%20-%20Wahrzeichen%20von%20Wuppertal%20-9-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "hs-adlerbruecke",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1954403155, 51.2723333191],
      },
      properties: {
        HAUPTNAME: "Hochschule für Musik und Tanz",
        NAMEN: "Hochschule für Musik und Tanz Köln, Standort Wuppertal",
        STRASSE: "Sedanstraße 15",
        STADT: "Wuppertal",
        PLZ: "42275",
        TELEFON: "+49-202-37150-0",
        FAX: "+49-202-37150-40",
        EMAIL: "sekretariat@mhs-wuppertal.de",
        URL: "http://www.hfmt-koeln.de/",
        ART_INFO: "Art",
        INFO: "Hochschule",
        HAUPTTHEMA: "Bildungseinrichtungen",
        THEMEN: "Bildungseinrichtungen",
        URL_BILD: null,
        WEB_BILD: null,
        URHEBER: null,
        KEYURL: "hs-musik-und-tanz",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.0770945263, 51.2342802306],
      },
      properties: {
        HAUPTNAME: "Haltestelle Bruch",
        NAMEN:
          "Schwebebahnhaltestelle Bruch, Schwebebahn-Bahnhof Bruch, Bruch - Schwebebahn-Haltestelle",
        STRASSE: "Kaiserstraße",
        STADT: "Wuppertal",
        PLZ: "42329",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "Schwebebahn-Haltestelle",
        HAUPTTHEMA: "Schwebebahn-Haltestellen",
        THEMEN: "Schwebebahn-Haltestellen",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/POI-Stadt%20Wupp-016-02-24-047.jpg\n",
        WEB_BILD:
          "http://fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=1&dateiname_bild=POI-Stadt%20Wupp-016-02-24-047.jpg&name_strecke=Schwebebahn%20-%20Wahrzeichen%20von%20Wuppertal%20-01-%20Bahnh%F6fe%20-01-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "hs-bruch",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.3020874289, 51.2504299354],
      },
      properties: {
        HAUPTNAME: "Ortskern Beyenburg",
        NAMEN:
          "historischer Ortskern Beyenburg, historisches Ortszentrum Beyenburg",
        STRASSE: null,
        STADT: "Wuppertal",
        PLZ: "42399",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "historischer Ortskern",
        HAUPTTHEMA: "Gebäude und Bauwerke",
        THEMEN: "Sehenswürdigkeiten, Gebäude und Bauwerke",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Beyenb-013-05-18-031.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=8&dateiname_bild=Beyenb-013-05-18-031.jpg&name_strecke=Beyenburger%20Stausee-Alt%20Beyenburg%20im%20Mai&format=1&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "beyenburg-ortskern",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1615196508, 51.2571970788],
      },
      properties: {
        HAUPTNAME: "Amtsgericht",
        NAMEN: "Amtsgericht Wuppertal",
        STRASSE: "Eiland 2",
        STADT: "Wuppertal",
        PLZ: "42103",
        TELEFON: "+49-202-498-0",
        FAX: "+49-202-498-3601",
        EMAIL: "poststelle@ag-wuppertal.nrw.de",
        URL: "http://www.ag-wuppertal.nrw.de",
        ART_INFO: "Behördenzweig",
        INFO: "Gericht der ordentlichen Gerichtsbarkeit des Landes NRW",
        HAUPTTHEMA: "Behörden",
        THEMEN: "Behörden",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/POI-Stadt%20Wuppertal-001-027.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=6&dateiname_bild=POI-Stadt%20Wuppertal-001-027.jpg&name_strecke=POI%20-%20Stadt%20Wuppertal%20-04-&format=1&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "amtsgericht",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.2058762309, 51.2542568735],
      },
      properties: {
        HAUPTNAME: "Vorwerkpark",
        NAMEN: null,
        STRASSE: null,
        STADT: "Wuppertal",
        PLZ: null,
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "Parkanlage",
        HAUPTTHEMA: "Grünanlagen und Wälder",
        THEMEN: "Grünanlagen und Wälder",
        URL_BILD: null,
        WEB_BILD: null,
        URHEBER: null,
        KEYURL: "vorwerkpark",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1988823864, 51.2846626198],
      },
      properties: {
        HAUPTNAME: "Nordpark",
        NAMEN: "Erholungsraum 21",
        STRASSE: null,
        STADT: "Wuppertal",
        PLZ: null,
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "Park / Forst",
        HAUPTTHEMA: "Grünanlagen und Wälder",
        THEMEN: "Grünanlagen und Wälder",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Nordpark-014-01-30-003%20%282%29.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=5&dateiname_bild=Nordpark-014-01-30-003%20%282%29.jpg&name_strecke=POI%20-%20Stadt%20Wuppertal%20-19-&format=1&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "nordpark",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1703890436, 51.2655906497],
      },
      properties: {
        HAUPTNAME: "Kirchliche Hochschule",
        NAMEN:
          "Theologisches Zentrum Wuppertal, Kirchliche Hochschule Wuppertal / Bethel",
        STRASSE: "Missionsstraße 9a/b",
        STADT: "Wuppertal",
        PLZ: "42285",
        TELEFON: "+49-202-2820-100",
        FAX: "+49-202-2820-101",
        EMAIL: "studierendensekretariat@kiho-wb.de",
        URL: "http://www.kiho-wuppertal-bethel.de",
        ART_INFO: "Art",
        INFO: "Hochschule",
        HAUPTTHEMA: "Bildungseinrichtungen",
        THEMEN: "Bildungseinrichtungen",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Theolog-Zentr-016-01-25-001.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=1&dateiname_bild=Theolog-Zentr-016-01-25-001.jpg&name_strecke=Theologisches%20Zentrum%20Wuppertal%20-%2001-&format=0&fl=",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "kirchliche-hochschule",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1930496829, 51.2674025946],
      },
      properties: {
        HAUPTNAME: "Opernhaus",
        NAMEN:
          "Wuppertaler Bühnen, Wuppertaler Bühnen und Sinfonieorchester GmbH",
        STRASSE: "Kurt-Drees-Straße 4",
        STADT: "Wuppertal",
        PLZ: "42283",
        TELEFON: "+49-202-563-7666",
        FAX: "+49-202-563-8078",
        EMAIL: null,
        URL: "http://www.wuppertaler-buehnen.de",
        ART_INFO: "Hinweis",
        INFO: '1905 im Jugendstil errichteter, nach dem Zweiten Weltkrieg im Stil der 1950er Jahre renovierter denkmalgeschützter Theaterbau, Spielstätte des Tanztheaters Pina Bausch und der "Wuppertaler Bühnen und Sinfonieorchester GmbH" (Sparten Oper und Tanztheater)',
        HAUPTTHEMA: "Theater",
        THEMEN: "Theater, Veranstaltungsorte, Gebäude und Bauwerke",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/POI-Stadt%20Wupp-016-02-16-018.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=6&dateiname_bild=POI-Stadt%20Wupp-016-02-16-018.jpg&name_strecke=POI%20-%20Stadt%20Wuppertal%20-21-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "opernhaus",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 1",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.142977251, 51.2529753797],
      },
      properties: {
        HAUPTNAME: "Historische Stadthalle",
        NAMEN:
          "Historische Stadthalle am Johannisberg, Historische Stadthalle Wuppertal, Stadthalle Wuppertal",
        STRASSE: "Johannisberg 40",
        STADT: "Wuppertal",
        PLZ: "42103",
        TELEFON: "+49-202-245890",
        FAX: "+49-202-455198",
        EMAIL: "roho@stadthalle.de",
        URL: "https://www.stadthalle.de",
        ART_INFO: "Art",
        INFO: "Ende des 19. Jahrhunderts errichteter Repräsentationsbau der damals eigenständigen Stadt Elberfeld, heute vielfältig als Veranstaltungsort und Konzertsaal mit weltweit bekannter Akustik genutzt",
        HAUPTTHEMA: "Gebäude und Bauwerke",
        THEMEN: "Gebäude und Bauwerke, Veranstaltungsorte, Sehenswürdigkeiten",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Stadthalle-Wuppertal-2020-094.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?name_strecke=Historische%20Stadthalle%20Wuppertal%20-%20002%20-&fl=",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "historische-stadthalle",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 1",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.222105704, 51.2747359907],
      },
      properties: {
        HAUPTNAME: "Haltestelle Oberbarmen Bahnhof",
        NAMEN:
          "Schwebebahn-Bahnhof Oberbarmen Bahnhof / Berliner Platz, Schwebebahn-Haltestelle Oberbarmen Bahnhof / Berliner Platz, Oberbarmen Bahnhof / Berliner Platz - Schwebebahn-Haltestelle",
        STRASSE: "Berliner Platz",
        STADT: "Wuppertal",
        PLZ: "42277",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "östliche Schwebebahn-Endhaltestelle mit angrenzender Wagenhalle und Wendeschleife",
        HAUPTTHEMA: "Schwebebahn-Haltestellen",
        THEMEN: "Schwebebahn-Haltestellen, Sehenswürdigkeiten",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Schwebebahn-014-07-23-105.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=3&dateiname_bild=Schwebebahn-014-07-23-105.jpg&name_strecke=Alte-Neue%20Schwebebahn%20-%20Wagenhalle%20in%20Oberbarmen%20-02-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "hs-oberbarmen-bf",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 1",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.096733485, 51.2381113441],
      },
      properties: {
        HAUPTNAME: "Haltestelle Sonnborner Straße",
        NAMEN:
          "Schwebebahn-Bahnhof Sonnborner Straße, Schwebebahn-Haltestelle Sonnborner Straße, Sonnborner Straße - Schwebebahn-Haltestelle",
        STRASSE: "Sonnborner Straße",
        STADT: "Wuppertal",
        PLZ: "42117",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "Schwebebahn-Haltestelle",
        HAUPTTHEMA: "Schwebebahn-Haltestellen",
        THEMEN: "Schwebebahn-Haltestellen",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Schwebebahn-016-03-11-081.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=7&dateiname_bild=Schwebebahn-016-03-11-081.jpg&name_strecke=Schwebebahn%20-%20Wahrzeichen%20von%20Wuppertal%20-05-%20Bahnh%F6fe%20-05-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "hs-sonnborner-strasse",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.2163248926, 51.2759624933],
      },
      properties: {
        HAUPTNAME: "Immanuelskirche",
        NAMEN: "Kulturzentrum Immanuel",
        STRASSE: "Sternstraße 73",
        STADT: "Wuppertal",
        PLZ: "42275",
        TELEFON: "+49-202-641969",
        FAX: "+49-202-6481972",
        EMAIL: "info@immanuelskirche.de",
        URL: "https://www.immanuelskirche.de/",
        ART_INFO: "Konfession",
        INFO: "Anfang der 80er-jahre in ein Kulturzentrum umgewandelte ehemalige evangelische Kirche mit Konzerten als Programmschwerpunkt",
        HAUPTTHEMA: "Kirchen",
        THEMEN: "Kirchen, Veranstaltungsorte",
        URL_BILD: null,
        WEB_BILD: null,
        URHEBER: null,
        KEYURL: "immanuelskirche",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1485075021, 51.255894052],
      },
      properties: {
        HAUPTNAME: "Haltestelle Hauptbahnhof",
        NAMEN:
          "Schwebebahn-Bahnhof Hauptbahnhof, Schwebebahn-Haltestelle Hauptbahnhof, Hauptbahnhof / Döppersberg - Schwebebahn-Haltestelle",
        STRASSE: "Döppersberg",
        STADT: "Wuppertal",
        PLZ: "42103",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "Schwebebahn-Haltestelle",
        HAUPTTHEMA: "Schwebebahn-Haltestellen",
        THEMEN: "Schwebebahn-Haltestellen",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/POI-Stadt%20Wuppertal-001-041.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=1&dateiname_bild=POI-Stadt%20Wuppertal-001-041.jpg&name_strecke=POI%20-%20Stadt%20Wuppertal%20-06-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "hs-hbf",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 1",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.0713898336, 51.2341316464],
      },
      properties: {
        HAUPTNAME: "Bahnhof Vohwinkel",
        NAMEN:
          "Bahnhof Wuppertal-Vohwinkel, Wuppertal-Vohwinkel Bahnhof, Vohwinkel Bahnhof",
        STRASSE: "Bahnstraße",
        STADT: "Wuppertal",
        PLZ: "42327",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "DB- und S-Bahnhof",
        HAUPTTHEMA: "Bahnhöfe",
        THEMEN: "Bahnhöfe",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/POI-Stadt%20Wupp-016-02-24-049.jpg\n",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=7&dateiname_bild=POI-Stadt%20Wupp-016-02-24-049.jpg&name_strecke=POI%20-%20Stadt%20Wuppertal%20-22-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "bf-vohwinkel",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 1",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1513654066, 51.2345540254],
      },
      properties: {
        HAUPTNAME: "Von der Heydt-Park",
        NAMEN: null,
        STRASSE: null,
        STADT: "Wuppertal",
        PLZ: null,
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "Park / Forst",
        HAUPTTHEMA: "Grünanlagen und Wälder",
        THEMEN: "Grünanlagen und Wälder",
        URL_BILD: null,
        WEB_BILD: null,
        URHEBER: null,
        KEYURL: "park-heydt",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1725863617, 51.2690047686],
      },
      properties: {
        HAUPTNAME: "Nordbahntrasse",
        NAMEN: "Trasse Nordbahntrasse",
        STRASSE: "Dr.-Werner-Jackstädt-Weg",
        STADT: "Wuppertal",
        PLZ: null,
        TELEFON: null,
        FAX: null,
        EMAIL: "nordbahntrasse@stadt.wuppertal.de",
        URL: "https://www.wuppertal.de/tourismus-freizeit/gruenes_wuppertal/trassen/623-nordbahntrasse-Verlauf.php",
        ART_INFO: "Sportarten",
        INFO: "23 km langer Geh-, Rad- und Inlinerweg",
        HAUPTTHEMA: "Freizeitsportangebote",
        THEMEN: "Freizeitsportangebote",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Trass%20a%20Lo-013-04-03-008.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=4&dateiname_bild=Trass%20a%20Lo-013-04-03-008.jpg&name_strecke=Nordbahntrasse%20-%20Abschnitt%20Loh&format=0&fl=",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "nordbahntrasse",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.2137624146, 51.273279817],
      },
      properties: {
        HAUPTNAME: "Haltestelle Wupperfeld",
        NAMEN:
          "Schwebebahn-Bahnhof Wupperfeld, Schwebebahn-Haltestelle Wupperfeld, Wupperfeld - Schwebebahn-Haltestelle",
        STRASSE: "Brändströmstraße",
        STADT: "Wuppertal",
        PLZ: "42275",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "Schwebebahn-Haltestelle",
        HAUPTTHEMA: "Schwebebahn-Haltestellen",
        THEMEN: "Schwebebahn-Haltestellen",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Schwebebahn-016-02-03-048.jpg\n",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=6&dateiname_bild=Schwebebahn-016-02-03-048.jpg&name_strecke=Schwebebahn%20-%20Wahrzeichen%20von%20Wuppertal%20-9-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "hs-wupperfeld",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1120346749, 51.2449003669],
      },
      properties: {
        HAUPTNAME: "Sambatrasse",
        NAMEN: "Trasse Sambatrasse",
        STRASSE: null,
        STADT: "Wuppertal",
        PLZ: null,
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: "https://www.wuppertal.de/tourismus-freizeit/gruenes_wuppertal/trassen/samba-trasse.php",
        ART_INFO: "Sportarten",
        INFO: "10 km langer Geh- und Radweg",
        HAUPTTHEMA: "Freizeitsportangebote",
        THEMEN: "Freizeitsportangebote",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/POI-Stadt%20Wuppertal-001-032.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=1&dateiname_bild=POI-Stadt%20Wuppertal-001-032.jpg&name_strecke=POI%20-%20Stadt%20Wuppertal%20-05-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "sambatrasse",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1813589675, 51.2671867792],
      },
      properties: {
        HAUPTNAME: "Haltestelle Loher Brücke",
        NAMEN:
          "Schwebebahn-Bahnhof Loher Brücke / Junior Uni, Schwebebahn-Haltestelle Loher Brücke / Junior Uni, Loher Brücke / Junior Uni - Schwebebahn-Haltestelle",
        STRASSE: "Loher Straße",
        STADT: "Wuppertal",
        PLZ: "42283",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "Schwebebahn-Haltestelle",
        HAUPTTHEMA: "Schwebebahn-Haltestellen",
        THEMEN: "Schwebebahn-Haltestellen",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Ju-Un-Neub-012-09-12-2-022.jpg\n",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=2&dateiname_bild=Ju-Un-Neub-012-09-12-2-022.jpg&name_strecke=Schwebebahn%20-%20Wahrzeichen%20von%20Wuppertal&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "hs-loher-bruecke",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1820407048, 51.2668434621],
      },
      properties: {
        HAUPTNAME: "Junior Uni",
        NAMEN: "Forscherplattform Bergisches Land",
        STRASSE: "Am Brögel 31",
        STADT: "Wuppertal",
        PLZ: "42283",
        TELEFON: "+49-202-430-4390",
        FAX: "+49-202-430 439-39",
        EMAIL: "info@junioruni-wuppertal.de",
        URL: "http://www.junioruni-wuppertal.de",
        ART_INFO: "Art",
        INFO: "Wuppertaler Kinder-und Jugend-Universität für das Bergische Land gGmbH",
        HAUPTTHEMA: "Bildungseinrichtungen",
        THEMEN: "Bildungseinrichtungen, Gebäude und Bauwerke",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Junior%20Uni-015-12-02-008.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=4&dateiname_bild=Junior%20Uni-015-12-02-008.jpg&name_strecke=Junior%20Uni%20Neubau%20A150%20-%20Ansichten&format=0&fl=",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "junior-uni",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 1",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1089308661, 51.2409584171],
      },
      properties: {
        HAUPTNAME: "Zoologischer Garten",
        NAMEN: "Zoologischer Garten Wuppertal, Zoo Wuppertal",
        STRASSE: "Hubertusallee 30",
        STADT: "Wuppertal",
        PLZ: "42117",
        TELEFON: "+49-202-563-3600",
        FAX: "+49-202-563-5666",
        EMAIL: "kontakt@zoo-wuppertal.de",
        URL: "http://www.zoo-wuppertal.de",
        ART_INFO: "Art",
        INFO: "zoologischer Garten",
        HAUPTTHEMA: "Grünanlagen und Wälder",
        THEMEN: "Sehenswürdigkeiten, Grünanlagen und Wälder",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/POI-Stadt%20Wupp-016-02-24-099.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=1&dateiname_bild=Zoo-012-04-18-121.jpg&name_strecke=Besuch%20im%20Wuppertaler%20Zoo%20-3-%20Elefanten%20-%20Tiger&format=0&fl=",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "zoo",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 1",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.198251397, 51.2695268074],
      },
      properties: {
        HAUPTNAME: "Haltestelle Alter Markt",
        NAMEN:
          "Schwebebahn-Bahnhof Alter Markt, Schwebebahn-Haltestelle Alter Markt, Alter Markt - Schwebebahn-Haltestelle",
        STRASSE: null,
        STADT: "Wuppertal",
        PLZ: "42275",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "Schwebebahn-Haltestelle",
        HAUPTTHEMA: "Schwebebahn-Haltestellen",
        THEMEN: "Schwebebahn-Haltestellen",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Schwebebahn-016-02-03-047.jpg\n",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=5&dateiname_bild=Schwebebahn-016-02-03-047.jpg&name_strecke=Schwebebahn%20-%20Wahrzeichen%20von%20Wuppertal%20-9-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "hs-alter-markt",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 1",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1676767275, 51.2530140738],
      },
      properties: {
        HAUPTNAME: "Skulpturenpark Waldfrieden",
        NAMEN: "Tony Cragg",
        STRASSE: "Hirschstraße 12",
        STADT: "Wuppertal",
        PLZ: "42285",
        TELEFON: "+49-202-47898120",
        FAX: "+49-202-478981220",
        EMAIL: "mail@skulpturenpark-waldfrieden.de",
        URL: "http://www.skulpturenpark-waldfrieden.de",
        ART_INFO: "Träger",
        INFO: "Skulpturenpark und -ausstellung des international bekannten Künstlers Tony Cragg",
        HAUPTTHEMA: "Museen und Galerien",
        THEMEN:
          "Museen und Galerien, Sehenswürdigkeiten, Veranstaltungsorte, Grünanlagen und Wälder",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Skulpt-Park-DVD-088.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=5&dateiname_bild=Skulpt-Park-DVD-088.jpg&name_strecke=POI%20-%20Stadt%20Wuppertal%20-15-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "skulpturenpark",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 1",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1070815896, 51.2466040572],
      },
      properties: {
        HAUPTNAME: "Haltestelle Varresbecker Straße",
        NAMEN:
          "Schwebebahn-Bahnhof Varresbecker Straße, Schwebebahn-Haltestelle Varresbecker Straße, Varresbecker Straße - Schwebebahn-Haltestelle",
        STRASSE: "Friedrich-Ebert-Straße",
        STADT: "Wuppertal",
        PLZ: "42117",
        TELEFON: null,
        FAX: null,
        EMAIL: null,
        URL: null,
        ART_INFO: "Art",
        INFO: "Schwebebahn-Haltestelle",
        HAUPTTHEMA: "Schwebebahn-Haltestellen",
        THEMEN: "Schwebebahn-Haltestellen",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Schwebebahn-016-03-11-048.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=3&dateiname_bild=Schwebebahn-016-03-11-048.jpg&name_strecke=Schwebebahn%20-%20Wahrzeichen%20von%20Wuppertal%20-05-%20Bahnh%F6fe%20-05-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "hs-varresbecker-strasse",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.203207892, 51.2715258511],
      },
      properties: {
        HAUPTNAME: "Kunsthalle Barmen",
        NAMEN: null,
        STRASSE: "Geschwister-Scholl-Platz 4-6",
        STADT: "Wuppertal",
        PLZ: "42275",
        TELEFON: "+49-202-563-6571",
        FAX: null,
        EMAIL: null,
        URL: "https://www.wuppertal.de/microsite/kulturbuero/projekte/index.php",
        ART_INFO: "Träger",
        INFO: "Ausstellungsraum im Haus der Jugend",
        HAUPTTHEMA: "Museen und Galerien",
        THEMEN: "Museen und Galerien",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Museum-016-05-09-002.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=8&dateiname_bild=Museum-016-05-09-002.jpg&name_strecke=Von%20der%20Heydt-Museum-Kunsthalle&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "kulturraum-kunsthalle-barmen",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 1",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1767681511, 51.2625239782],
      },
      properties: {
        HAUPTNAME: "Polizeipräsidium Wuppertal",
        NAMEN:
          "Polizeiwache Unterbarmen, Polizei Unterbarmen, Wache Polizeipräsidium",
        STRASSE: "Friedrich-Engels-Allee 228",
        STADT: "Wuppertal",
        PLZ: "42285",
        TELEFON: "+49-202-284-0",
        FAX: "+49-202-284-8448",
        EMAIL: "poststelle@wuppertal.polizei.nrw.de",
        URL: "https://wuppertal.polizei.nrw/",
        ART_INFO: "Behördenzweig",
        INFO: null,
        HAUPTTHEMA: "Polizeidienststellen",
        THEMEN: "Polizeidienststellen",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/POI-Stadt%20Wuppertal-001-030.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=7&dateiname_bild=POI-Stadt%20Wuppertal-001-030.jpg&name_strecke=POI%20-%20Stadt%20Wuppertal%20-04-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "polizeipraesidium",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1590664673, 51.2603642555],
      },
      properties: {
        HAUPTNAME: "Botanischer Garten",
        NAMEN:
          "Botanischer Garten Elisenhöhe, Botanischer Garten Wuppertal, Hardt, Botanischer Garten",
        STRASSE: "Elisenhöhe 1",
        STADT: "Wuppertal",
        PLZ: "42107",
        TELEFON: "+49-202-563-4206",
        FAX: "+49-202-563-8092",
        EMAIL: "botanischergarten@stadt.wuppertal.de",
        URL: "http://www.botanischer-garten-wuppertal.de/wordpress/",
        ART_INFO: "Art",
        INFO: "Gartenanlage mitten in der Stadt mit vielfältigen Kursangeboten für Kunst, Kultur, Sport und jährlich stattfindenden Gartenfesten",
        HAUPTTHEMA: "Grünanlagen und Wälder",
        THEMEN:
          "Sehenswürdigkeiten, Grünanlagen und Wälder, Veranstaltungsorte",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Hardt-015-04-14-037.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=7&dateiname_bild=Hardt-015-04-14-037.jpg&name_strecke=Botanischer%20Garten%20Wuppertal%20-38-%20im%20April%202015&format=0&fl=",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "botanischer-garten",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 2",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1907045213, 51.266376808],
      },
      properties: {
        HAUPTNAME: "Engels-Haus",
        NAMEN: "Museum für Frühindustrialisierung, Historische Zentrum",
        STRASSE: "Engelsstraße 10",
        STADT: "Wuppertal",
        PLZ: "42283",
        TELEFON: "+49-202-563-4375",
        FAX: "+49-202-563-8027",
        EMAIL: "ankerpunkt@stadt.wuppertal.de",
        URL: "https://www.mi-wuppertal.de/",
        ART_INFO: "Träger",
        INFO: "Museum für Frühindustrialisierung der Stadt Wuppertal",
        HAUPTTHEMA: "Museen und Galerien",
        THEMEN:
          "Sehenswürdigkeiten, Museen und Galerien, Gebäude und Bauwerke, Veranstaltungsorte",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Eng-Haus-013-04-25-011%20%28Kopie%29.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=1&dateiname_bild=Eng-Haus-013-04-25-011%20%28Kopie%29.jpg&name_strecke=Engels%20Haus%20im%20Fr%FChling&format=0&fl=",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "engelshaus",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 1",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.2257594203, 51.2718350908],
      },
      properties: {
        HAUPTNAME: "Gaskessel Wuppertal",
        NAMEN: "Wuppertaler Gaskessel, Der Gaskessel, Gaskessel Heckinghausen",
        STRASSE: "Mohrenstraße 3",
        STADT: "Wuppertal",
        PLZ: "42289",
        TELEFON: "+49-202-26532896",
        FAX: null,
        EMAIL: "besucher@der-gaskessel.de",
        URL: "https://der-gaskessel.de",
        ART_INFO: "Art",
        INFO: "stadtbildprägender Gaskessel (Industriedenkmal) mit Beton-Neubau im Innenraum und Aussichtplattform / Skywalk auf dem Dach",
        HAUPTTHEMA: "Gebäude und Bauwerke",
        THEMEN: "Gebäude und Bauwerke, Veranstaltungsorte, Sehenswürdigkeiten",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/Gaskessel-19-04-24-006.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=7&dateiname_bild=Gaskessel-19-04-24-006.jpg&name_strecke=Gaskessel%20in%20Heckinghausen%20-11-&format=0&fl=",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "gaskessel",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 1",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [7.1933025722, 51.2674053399],
      },
      properties: {
        HAUPTNAME: "Tanztheater Pina Bausch GmbH",
        NAMEN: "Tanztheater Wuppertal",
        STRASSE: "Kurt-Drees-Straße 4",
        STADT: "Wuppertal",
        PLZ: "42283",
        TELEFON: "+49-202-563-4253",
        FAX: null,
        EMAIL: "info@pina-bausch.de",
        URL: "http://www.pina-bausch.de",
        ART_INFO: "Hinweis",
        INFO: "Spielstätte des von Pina Bausch gegründeten weltberühmten Tanztheaters im Wuppertaler Opernhaus",
        HAUPTTHEMA: "Theater",
        THEMEN: "Sehenswürdigkeiten, Theater, Veranstaltungsorte",
        URL_BILD:
          "http://www.fotokraemer-wuppertal.de/images/POI-Stadt%20Wupp-016-02-16-018.jpg",
        WEB_BILD:
          "http://www.fotokraemer-wuppertal.de/fotostrecke.php?nr_bild=6&dateiname_bild=POI-Stadt%20Wupp-016-02-16-018.jpg&name_strecke=POI%20-%20Stadt%20Wuppertal%20-21-&format=0&fl=&noparse",
        URHEBER: "Peter Krämer, Wuppertal",
        KEYURL: "tanztheater-pina-bausch",
        WARTUNG: "f",
        ZOOMPRIO: "zoomprio 1",
      },
    },
  ],
};

async function generatePoiJson() {
  const poiData = Object.assign({}, POI_DATA);
  const poiCount = poiData.features.length;

  let counter = 0;
  for (const feature of poiData.features) {
    if (feature.properties.URL_BILD) {
      const previewBase64 = await getPreviewBase64(feature.properties.URL_BILD);
      if (previewBase64) feature.properties.PREVIEW_BILD = previewBase64;
      counter += 1;
      console.log(`Preview images generated: ${counter}/${poiCount}`);
    }
  }

  return poiData;
}

async function getPreviewBase64(url) {
  try {
    const image = await Promise.race([
      axios.get(url, {
        responseType: "arraybuffer",
        timeout: 3000, // Set the timeout to 3 seconds
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 3000)
      ), // Reject if the request times out
    ]);

    const base64 = await new Promise((resolve, reject) => {
      jimp.read(image.data, (err, img) => {
        if (err) {
          console.error(err);
          return reject(err); // Reject the promise on error
        }
        if (!img) {
          return reject(new Error("Failed to load image")); // Handle failed image loading
        }

        // Continue with resizing and base64 conversion
        img
          .resize(PREVIEW_WIDTH, PREVIEW_HEIGHT)
          .getBase64(jimp.MIME_JPEG, (err, base64) => {
            if (err) {
              console.error(err);
              return reject(err);
            }
            resolve(base64);
          });
      });
    });

    return base64;
  } catch (err) {
    console.warn("Could not generate preview image for\n", url);
    return null;
  }
}

export { generatePoiJson };
