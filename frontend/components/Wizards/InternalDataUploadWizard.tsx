'use client';

import { useState, useEffect, useMemo, useRef, FC } from 'react';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import WizardLabel from '@/ui/WizardLabel';
import WizardNumberfield from '@/ui/WizardNumberfield';
import { WizardErrors } from '@/types/errors';
import GenericButton from '@/ui/Buttons/GenericButton';
import {
  getInternalDataById,
  postData,
  updateData,
} from '@/api/internal-data-service';
import { useAuth } from 'react-oidc-context';
import { AxiosError } from 'axios';
import WizardTextfield from '@/ui/WizardTextfield';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import CancelButton from '@/ui/Buttons/CancelButton';
import SaveButton from '@/ui/Buttons/SaveButton';

type InternalDataUploadWizardProps = {
  borderColor: string;
  backgroundColor: string;
  tenant: string;
};

type CsvPreview = {
  errors: string[];
  timeLabels: string[];
  attributeLabels: string[];
  rows: Array<{ id: string; description: string; value: string }>;
  dataRowCount: number;
  valueColumnCount: number;
};

function createCsvPreview(
  csvText: string,
  firstDataColIndex: number,
  firstDataRowIndex: number,
  timeGroupRowCount: number,
): CsvPreview | undefined {
  if (!csvText.trim()) {
    return undefined;
  }

  const rows = csvText
    .trim()
    .split(/\r?\n/)
    .map((line) => line.split(';'));
  const errors: string[] = [];
  const columnCount = rows[0]?.length ?? 0;

  if (!Number.isInteger(firstDataColIndex) || firstDataColIndex < 0) {
    errors.push(
      'Der Daten-Spaltenindex muss eine nicht-negative ganze Zahl sein.',
    );
  }
  if (!Number.isInteger(firstDataRowIndex) || firstDataRowIndex < 0) {
    errors.push(
      'Der Daten-Zeilenindex muss eine nicht-negative ganze Zahl sein.',
    );
  }
  if (!Number.isInteger(timeGroupRowCount) || timeGroupRowCount < 0) {
    errors.push(
      'Die Anzahl der Zeit-Reihen muss eine nicht-negative ganze Zahl sein.',
    );
  }
  if (firstDataRowIndex > rows.length) {
    errors.push('Der Daten-Zeilenindex liegt hinter dem Ende der Datei.');
  }
  if (timeGroupRowCount > firstDataRowIndex) {
    errors.push('Die Zeit-Reihen dürfen nicht hinter dem Datenbereich enden.');
  }
  if (firstDataColIndex >= columnCount) {
    errors.push('Der Daten-Spaltenindex liegt außerhalb der CSV-Spalten.');
  }

  const dataRows = rows.slice(firstDataRowIndex);
  if (dataRows.length === 0) {
    errors.push('Mit dieser Konfiguration wurden keine Datenzeilen gefunden.');
  }

  dataRows.forEach((row, index) => {
    if (!row[0]?.trim()) {
      errors.push(`Datenzeile ${firstDataRowIndex + index + 1} hat keine ID.`);
    }
    if (row.length <= firstDataColIndex) {
      errors.push(
        `Datenzeile ${firstDataRowIndex + index + 1} hat keine konfigurierte Wertespalte.`,
      );
    }
  });

  const labelsForRows = (sourceRows: string[][]): string[] =>
    sourceRows
      .map((row) => {
        const key = row[0]?.trim();
        const value = row[firstDataColIndex]?.trim();
        return key && value ? `${key}: ${value}` : '';
      })
      .filter(Boolean);

  return {
    errors: [...new Set(errors)],
    timeLabels: labelsForRows(rows.slice(0, timeGroupRowCount)),
    attributeLabels: labelsForRows(
      rows.slice(timeGroupRowCount, firstDataRowIndex),
    ),
    rows: dataRows.slice(0, 5).map((row) => ({
      id: row[0]?.trim() || '',
      description:
        row
          .slice(1, firstDataColIndex)
          .map((value) => value.trim())
          .filter(Boolean)
          .join(', ') || '—',
      value: row[firstDataColIndex]?.trim() || '—',
    })),
    dataRowCount: dataRows.length,
    valueColumnCount: Math.max(columnCount - firstDataColIndex, 0),
  };
}

