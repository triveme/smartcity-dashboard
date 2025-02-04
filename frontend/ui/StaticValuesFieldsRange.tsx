import { useState, ReactElement, useEffect } from 'react';
import WizardTextfield from './WizardTextfield';
import { Tab } from '@/types';
import CreateDashboardElementButton from './Buttons/CreateDashboardElementButton';
import ColorPickerComponent from './ColorPickerComponent';
import IconSelection from './Icons/IconSelection';
import WizardLabel from './WizardLabel';

type StaticValuesFieldProps = {
  initialStaticValuesTicks?: number[];
  initialStaticValuesLogos?: string[];
  initialStaticValuesTexts?: string[];
  initialIconColor?: string;
  initialLabelColor?: string;
  error?: string;
  handleTabChange: (update: Partial<Tab>) => void;
  initialRangeStaticValuesMin: number[];
  initialRangeStaticValuesMax: number[];
  initialRangeStaticValuesColors: string[];
  initialRangeStaticValuesLogos: string[];
  initialRangeStaticValuesLabels: string[];
  iconColor: string;
  backgroundColor: string;
  borderColor: string;
  type?: string;
};

type InputValue = {
  min: string;
  max: string;
  color: string;
  label: string;
  icon: string;
};

export default function StaticValuesFieldRange(
  props: StaticValuesFieldProps,
): ReactElement {
  const {
    initialStaticValuesTicks = [],
    initialStaticValuesLogos = [],
    initialStaticValuesTexts = [],
    initialIconColor,
    initialLabelColor,
    error,
    handleTabChange,
    initialRangeStaticValuesMin = [],
    initialRangeStaticValuesMax = [],
    initialRangeStaticValuesColors = [],
    initialRangeStaticValuesLogos = [],
    initialRangeStaticValuesLabels = [],
    iconColor,
    borderColor,
    backgroundColor,
    type,
  } = props;

  const [inputValues, setInputValues] = useState<InputValue[]>([]);
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

  useEffect(() => {
    const newInputValues = initialRangeStaticValuesMin.map((min, index) => ({
      min: min.toString(),
      max: (initialRangeStaticValuesMax[index] || 0).toString(),
      color: initialRangeStaticValuesColors[index] || '#FFFFFF',
      label: initialRangeStaticValuesLabels[index] || '',
      icon: initialRangeStaticValuesLogos[index] || '',
    }));
    setInputValues(newInputValues);
    setIconColorValues(initialIconColor || '#000000');
    setLabelColorValues(initialLabelColor || '#000000');
  }, [
    initialRangeStaticValuesMin,
    initialRangeStaticValuesMax,
    initialRangeStaticValuesColors,
    initialRangeStaticValuesLogos,
    initialRangeStaticValuesLabels,
    initialIconColor,
    initialLabelColor,
  ]);

  const handleChange = (
    index: number,
    field: keyof InputValue,
    value: string,
  ): void => {
    const newInputValues = [...inputValues];
    newInputValues[index][field] = value;
    setInputValues(newInputValues);
    updateParent(newInputValues);
  };

  const handleAddMainValue = (): void => {
    const newInputValue: InputValue = {
      min: '0',
      max: '0',
      color: '#FFFFFF',
      label: '',
      icon: '',
    };
    setInputValues([...inputValues, newInputValue]);
    updateParent([...inputValues, newInputValue]);
  };

  const handleRemoveMainValue = (index: number): void => {
    const newInputValues = inputValues.filter((_, idx) => idx !== index);
    setInputValues(newInputValues);
    updateParent(newInputValues);
  };

  const updateParent = (newValues: InputValue[]): void => {
    handleTabChange({
      rangeStaticValuesMin: newValues.map((v) => parseFloat(v.min)),
      rangeStaticValuesMax: newValues.map((v) => parseFloat(v.max)),
      rangeStaticValuesColors: newValues.map((v) => v.color),
      rangeStaticValuesLogos: newValues.map((v) => v.icon),
      rangeStaticValuesLabels: newValues.map((v) => v.label),
      iconColor: iconColorValues,
      labelColor: labelColorValues,
    });
  };

  // Slider legend settings
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
        <div key={`main-value-${index}`} className="flex flex-col gap-4 mb-2">
          <div className="flex justify-start items-center content-center gap-4">
            <div className="basis-1/6">
              {index === 0 && <WizardLabel label="Minimum" />}
              <WizardTextfield
                value={value.min}
                onChange={(newValue: string | number): void => {
                  handleChange(index, 'min', newValue as string);
                }}
                isNumeric={true}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />
            </div>
            <div className="basis-1/6">
              {index === 0 && <WizardLabel label="Maximum" />}
              <WizardTextfield
                value={value.max}
                onChange={(newValue) =>
                  handleChange(index, 'max', newValue as string)
                }
                borderColor={borderColor}
                backgroundColor={backgroundColor}
                error={error}
              />
            </div>
            <div className="basis-2/6">
              {index === 0 && <WizardLabel label="Icon" />}
              <IconSelection
                activeIcon={value.icon}
                handleIconSelect={(iconValue) =>
                  handleChange(index, 'icon', iconValue)
                }
                iconColor={iconColor}
                borderColor={borderColor}
              />
            </div>
            <div className="basis-2/6">
              {index === 0 && <WizardLabel label="Label" />}
              <WizardTextfield
                value={value.label}
                onChange={(newValue) =>
                  handleChange(index, 'label', newValue as string)
                }
                borderColor={borderColor}
                backgroundColor={backgroundColor}
                error={error}
              />
            </div>
            <div className="basis-1/6">
              {index === 0 && <div>&nbsp;</div>}
              <ColorPickerComponent
                currentColor={value.color}
                handleColorChange={(color) =>
                  handleChange(index, 'color', color)
                }
                label="Farbe"
                width={200}
              />
            </div>

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
          <div className="flex gap-x-4 my-4">
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
                  onChange={(value): void => handleChangeTick(value, index)}
                  isNumeric={false}
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
    </div>
  );
}
