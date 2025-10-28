import {
  deleteTabImage,
  getTabImages,
  postTabImage,
} from '@/api/tab-image.service';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import { TabImage } from '@/types';
import CreateDashboardElementButton from '@/ui/Buttons/CreateDashboardElementButton';
import WizardDropdownSelection from '@/ui/WizardDropdownSelection';
import WizardFileUpload from '@/ui/WizardFileUpload';
import WizardLabel from '@/ui/WizardLabel';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { FC, useEffect, useRef, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import DeleteConfirmationModal from '../DeleteConfirmationModal';

type Props = {
  backgroundColor: string;
  borderColor: string;
};

const UploadTabImageWizard: FC<Props> = (props: Props) => {
  const auth = useAuth();
  const { openSnackbar } = useSnackbar();

  // TENANT / TABIMAGE
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [file, setFile] = useState<File | null>(null);
  const [tabImageName, setTabImageName] = useState('');
  const [tabImageBase64, setTabImageBase64] = useState('');
  const [selectedTabImageName, setSelectedTabImageName] = useState<string>('');
  const [selectedTabImageBase64, setSelectedTabImageBase64] =
    useState<string>('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const isUploading = useRef(false);

  // Multi Tenancy
  const params = useParams();
  const tenant = (params.tenant as string) || undefined;

  const { data: allImages, refetch: refetchTabImages } = useQuery({
    queryKey: ['tab-images'],
    queryFn: () => getTabImages(auth?.user?.access_token, tenant),
  });

  const handleSetFile = (file: File | undefined): void => {
    if (file) {
      const setFileData = async (): Promise<void> => {
        setTabImageName(file.name);
        const base64 = (await convertToBase64(file)) as string;
        setTabImageBase64(base64);
      };
      setFileData();
    } else {
      clearImage();
    }
  };

  const handleTabImagePreviewSelection = (value: string): void => {
    const selectedTabImage = allImages?.find(
      (image) => image.name === value.toString(),
    );
    if (selectedTabImage) {
      setSelectedTabImageName(value.toString());
      setSelectedTabImageBase64(selectedTabImage.imageBase64);
    } else {
      setSelectedTabImageName('');
      setSelectedTabImageBase64('');
    }
  };

  useEffect(() => {
    if (tabImageName && tabImageBase64) {
      isUploading.current = true;
      handleCreateTabImageUpload();
    }
  }, [tabImageName, tabImageBase64]);

  const handleCreateTabImageUpload = async (): Promise<void> => {
    const tabImageData: TabImage = {
      imageBase64: tabImageBase64,
      name: tabImageName,
      tenantId: tenant || '',
    };

    try {
      await postTabImage(auth?.user?.access_token, tabImageData, tenant);
      openSnackbar('Bild wurde erfolgreich erstellt!', 'success');
      clearImage();

      refetchTabImages();
    } catch (error) {
      openSnackbar('Logo konnte nicht gespeichert werden.', 'error');
    } finally {
      isUploading.current = false;
    }
  };

  async function convertToBase64(file: Blob): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = (): void => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error): void => {
        reject(error);
      };
    });
  }

  const handleDeleteTabImage = (): void => {
    if (!isDeleteModalOpen && selectedTabImageBase64) {
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDeleteTabImage = async (): Promise<void> => {
    if (isDeleteModalOpen && selectedTabImageName) {
      const image = allImages?.find((x) => x.name == selectedTabImageName);
      if (image && image.id) {
        await deleteTabImage(auth?.user?.access_token, image.id);
        await refetchTabImages();
        clearImage();
        // remove from all value assignments
      } else {
        openSnackbar('Bild konnte nicht gelöscht werden!', 'error');
      }

      setIsDeleteModalOpen(false);
    }
  };

  function clearImage(): void {
    setTabImageName('');
    setTabImageBase64('');
    setFile(null);
    setSelectedTabImageName('');
    setSelectedTabImageBase64('');
  }

  return (
    <>
      <div className="flex flex-row gap-4 mb-4 w-full">
        <WizardLabel label="Upload" />
        <WizardFileUpload
          setFile={(file: File | undefined): void => handleSetFile(file)}
        />
        <WizardDropdownSelection
          currentValue={selectedTabImageName}
          selectableValues={
            allImages && allImages.length > 0
              ? ['Kein Bild', ...allImages.map((image) => image.name)]
              : ['Kein Bild']
          }
          backgroundColor={props.backgroundColor}
          borderColor={props.borderColor}
          iconColor="'#fff'"
          onSelect={(value: string | number): void =>
            handleTabImagePreviewSelection(value.toString())
          }
        />
        <CreateDashboardElementButton
          label="Löschen"
          handleClick={(): void => handleDeleteTabImage()}
        />
      </div>
      <div className="flex flex-row gap-4 mb-4 w-full">
        <WizardLabel label="Vorschau" />
        <div className="flex flex-row justify-center w-full pt-4 pb-2">
          {selectedTabImageBase64 ? (
            <img
              src={selectedTabImageBase64}
              alt="Image Preview"
              className="rounded-lg border-2 border-bg[#59647D] object-cover w-[200px] h-[200px]"
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              Kein Bild
            </div>
          )}
        </div>
      </div>

      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          onClose={(): void => setIsDeleteModalOpen(false)}
          onDelete={(): Promise<void> => confirmDeleteTabImage()}
        />
      )}
    </>
  );
};

export default UploadTabImageWizard;
