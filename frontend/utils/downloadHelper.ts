import {
  getDashboardByIdWithContent,
  getDashboardDownloadData,
} from '@/api/dashboard-service';
import {
  getWidgetDownloadData,
  getWidgetWithChildrenById,
} from '@/api/widget-service';
import {
  CorporateInfo,
  DashboardWithContent,
  WidgetWithChildren,
  ChartData,
  CurrentAreaConfig,
  tabComponentSubTypeEnum,
  tabComponentTypeEnum,
} from '@/types';

type ExportDataWhitelistType = {
  type: tabComponentTypeEnum;
  subType: tabComponentSubTypeEnum;
};

export const getAvailableWidgets = async (
  accessToken: string,
  type: string,
  id: string,
): Promise<DashboardWithContent | WidgetWithChildren | undefined> => {
  let widgets;

  try {
    switch (type) {
      case 'dashboard':
        try {
          widgets = await getDashboardByIdWithContent(accessToken, id);
          break;
        } catch (error) {
          console.error(
            'Widget-With-Content konntet nicht abgerufen werden:',
            error,
          );
          return;
        }
      case 'widget':
        try {
          widgets = await getWidgetWithChildrenById(accessToken, id);
          break;
        } catch (error) {
          console.error(
            'Widget-With-Content konntet nicht abgerufen werden:',
            error,
          );
          return;
        }
    }
  } catch (error) {
    console.error(error);
  }

  return widgets;
};

export const downloadCSV = async (
  accessToken: string,
  id: string,
  type: string,
  openSnackbar: (message: string, variant: 'success' | 'error') => void,
  currentAreaConfig: CurrentAreaConfig | CurrentAreaConfig[],
  widgetIds?: string[],
): Promise<void> => {
  try {
    let csvData;

    // Use switch to handle different types
    switch (type) {
      case 'dashboard':
        try {
          csvData = await getDashboardDownloadData(
            accessToken,
            currentAreaConfig,
            widgetIds ? widgetIds : [],
            id,
          );
          break;
        } catch (error) {
          console.error(
            'Dashboard-Daten konnten nicht abgerufen werden:',
            error,
          );
          openSnackbar(
            'Dashboard-Daten konnten nicht abgerufen werden',
            'error',
          );
          return;
        }
      case 'widget':
        try {
          csvData = await getWidgetDownloadData(
            currentAreaConfig,
            accessToken,
            id,
          );
          break;
        } catch (error) {
          console.error('Widget-Daten konnten nicht abgerufen werden:', error);
          openSnackbar('Widget-Daten konnten nicht abgerufen werden', 'error');
          return;
        }
      default:
        console.error('Nicht unterstützter Typ für den Datenexport:', type);
        openSnackbar('Nicht unterstützter Typ für den Datenexport.', 'error');
        return;
    }

    // console.log('csvData lalala', csvData);

    // Create a Blob from the CSV string
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });

    // Create a link element to trigger the download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    // Set up the download filename and trigger the download
    link.setAttribute('href', url);
    link.setAttribute('download', `dashboard_${id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    openSnackbar('CSV-Datei erfolgreich heruntergeladen.', 'success');
  } catch (error) {
    console.error('Failed to download CSV file:', error);
    openSnackbar('Der Download der CSV-Datei ist fehlgeschlagen.', 'error');
  }
};

export function downloadThemeJSON(
  data:
    | CorporateInfo
    | Omit<CorporateInfo, 'headerLogo' | 'sidebarLogos'>
    | undefined,
  filename = 'corporateInfo.json',
): void {
  try {
    const json = JSON.stringify(data, null, 2);

    const blob = new Blob([json], { type: 'application/json' });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download JSON file:', error);
  }
}

/** Standard-Dateiname für den Theme-Export (ohne Endung). */
export const DEFAULT_THEME_FILE_NAME = 'corporate-identity-theme';

/** Macht aus Benutzereingabe einen sicheren Dateinamen (ohne Endung). */
export function sanitizeFileName(
  input: string,
  fallback = DEFAULT_THEME_FILE_NAME,
): string {
  const cleaned = input
    .trim()
    .replace(/\.json$/i, '')
    // eslint-disable-next-line no-control-regex
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_')
    .replace(/^\.+/, '')
    .slice(0, 100);
  return cleaned.length > 0 ? cleaned : fallback;
}

export function downloadChartDataCsv(data: ChartData[]): void {
  const headers = ['entityId', 'attrName', 'value', 'index'];

  const escapeCsv = (value: unknown): string => {
    const text = String(value ?? '');

    if (text.includes(',') || text.includes('"') || text.includes('\n')) {
      return `"${text.replaceAll('"', '""')}"`;
    }

    return text;
  };

  const rows = data.flatMap((series) =>
    series.values.map(([index, value]) => [
      series.id ?? '',
      series.name,
      value,
      index,
    ]),
  );

  const csv = [
    headers.join(','),
    ...rows.map((row) => row.map(escapeCsv).join(',')),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csv], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'chart-data.csv';
  link.click();

  URL.revokeObjectURL(url);
}

const DATA_EXPORT_WHITELIST: ExportDataWhitelistType[] = [
  {
    type: tabComponentTypeEnum.diagram,
    subType: tabComponentSubTypeEnum.lineChart,
  },
  {
    type: tabComponentTypeEnum.diagram,
    subType: tabComponentSubTypeEnum.lineChartDynamic,
  },
  {
    type: tabComponentTypeEnum.diagram,
    subType: tabComponentSubTypeEnum.barChart,
  },
  {
    type: tabComponentTypeEnum.diagram,
    subType: tabComponentSubTypeEnum.barChartDynamic,
  },
  {
    type: tabComponentTypeEnum.diagram,
    subType: tabComponentSubTypeEnum.barChartHorizontal,
  },
];

export function isDataExportSupported(
  componentType?: string,
  componentSubType?: string,
): boolean {
  if (!componentType || !componentSubType) return false;

  return DATA_EXPORT_WHITELIST.some(
    (entry) =>
      entry.type === componentType && entry.subType === componentSubType,
  );
}
