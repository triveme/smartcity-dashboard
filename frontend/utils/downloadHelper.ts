import { getDashboardDownloadData } from '@/api/dashboard-service';
import { getWidgetDownloadData } from '@/api/widget-service';

export const downloadCSV = async (
  accessToken: string,
  id: string,
  type: string,
  openSnackbar: (message: string, variant: 'success' | 'error') => void,
): Promise<void> => {
  try {
    let csvData;

    // Use switch to handle different types
    switch (type) {
      case 'dashboard':
        try {
          csvData = await getDashboardDownloadData(accessToken, id);
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
          csvData = await getWidgetDownloadData(accessToken, id);
        } catch (error) {
          console.error('Widget-Daten konnten nicht abgerufen werden:', error);
          openSnackbar('Widget-Daten konnten nicht abgerufen werden', 'error');
          return;
        }
        break;
      default:
        console.error('Nicht unterstützter Typ für den Datenexport:', type);
        openSnackbar('Nicht unterstützter Typ für den Datenexport.', 'error');
        return;
    }

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