const InternalDataUploadWizard: FC<InternalDataUploadWizardProps> = (
  props: InternalDataUploadWizardProps,
) => {
  const { openSnackbar } = useSnackbar();
  const params = useSearchParams();
  const router = useRouter();
  const { borderColor, backgroundColor, tenant } = props;
  const itemId = params.get('id');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileText, setFileText] = useState('');
  const [collection, setCollection] = useState('');
  const [firstDataColIndex, setFirstDataColIndex] = useState(1);
  const [firstDataRowIndex, setFirstDataRowIndex] = useState(2);
  const [timeGroupRowCount, setTimeGroupRowCount] = useState(1);
  const [errors] = useState<WizardErrors>({});
  const isUploading = useRef(false);
  const csvPreview = useMemo(
    () =>
      createCsvPreview(
        fileText,
        firstDataColIndex,
        firstDataRowIndex,
        timeGroupRowCount,
      ),
    [fileText, firstDataColIndex, firstDataRowIndex, timeGroupRowCount],
  );

  const { data: fetchedData } = useQuery({
    queryKey: ['internal-datas', itemId],
    queryFn: () => getInternalDataById(auth?.user?.access_token, itemId!),
    enabled: !!itemId,
  });

  useEffect(() => {
    if (fetchedData) {
      setFirstDataColIndex(fetchedData.firstDataColIndex);
      setFirstDataRowIndex(fetchedData.firstDataRowIndex);
      setTimeGroupRowCount(fetchedData.timeGroupRowCount);
      setCollection(fetchedData.collection);
      setFileName(fetchedData.source);
      setFileText(fetchedData.data);
    }
  }, [fetchedData]);

  const auth = useAuth();

  useEffect(() => {
    if (file) {
      const setFileData = async (): Promise<void> => {
        setFileName(file.name);
        const t = await file.text();
        setFileText(t);
      };

      setFileData();
    }
  }, [file]);

  const handleCreatefileUpload = async (): Promise<void> => {
    if (!fileName || !collection) {
      openSnackbar('Collection und Datei angeben', 'error');
      return;
    }
    if (csvPreview?.errors.length) {
      openSnackbar('CSV-Konfiguration überprüfen', 'error');
      return;
    }
    const toSave = {
      collection: collection,
      data: fileText || undefined,
      source: fileName,
      type: 'csv',
      firstDataColIndex: firstDataColIndex,
      firstDataRowIndex: firstDataRowIndex,
      timeGroupRowCount: timeGroupRowCount,
      tenantAbbreviation: tenant,
    };

    try {
      if (itemId) {
        await updateData(itemId, auth?.user?.access_token, toSave);
      } else {
        await postData(auth?.user?.access_token, {
          ...toSave,
          data: fileText,
        });
        openSnackbar('Datei wurde erfolgreich hochgeladen!', 'success');
      }
      router.back();
    } catch (error: unknown) {
      const message =
        (error as AxiosError<{ message: string }>).response?.data?.message ||
        'Datei konnte nicht gespeichert werden.';
      openSnackbar(message, 'error');
    } finally {
      isUploading.current = false;
    }
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
  };

  function clearFile(): void {
    setFileName('');
    setFileText('');
    setFile(null); // Also clear the file state
  }

  return (
    <div
      style={{
        borderColor: borderColor,
      }}
      className="rounded-lg border-4 p-4"
    >
      <h2 className="text-xl font-bold mb-4"> Neue Datei Hochladen</h2>
      <p className="pt-2 pb-8 px-4 border-4 border-transparent">
        Indizes sind 0-basiert. Der Index Wert entspricht also der Anzahl der
        Zeilen/Spalten vor dem Datenbereich.
        <br />
        Standartwerte entsprechen einem Datenbereich beginnend in B3.
      </p>
      <div className="flex flex-row w-full px-2 mb-4">
        <div className="flex-grow basis-1/4 px-2">
          <WizardLabel label="Collection" />
          <WizardTextfield
            borderColor={borderColor}
            value={collection}
            onChange={(val) => setCollection(val.toString())}
            backgroundColor={backgroundColor}
          />
        </div>
        <div className="flex-grow basis-1/4 px-2">
          <WizardLabel label="Index Daten-Spalte" />
          <WizardNumberfield
            value={firstDataColIndex}
            onChange={(value: string | number): void =>
              setFirstDataColIndex(parseInt(value.toString()))
            }
            error={errors && errors.nameError}
            borderColor={borderColor}
            backgroundColor={backgroundColor}
          />
        </div>
        <div className="flex-grow basis-1/4 px-2">
          <WizardLabel label="Anzahl Zeit-Reihen" />
          <WizardNumberfield
            value={timeGroupRowCount}
            onChange={(value: string | number): void =>
              setTimeGroupRowCount(parseInt(value.toString()))
            }
            error={errors && errors.nameError}
            borderColor={borderColor}
            backgroundColor={backgroundColor}
          />
        </div>
        <div className="flex-grow basis-1/4 px-2">
          <WizardLabel label="Index Daten-Zeile" />
          <WizardNumberfield
            value={firstDataRowIndex}
            onChange={(value: string | number): void =>
              setFirstDataRowIndex(parseInt(value.toString()))
            }
            error={errors && errors.nameError}
            borderColor={borderColor}
            backgroundColor={backgroundColor}
          />
        </div>
      </div>
      <div className="flex flex-row w-full px-2">
        <div className="flex-grow basis-3/4 px-2">
          {/* Input for uploading image */}
          {!fileName && (
            <input
              style={{ width: '100%' }}
              type="file"
              name="file"
              id="fileInput"
              accept="text/csv"
              multiple={false}
              onChange={fileHandler}
              className="mt-4"
            />
          )}
          {fileName && <span>{fileName} </span>}
        </div>
        <div className="flex-grow flex justify-end basis-1/4 px-2">
          <div className="mr-4">
            {fileName && (
              <GenericButton label="Datei entfernen" handleClick={clearFile} />
            )}
          </div>
          {/* <GenericButton
            label="Upload"
            icon="SaveIcon"
            handleClick={handleCreatefileUpload}
          /> */}
        </div>
      </div>
      {csvPreview && (
        <div
          className="mx-2 mt-6 rounded-lg border-4 p-4"
          style={{ borderColor }}
        >
          <h3 className="text-lg font-bold mb-3">CSV-Vorschau</h3>
          {csvPreview.errors.length > 0 ? (
            <div className="mb-4 rounded p-3 bg-red-100 text-red-900">
              <p className="font-semibold">Konfiguration prüfen:</p>
              <ul className="list-disc pl-5">
                {csvPreview.errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mb-4">
              {csvPreview.dataRowCount} Datenzeilen und{' '}
              {csvPreview.valueColumnCount} Wertespalte(n) erkannt.
            </p>
          )}
          {csvPreview.timeLabels.length > 0 && (
            <p className="mb-2">
              <span className="font-semibold">Zeit:</span>{' '}
              {csvPreview.timeLabels.join(', ')}
            </p>
          )}
          {csvPreview.attributeLabels.length > 0 && (
            <p className="mb-4">
              <span className="font-semibold">Attribute:</span>{' '}
              {csvPreview.attributeLabels.join(', ')}
            </p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="border-b p-2">ID</th>
                  <th className="border-b p-2">Name</th>
                  <th className="border-b p-2">Erster Wert</th>
                </tr>
              </thead>
              <tbody>
                {csvPreview.rows.map((row, index) => (
                  <tr key={`${row.id}-${index}`}>
                    <td className="border-b p-2">{row.id || '—'}</td>
                    <td className="border-b p-2">{row.description}</td>
                    <td className="border-b p-2">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="flex justify-end py-4 mb-8">
        <CancelButton />
        <SaveButton handleSaveClick={handleCreatefileUpload} />
      </div>
    </div>
  );
};

export default InternalDataUploadWizard;
