import { useState, ReactElement, useEffect } from 'react';
import WizardTextfield from './WizardTextfield';
import { Tab } from '@/types';
import CreateDashboardElementButton from './Buttons/CreateDashboardElementButton';
import ColorPickerComponent from './ColorPickerComponent';
import IconSelection from './Icons/IconSelection';
import WizardLabel from './WizardLabel';

type StaticValuesFieldProps = {
  initialChartStaticValues: number[];
  initialStaticColors: string[];
  initialStaticValuesTicks?: number[];
  initialStaticValuesLogos?: string[];
  initialStaticValuesTexts?: string[];
  initialIconColor?: string;
  initialLabelColor?: string;
  error?: string;
  handleTabChange: (update: Partial<Tab>) => void;
  backgroundColor: string;
  borderColor: string;
  type?: string;
};

export default function StaticValuesField(
  props: StaticValuesFieldProps,
): ReactElement {
  const {
    initialChartStaticValues,
    initialStaticColors,
    initialStaticValuesTicks = [],
    initialStaticValuesLogos = [],
    initialStaticValuesTexts = [],
    initialIconColor,
    initialLabelColor,
    error,
    handleTabChange,
    borderColor,
    backgroundColor,
    type,
  } = props;

  const [inputValues, setInputValues] = useState<string[]>(
    initialChartStaticValues.map(String),
  );
  const [tickValues, setTickValues] = useState<string[]>(
    initialStaticValuesTicks.map(String),
  );
  const [logoValues, setLogoValues] = useState<string[]>(
    initialStaticValuesLogos,
  );
  const [textValues, setTextValues] = useState<string[]>(
    initialStaticValuesTexts,
  );
  const [iconColorValues, setIconColorValues] = useState(
    initialIconColor || '#ffffff',
  );
  const [labelColorValues, setLabelColorValues] = useState(
    initialLabelColor || '#000000',
  );
  const [isEditing, setIsEditing] = useState(false);

  // Synchronize only if no active edits are in progress
  useEffect(() => {
    if (!isEditing) {
      setInputValues(initialChartStaticValues.map(String));
      setTickValues(initialStaticValuesTicks.map(String));
      setLogoValues(initialStaticValuesLogos);
      setTextValues(initialStaticValuesTexts);
      setIconColorValues(initialIconColor || '#000000');
      setLabelColorValues(initialLabelColor || '#000000');
    }
  }, [
    initialChartStaticValues,
    initialStaticValuesTicks,
    initialStaticValuesLogos,
    initialStaticValuesTexts,
    initialIconColor,
    initialLabelColor,
    isEditing,
  ]);

  const handleChangeValue = (value: string | number, index: number): void => {
    setIsEditing(true);

    const newInputValues = [...inputValues];
    newInputValues[index] = value.toString();
    setInputValues(newInputValues);

    const numericValue = parseFloat(value.toString());
    const newNumericValues = [...initialChartStaticValues];
    newNumericValues[index] = isNaN(numericValue) ? 0 : numericValue;
    handleTabChange({ chartStaticValues: newNumericValues });
  };

  const handleAddMainValue = (): void => {
    const newValues = [...initialChartStaticValues, 0];
    const newColors = [...initialStaticColors, 'FFFFFF'];
    handleTabChange({
      chartStaticValues: newValues,
      chartStaticValuesColors: newColors,
    });
    setInputValues([...inputValues, '']);
  };

  const handleRemoveMainValue = (index: number): void => {
    const newValues = initialChartStaticValues.filter(
      (_, idx) => idx !== index,
    );
    const newColors = initialStaticColors.filter((_, idx) => idx !== index);
    handleTabChange({
      chartStaticValues: newValues,
      chartStaticValuesColors: newColors,
    });
    setInputValues(inputValues.filter((_, idx) => idx !== index));
  };

  const handleAddAdditionalValue = (): void => {
    const newTicks = [...tickValues, ''];
    const newLogos = [...logoValues, 'ChevronLeft'];
    const newTexts = [...textValues, ''];
    handleTabChange({
      chartStaticValuesTicks: newTicks.map(Number),
      chartStaticValuesLogos: newLogos,
      chartStaticValuesTexts: newTexts,
    });
    setTickValues(newTicks);
    setLogoValues(newLogos);
    setTextValues(newTexts);
  };

  const handleRemoveAdditionalValue = (index: number): void => {
    const newTicks = tickValues.filter((_, idx) => idx !== index);
    const newLogos = logoValues.filter((_, idx) => idx !== index);
    const newTexts = textValues.filter((_, idx) => idx !== index);
    handleTabChange({
      chartStaticValuesTicks: newTicks.map(Number),
      chartStaticValuesLogos: newLogos,
      chartStaticValuesTexts: newTexts,
    });
    setTickValues(newTicks);
    setLogoValues(newLogos);
    setTextValues(newTexts);

    if (newTicks.length === 0) {
      setLogoValues([]);
    }
  };

  const handleColorChange = (color: string, index: number): void => {
    const newColors = [...initialStaticColors];
    newColors[index] = color;
    handleTabChange({ chartStaticValuesColors: newColors });
  };

  const handleChangeTick = (tick: string | number, index: number): void => {
    const newTickValues = [...tickValues];
    newTickValues[index] = tick.toString();
    setTickValues(newTickValues);
    handleTabChange({ chartStaticValuesTicks: newTickValues.map(Number) });
  };

  const handleChangeLogo = (logo: string | number, index: number): void => {
    const newLogoValues = [...logoValues];
    newLogoValues[index] = logo.toString();
    setLogoValues(newLogoValues);
    handleTabChange({ chartStaticValuesLogos: newLogoValues });
  };

  const handleChangeText = (text: string, index: number): void => {
    const newTextValues = [...textValues];
    newTextValues[index] = text;
    setTextValues(newTextValues);
    handleTabChange({ chartStaticValuesTexts: newTextValues });
  };

  const handleIconColorChange = (color: string): void => {
    setIconColorValues(color);
    handleTabChange({ iconColor: color });
  };

  const handleLabelColorChange = (color: string): void => {
    setLabelColorValues(color);
    handleTabChange({ labelColor: color });
  };

  return (
    <div>
      {inputValues.map((value, index) => (
        <div key={`main-value-${index}`} className="flex flex-col gap-4 mb-4">
          <div className="flex justify-start items-center content-center gap-4">
            <WizardTextfield
              value={value}
              onChange={(value: string | number): void =>
                handleChangeValue(value, index)
              }
              isNumeric={true}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
              error={error}
            />

            <ColorPickerComponent
              currentColor={initialStaticColors[index] || 'FFFFFF'}
              handleColorChange={(color): void =>
                handleColorChange(color, index)
              }
              label="Farbe"
            />
            <CreateDashboardElementButton
              label="-"
              handleClick={(): void => handleRemoveMainValue(index)}
            />
          </div>
        </div>
      ))}

      {type !== 'sliderOverview' && (
        <CreateDashboardElementButton
          label="+ Statischen Wert hinzufügen"
          handleClick={handleAddMainValue}
        />
      )}

      {type === 'slider' && (
        <>
          <div className="flex gap-4 h-14">
            <ColorPickerComponent
              currentColor={iconColorValues}
              handleColorChange={handleIconColorChange}
              label="Schrift und Icons"
            />
            <ColorPickerComponent
              currentColor={labelColorValues}
              handleColorChange={handleLabelColorChange}
              label="Beschreibungstext"
            />
          </div>
          {tickValues.map((_, index) => (
            <div
              key={`tick-${index}`}
              className="flex flex-row items-center gap-4 mb-2"
            >
              <div className="w-64">
                {index === 0 && <WizardLabel label="Value" />}
                <WizardTextfield
                  value={tickValues[index] || 0}
                  onChange={(value: string | number): void =>
                    handleChangeTick(value, index)
                  }
                  isNumeric={true}
                  borderColor={borderColor}
                  backgroundColor={backgroundColor}
                  error={error}
                />
              </div>
              <div className="w-1/2">
                {index === 0 && <WizardLabel label="Icon" />}
                <IconSelection
                  activeIcon={logoValues[index] || ''}
                  handleIconSelect={(value: string): void => {
                    handleChangeLogo(value, index);
                  }}
                  iconColor={'#ffffff'}
                  borderColor={borderColor}
                />
              </div>
              <div className="w-1/2">
                {index === 0 && <WizardLabel label="Attribut" />}
                <WizardTextfield
                  value={textValues[index] || ''}
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
          ))}

          <CreateDashboardElementButton
            label="+ Markierungen statische Werte"
            handleClick={handleAddAdditionalValue}
          />
        </>
      )}

      {type === 'value' && (
        <>
          <div className="flex gap-4 h-14">
            <ColorPickerComponent
              currentColor={iconColorValues}
              handleColorChange={handleIconColorChange}
              label="Schrift und Icons"
            />
            <ColorPickerComponent
              currentColor={labelColorValues}
              handleColorChange={handleLabelColorChange}
              label="Beschreibungstext"
            />
          </div>
          {tickValues.map((_, index) => (
            <div key={`tick-${index}`} className="flex flex-col gap-4 mb-4">
              <div className="flex gap-4 h-14">
                <div className="w-64">
                  <WizardTextfield
                    value={tickValues[index] || 0}
                    onChange={(value): void => handleChangeTick(value, index)}
                    isNumeric={false}
                    borderColor={borderColor}
                    backgroundColor={backgroundColor}
                    error={error}
                  />
                </div>
                <div className="w-full">
                  <WizardTextfield
                    value={textValues[index] || 'Label'}
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
            label="+ Label hinzufügen"
            handleClick={handleAddAdditionalValue}
          />
        </>
      )}
    </div>
  );
}
