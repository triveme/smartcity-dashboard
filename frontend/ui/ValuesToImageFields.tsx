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

  // Validation state for each row (min input)
  const [minErrors, setMinErrors] = useState<string[]>(
    Array(Math.max(0, inputValues.length)).fill(''),
  );

  // Validate a single input value for the min field.
  // Allowed: non-empty string; single number; inclusive numeric range: a-b or a–b (en dash).
  const validateMin = (raw: string): string => {
    const v = (raw ?? '').toString().trim();
    if (!v) return 'Pflichtfeld: bitte einen Wert eingeben.';

    const toNum = (s: string): number | null => {
      const nrm = (s ?? '').replace(',', '.').trim();
      if (nrm === '') return null;
      const n = Number(nrm);
      return Number.isFinite(n) ? n : null;
    };

    // Range pattern: a-b or a–b; allow spaces; allow decimals and negatives
    const range = v.match(
      /^\s*(-?\d+(?:[.,]\d+)?)\s*[-–]\s*(-?\d+(?:[.,]\d+)?)\s*$/,
    );
    if (range) {
      const a = toNum(range[1]);
      const b = toNum(range[2]);
      if (a === null || b === null) return 'Ungültiger Zahlenbereich.';
      return '';
    }

    // Single numeric value
    const singleNum = toNum(v);
    if (singleNum !== null) return '';

    // Otherwise treat as string label; any non-empty string is fine
    return '';
  };

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
  useEffect(() => {
    const errs = inputValues.map((v) => validateMin(v.min));
    setMinErrors(errs);
  }, [inputValues.length]);

  const handleMinValueChange = (value: string, index: number): void => {
    const newInputValues = [...inputValues];
    newInputValues[index].min = value;
    setInputValues(newInputValues);

    // validate and store error for this row
    const err = validateMin(value);
    const newErrors = [...minErrors];
    newErrors[index] = err;
    setMinErrors(newErrors);

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

      <div className="text-xs text-gray-400 mb-3">
        Erlaubte Formate: Text (z. B. free, occupied), Zahl (z. B. 10) oder
        Bereich (z. B. 10-20). Bereiche sind inklusiv. Dezimaltrennzeichen ','
        oder '.'; Leerzeichen sind erlaubt.
      </div>
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
              placeholderText="z. B.: free, 10, 10-20"
              error={minErrors[index]}
            />
            {minErrors[index] && (
              <div className="text-xs text-red-500 mt-1">
                {minErrors[index]}
              </div>
            )}
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
