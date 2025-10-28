import { ReactElement, useEffect, useState } from 'react';
import WizardLabel from './WizardLabel';
import WizardTextfield from './WizardTextfield';
import { Tab, TabImage, ValueToImageData } from '@/types';
import CreateDashboardElementButton from './Buttons/CreateDashboardElementButton';
import UploadTabImageWizard from '@/components/Wizards/UploadTabImageWizard';
import WizardDropdownSelection from './WizardDropdownSelection';
import { getTabImages } from '@/api/tab-image.service';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from 'react-oidc-context';
import { useParams } from 'next/navigation';
import HorizontalDivider from './HorizontalDivider';

type ValuesToImageProps = {
  initialValues: ValueToImageData[];
  backgroundColor: string;
  borderColor: string;
  handleTabChange: (update: Partial<Tab>) => void;
};

export default function ValuesToImageFields(
  props: ValuesToImageProps,
): ReactElement {
  const auth = useAuth();
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { openSnackbar } = useSnackbar();

  const { initialValues, backgroundColor, borderColor, handleTabChange } =
    props;

  const [inputValues, setInputValues] =
    useState<ValueToImageData[]>(initialValues);

  const [imageValues, setImageValues] = useState<TabImage[]>([]);

  // Multi Tenancy
  const params = useParams();
  const tenant = (params.tenant as string) || undefined;

  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: allImages, refetch: refetchTabImages } = useQuery({
    queryKey: ['tab-images'],
    queryFn: () => getTabImages(auth?.user?.access_token, tenant),
  });

  useEffect(() => {
    if (
      inputValues &&
      inputValues.length > 0 &&
      imageValues &&
      imageValues.length == 0 &&
      allImages?.length
    ) {
      const newImageValues = [];
      for (let i = 0; i < inputValues.length; i++) {
        const tabImage = allImages.find((x) => x.id == inputValues[i].imageId);
        if (tabImage) {
          newImageValues[i] = tabImage;
        }
      }
      setImageValues(newImageValues);
    }
  }, [inputValues, allImages]);

  const handleMinValueChange = (value: string, index: number): void => {
    const newInputValues = [...inputValues];
    newInputValues[index].min = value;
    setInputValues(newInputValues);

    handleTabChange({ valuesToImages: newInputValues });
  };

  // const handleMaxValueChange = (value: string, index: number): void => {
  //   const newInputValues = [...inputValues];
  //   newInputValues[index].max = value;
  //   setInputValues(newInputValues);

  //   handleTabChange({ valuesToImages: newInputValues });
  // };

  const handleRemoveInputValue = (index: number): void => {
    const newInputValues = [...inputValues];
    newInputValues.splice(index, 1);
    setInputValues(newInputValues);

    handleTabChange({ valuesToImages: newInputValues });
  };

  const handleAddAdditionalInputValue = (): void => {
    const newRow: ValueToImageData = {
      min: '',
      max: '',
      imageId: '',
    };

    const newInputValues = [...inputValues];
    newInputValues.push(newRow);

    setInputValues(newInputValues);

    handleTabChange({ valuesToImages: newInputValues });
  };

  const handleSetImage = (index: number, name: string): void => {
    const newInputValues = [...inputValues];
    const newImageValues = [...imageValues];
    const match = allImages?.find((x) => x.name == name);
    if (match && match.id) {
      newInputValues[index].imageId = match.id;
      newImageValues[index] = match;
    } else {
      newInputValues[index].imageId = '';
      if (newImageValues[index]) {
        newImageValues.splice(index, 1);
      }
    }

    setInputValues(newInputValues);
    setImageValues(newImageValues);

    handleTabChange({ valuesToImages: newInputValues });
  };

  return (
    <div>
      {/** File Upload Handling */}
      <UploadTabImageWizard
        backgroundColor={backgroundColor}
        borderColor={borderColor}
      />
      <HorizontalDivider />
      {inputValues.map((value, index) => (
        <div key={`main-value-${index}`} className="flex flex-col gap-4 mb-4">
          <div className="flex justify-start items-center content-center gap-4">
            <WizardLabel label="Wert" />
            <WizardTextfield
              value={value.min}
              onChange={(value: string | number): void =>
                handleMinValueChange(value.toString(), index)
              }
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
            {/* <WizardLabel label="Max" />
            <WizardTextfield
              value={value.max}
              onChange={(value: string | number): void =>
                handleMaxValueChange(value.toString(), index)
              }
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            /> */}
            <WizardLabel label="Bild" />
            <WizardDropdownSelection
              currentValue={imageValues[index]?.name || ''}
              selectableValues={
                allImages && allImages.length > 0
                  ? ['Kein Bild', ...allImages.map((image) => image.name)]
                  : ['Kein Bild']
              }
              backgroundColor={backgroundColor}
              borderColor={borderColor}
              iconColor="#fff"
              onSelect={(value: string | number): void =>
                handleSetImage(index, value.toString())
              }
            />
            {imageValues[index]?.imageBase64 ? (
              <img
                src={imageValues[index].imageBase64}
                alt="Image Preview"
                className="rounded-lg border-2 border-bg[#59647D] object-cover w-[40px] h-[40px]"
              />
            ) : (
              <div className="flex flex-col items-center justify-center">
                Kein Bild
              </div>
            )}

            <CreateDashboardElementButton
              label="-"
              handleClick={(): void => handleRemoveInputValue(index)}
            />
          </div>
        </div>
      ))}
      <CreateDashboardElementButton
        label="+ Zuweisung hinzufügen"
        handleClick={handleAddAdditionalInputValue}
      />
    </div>
  );
}
