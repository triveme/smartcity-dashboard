'use client';

import { useState, useEffect, useRef, FC } from 'react';
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
        openSnackbar('Date wurde erfolgreich hochgeladen!', 'success');
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
      <div className="flex justify-end py-4 mb-8">
        <CancelButton />
        <SaveButton handleSaveClick={handleCreatefileUpload} />
      </div>
    </div>
  );
};

export default InternalDataUploadWizard;
