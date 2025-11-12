import { useState, ReactElement, useEffect } from 'react';
import WizardTextfield from './WizardTextfield';
import { Tab } from '@/types';
import CreateDashboardElementButton from './Buttons/CreateDashboardElementButton';

type UnitsFieldProps = {
  initialUnitsTexts?: string[];
  error?: string;
  handleTabChange: (update: Partial<Tab>) => void;
  backgroundColor: string;
  borderColor: string;
  fontColor: string;
  type?: string;
  isTextValues?: boolean;
};

export default function UnitsField(props: UnitsFieldProps): ReactElement {
  const {
    initialUnitsTexts: initialUnitsTexts = [],
    error,
    handleTabChange,
    borderColor,
    backgroundColor,
  } = props;

  const [textValues, setTextValues] = useState<string[]>(initialUnitsTexts);

  // Synchronize only if no active edits are in progress
  useEffect(() => {
    setTextValues(initialUnitsTexts);
  }, []);

  const handleAddAdditionalValue = (): void => {
    const newTexts = [...textValues, 'Einheit'];
    handleTabChange({
      mapUnitsTexts: newTexts,
    });
    setTextValues(newTexts);
  };

  const handleRemoveAdditionalValue = (index: number): void => {
    const newTexts = textValues.filter((_, idx) => idx !== index);
    handleTabChange({
      mapUnitsTexts: newTexts,
    });
    setTextValues(newTexts);
  };

  const handleChangeText = (text: string, index: number): void => {
    const newTextValues = [...textValues];
    newTextValues[index] = text;
    setTextValues(newTextValues);
    handleTabChange({ mapUnitsTexts: newTextValues });
  };

  return (
    <div>
      {textValues.map((_, index) => (
        <div key={`text-${index}`} className="flex flex-col gap-4 mb-4">
          <div className="flex gap-4 h-14">
            <div className="w-full">
              <WizardTextfield
                value={textValues[index]}
                onChange={(value): void =>
                  handleChangeText(value.toString(), index)
                }
                isNumeric={false}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
                error={error}
              />
            </div>
            <CreateDashboardElementButton
              label="-"
              handleClick={(): void => handleRemoveAdditionalValue(index)}
            />
          </div>
        </div>
      ))}

      <CreateDashboardElementButton
        label="+ Einheit hinzufügen"
        handleClick={handleAddAdditionalValue}
      />
    </div>
  );
}
