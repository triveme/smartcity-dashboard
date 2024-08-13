'use client';

import { useState, useEffect, useRef, FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from 'react-oidc-context';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import { CorporateInfo, Logo } from '@/types';
import { getLogos, postLogo } from '@/api/logo-service';
import { useParams } from 'next/navigation';
import { env } from 'next-runtime-env';

type Props = {
  corporateInfo: CorporateInfo | undefined;
};

const CIUploadLogoWizard: FC<Props> = () => {
  const auth = useAuth();
  const { openSnackbar } = useSnackbar();

  // TENANT / LOGO
  const [file, setFile] = useState<File | null>(null);
  const [logoName, setLogoName] = useState('');
  const [logoType, setLogoType] = useState('');
  const [logoSize, setLogoSize] = useState('');
  const [logoBase64, setLogoBase64] = useState('');
  const isUploading = useRef(false);

  // Multi Tenancy
  const params = useParams();
  const NEXT_PUBLIC_MULTI_TENANCY = env('NEXT_PUBLIC_MULTI_TENANCY');
  const tenant =
    NEXT_PUBLIC_MULTI_TENANCY === 'true'
      ? (params.tenant as string)
      : undefined;
  const { refetch: refetchLogos } = useQuery({
    queryKey: ['logos'],
    queryFn: () => getLogos(auth?.user?.access_token, tenant),
  });

  useEffect(() => {
    if (file) {
      const setFileData = async (): Promise<void> => {
        setLogoName(file.name);
        setLogoSize(file.size.toString());

        const base64 = (await convertToBase64(file)) as string;
        setLogoBase64(base64);

        const type = base64.substring(
          'data:'.length,
          base64.indexOf(';base64,'),
        );
        setLogoType(type);
      };

      setFileData();
    }
  }, [file]);

  useEffect(() => {
    if (
      logoName &&
      logoSize &&
      logoBase64 &&
      logoType &&
      !isUploading.current
    ) {
      isUploading.current = true;
      handleCreateLogoUpload();
    }
  }, [logoName, logoSize, logoBase64, logoType]);

  const handleCreateLogoUpload = async (): Promise<void> => {
    const logoData: Logo = {
      logo: logoBase64,
      logoHeight: 200,
      logoWidth: 200,
      logoName: logoName,
      format: logoType,
      size: logoSize,
      tenantId: tenant || '',
    };

    try {
      await postLogo(auth?.user?.access_token, logoData, tenant);
      openSnackbar('Logo wurde erfolgreich erstellt!', 'success');

      refetchLogos();
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

  const imageHandler = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ): Promise<void> => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      openSnackbar('Logofehler. Bitte versuche es erneut.', 'error');
      return;
    }

    setFile(selectedFile);

    event.target.value = '';
  };

  function clearImage(): void {
    setLogoName('');
    setLogoType('');
    setLogoSize('');
    setLogoBase64('');
    setFile(null); // Also clear the file state
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4"> Logo Hochladen</h2>
      <div className="flex flex-row w-full">
        <div className="flex flex-row justify-center w-full pt-4 pb-2">
          {/* Input for uploading image */}
          <input
            type="file"
            name="logo"
            id="logoInput"
            accept="image/*"
            multiple={false}
            onChange={imageHandler}
            className="hidden"
          />

          {/* Label for triggering file input */}
          <label
            htmlFor="logoInput"
            className="w-[200px] h-[200px] bg-[#59647D] flex flex-col justify-center items-center rounded-lg cursor-pointer"
          >
            {logoBase64 ? (
              <img
                src={logoBase64}
                alt="Uploaded logo"
                className="rounded-lg border-2 border-bg[#59647D] object-cover w-[200px] h-[200px]"
              />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div>Logo hochladen</div>
              </div>
            )}
          </label>
        </div>
        <div className="flex flex-col w-full pt-4 pb-2 justify-start">
          <div>Logo-Anforderungen:</div>
          <ul className="list-disc">
            <li className="ml-8">File size should be less than 100 KB</li>
            <li className="ml-8">
              Recommended image dimensions: 200px x 200px
            </li>
            <li className="ml-8">Accepted file formats: SVG, JPEG, JPG, PNG</li>
          </ul>
        </div>
      </div>

      {/* Button to clear uploaded image */}
      {logoName && (
        <div className="mt-4">
          <button
            className="p-4 h-8 w-48 rounded-lg flex justify-evenly items-center content-center"
            onClick={clearImage}
          >
            <div>Verwerfen</div>
          </button>
        </div>
      )}
    </div>
  );
};

export default CIUploadLogoWizard;
