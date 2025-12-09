import { CustomMapImage, Tab } from '@/types';
import { ReactElement, useEffect, useRef, useState } from 'react';
import WizardLabel from '../../../ui/WizardLabel';
import WizardFileUpload from '../../../ui/WizardFileUpload';
import CreateDashboardElementButton from '../../../ui/Buttons/CreateDashboardElementButton';
import { useAuth } from 'react-oidc-context';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import WizardDropdownSelection from '../../../ui/WizardDropdownSelection';
import {
  deleteCustomMapImage,
  getCustomMapImages,
  postCustomMapImage,
} from '@/api/tab.custom-map-image.service';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

type CustomMapUploadProps = {
  customMapImageId: string;
  backgroundColor: string;
  borderColor: string;
  handleTabChange: (update: Partial<Tab>) => void;
};

export default function CustomMapUpload(
  props: CustomMapUploadProps,
): ReactElement {
  const auth = useAuth();
  const { openSnackbar } = useSnackbar();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { customMapImageId, backgroundColor, borderColor, handleTabChange } =
    props;

  // image upload states
  const [uploadImageName, setUploadImageName] = useState('');
  const [upLoadImageBase64, setUploadImageBase64] = useState('');
  const [uploadImageWidth, setUploadImageWidth] = useState(0);
  const [uploadImageHeight, setUploadImageHeight] = useState(0);

  // map image states
  const [selectedImageId, setSelectedImageId] = useState(customMapImageId);
  const [selectedImageName, setSelectedImageName] = useState('');
  const [selectedImageBase64, setSelectedImageBase64] = useState('');
  const [selectedImageWidth, setSelectedImageWidth] = useState(0);
  const [selectedImageHeight, setSelectedImageHeight] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const isUploading = useRef(false);

  // Multi Tenancy
  const params = useParams();
  const tenant = (params.tenant as string) || undefined;

  const { data: allCustomMapImages, refetch: refetchCustomMapImages } =
    useQuery({
      queryKey: ['custom-map-images'],
      queryFn: () => getCustomMapImages(auth?.user?.access_token, tenant),
    });

  const handleSetFile = (file: File | undefined): void => {
    if (file) {
      const setFileData = async (): Promise<void> => {
        if (
          !['.jpg', '.jpeg', '.png', '.svg'].some((x) => file.name.endsWith(x))
        ) {
          openSnackbar('Bitte nur Bilder hochladen (JPG, PNG, SVG)', 'error');
          return;
        }

        setUploadImageName(file.name);
        const base64 = (await convertToBase64(file)) as string;
        setUploadImageBase64(base64);

        if (file.name.toLowerCase().endsWith('.svg')) {
          const reader = new FileReader();
          reader.onloadend = (): void => {
            const doc = new DOMParser().parseFromString(
              reader.result!.toString(),
              'application/xml',
            );
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const viewbox = (doc.documentElement as any).viewBox.baseVal;
            console.log(viewbox.width, viewbox.height);
            setUploadImageWidth(viewbox.width);
            setUploadImageHeight(viewbox.height);
          };
          reader.readAsText(file);
        } else {
          const img = new Image();
          img.onload = (): void => {
            setUploadImageWidth(img.width);
            setUploadImageHeight(img.height);
          };
          img.src = base64;
        }
      };
      setFileData();
    } else {
      setUploadImageName('');
      setUploadImageBase64('');
      setUploadImageWidth(0);
      setUploadImageHeight(0);
    }
  };

  useEffect(() => {
    if (
      allCustomMapImages &&
      allCustomMapImages.length > 0 &&
      selectedImageId &&
      selectedImageId.length > 0 &&
      !selectedImageName &&
      !selectedImageBase64
    ) {
      const match = allCustomMapImages?.find((x) => x.id === selectedImageId);
      if (match && match.id) {
        setSelectedImageId(match.id);
        setSelectedImageName(match.name);
        setSelectedImageBase64(match.imageBase64);
        setSelectedImageWidth(match.width);
        setSelectedImageHeight(match.height);
      }
    }
  }, [
    allCustomMapImages,
    selectedImageId,
    selectedImageName,
    selectedImageBase64,
    setSelectedImageId,
    setSelectedImageName,
    setSelectedImageBase64,
    setSelectedImageWidth,
    setSelectedImageHeight,
  ]);

  useEffect(() => {
    if (
      uploadImageName &&
      upLoadImageBase64 &&
      uploadImageWidth > 0 &&
      uploadImageHeight > 0
    ) {
      isUploading.current = true;
      handleFileUpload();
    }
  }, [uploadImageName, upLoadImageBase64, uploadImageWidth, uploadImageHeight]);

  const handleFileUpload = async (): Promise<void> => {
    const customImageMapData: CustomMapImage = {
      tenantId: tenant || '',
      name: uploadImageName,
      imageBase64: upLoadImageBase64,
      width: uploadImageWidth,
      height: uploadImageHeight,
    };

    try {
      await postCustomMapImage(
        auth?.user?.access_token,
        customImageMapData,
        tenant,
      );
      openSnackbar('Karte wurde erfolgreich hochgeladen!', 'success');
      handleImageSelection(uploadImageName);

      setUploadImageName('');
      setUploadImageBase64('');
      setUploadImageWidth(0);
      setUploadImageHeight(0);
      refetchCustomMapImages();
    } catch (error) {
      openSnackbar('Karte konnte nicht hochgeladen werden.', 'error');
    } finally {
      isUploading.current = false;
    }
  };

  const handleDeleteSelectedMapImage = (): void => {
    if (!isDeleteModalOpen && selectedImageId) {
      setIsDeleteModalOpen(true);
    }
  };

  const confirmDeleteCustomMapImage = async (): Promise<void> => {
    if (isDeleteModalOpen && selectedImageId) {
      try {
        await deleteCustomMapImage(auth?.user?.access_token, selectedImageId);
        await refetchCustomMapImages();
        clearSelectedImage();
      } catch (error) {
        openSnackbar('Fehler beim Löschen', 'error');
        console.error(error);
      } finally {
        setIsDeleteModalOpen(false);
      }
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

  useEffect(() => {
    if (
      selectedImageName.length > 0 &&
      selectedImageBase64.length > 0 &&
      selectedImageId.length > 0 &&
      selectedImageWidth > 0 &&
      selectedImageHeight > 0
    ) {
      handleTabChange({ customMapImageId: selectedImageId });
    }
  }, [
    selectedImageName,
    selectedImageBase64,
    selectedImageId,
    selectedImageWidth,
    selectedImageHeight,
  ]);

  const handleImageSelection = (value: string): void => {
    const selectedImage = allCustomMapImages?.find(
      (image) => image.name === value.toString(),
    );
    if (selectedImage) {
      setSelectedImageName(value);
      setSelectedImageBase64(selectedImage.imageBase64);
      setSelectedImageId(selectedImage.id || '');
      setSelectedImageWidth(selectedImage.width);
      setSelectedImageHeight(selectedImage.height);
      handleTabChange({ customMapImageId: selectedImage.id });
    } else {
      clearSelectedImage();
    }
  };

  const clearSelectedImage = (): void => {
    setSelectedImageId('');
    setSelectedImageName('');
    setSelectedImageBase64('');
  };

  return (
    <>
      <div className="flex flex-row gap-4 mb-4 w-full">
        {/* Upload, Dropdown Selection, Delete from DB */}
        <WizardLabel label="Upload" />
        <WizardFileUpload
          accept='".jpg, .jpeg, .png, .svg'
          setFile={(file: File | undefined): void => handleSetFile(file)}
        />
      </div>
      <div className="flex flex-row gap-4 w-full">
        {/* Map Image */}
        <WizardLabel label="Karte" />
        <WizardDropdownSelection
          currentValue={selectedImageName}
          selectableValues={
            allCustomMapImages && allCustomMapImages.length > 0
              ? ['', ...allCustomMapImages.map((image) => image.name)]
              : ['']
          }
          onSelect={function (value: string | number): void {
            handleImageSelection(value.toString());
          }}
          iconColor={'#fff'}
          borderColor={borderColor}
          backgroundColor={backgroundColor}
        />
        <CreateDashboardElementButton
          label="Löschen"
          handleClick={(): void => handleDeleteSelectedMapImage()}
        />
      </div>
      {isDeleteModalOpen && (
        <DeleteConfirmationModal
          onClose={(): void => setIsDeleteModalOpen(false)}
          onDelete={(): Promise<void> => confirmDeleteCustomMapImage()}
        />
      )}
    </>
  );
}
