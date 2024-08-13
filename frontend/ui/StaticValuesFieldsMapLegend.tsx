import { useState, ReactElement } from 'react';
import WizardTextfield from './WizardTextfield';
import { MapModalLegend, Tab } from '@/types';
import CreateDashboardElementButton from './Buttons/CreateDashboardElementButton';
import ColorPickerComponent from './ColorPickerComponent';
import IconSelection from './Icons/IconSelection';
import WizardLabel from './WizardLabel';
import { WizardErrors } from '@/types/errors';
import { DEFAULT_MAP_MODAL_LEGEND } from '@/utils/objectHelper';

type StaticValuesFieldMapLegendProps = {
  errors?: WizardErrors;
  handleTabChange: (update: Partial<Tab>) => void;
  iconColor: string;
  backgroundColor: string;
  borderColor: string;
  initialMapLegendValues: MapModalLegend[];
};

export default function StaticValuesFieldMapLegend(
  props: StaticValuesFieldMapLegendProps,
): ReactElement {
  const {
    handleTabChange,
    iconColor,
    borderColor,
    backgroundColor,
    initialMapLegendValues,
  } = props;

  const defaultMapModalLegend: MapModalLegend = DEFAULT_MAP_MODAL_LEGEND;
  const [mapLegendValues, setMapLegendValues] = useState<MapModalLegend[]>(
    initialMapLegendValues || [defaultMapModalLegend],
  );

  const handleAddMapLegendValue = (): void => {
    const newValues = [...mapLegendValues, defaultMapModalLegend];
    handleTabChange({ mapLegendValues: newValues });
    setMapLegendValues(newValues);
  };

  const handleRemoveMapLegendValue = (index: number): void => {
    const updatedMapLegendValues = mapLegendValues.filter(
      (_, idx) => idx !== index,
    );
    handleTabChange({
      mapLegendValues: updatedMapLegendValues,
    });
    setMapLegendValues(updatedMapLegendValues);
  };

  return (
    <div>
      {mapLegendValues.map((value, index) => (
        <div
          className="flex flex-row justify-start items-end pb-2 gap-x-4"
          key={index}
        >
          <div className="flex flex-col w-full">
            <WizardLabel label="Icon" />
            <IconSelection
              activeIcon={value?.icon || 'ChevronLeft'}
              handleIconSelect={(newValue): void => {
                const updatedMapLegendValues = mapLegendValues.map(
                  (legend, idx) =>
                    idx === index
                      ? {
                          ...legend,
                          icon: newValue.toString(),
                        }
                      : legend,
                );
                handleTabChange({
                  mapLegendValues: updatedMapLegendValues,
                });
                setMapLegendValues(updatedMapLegendValues);
              }}
              iconColor={iconColor}
              borderColor={borderColor}
            />
          </div>
          <div className="flex flex-col w-full">
            <ColorPickerComponent
              currentColor={value?.iconBackgroundColor || '#71A273'}
              handleColorChange={(newValue): void => {
                const updatedMapLegendValues = mapLegendValues.map(
                  (legend, idx) =>
                    idx === index
                      ? {
                          ...legend,
                          iconBackgroundColor: newValue.toString(),
                        }
                      : legend,
                );
                handleTabChange({
                  mapLegendValues: updatedMapLegendValues,
                });
                setMapLegendValues(updatedMapLegendValues);
              }}
              label="Icon-Hintergrundfarbe"
            />
          </div>
          <div className="flex flex-col w-full">
            <WizardLabel label="Icon-Beschriftung" />
            <WizardTextfield
              value={value?.label}
              onChange={(newValue): void => {
                const updatedMapLegendValues = mapLegendValues.map(
                  (legend, idx) =>
                    idx === index
                      ? {
                          ...legend,
                          label: newValue.toString(),
                        }
                      : legend,
                );
                handleTabChange({
                  mapLegendValues: updatedMapLegendValues,
                });
                setMapLegendValues(updatedMapLegendValues);
              }}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
          </div>

          <CreateDashboardElementButton
            label="-"
            handleClick={(): void => handleRemoveMapLegendValue(index)}
          />
        </div>
      ))}

      <CreateDashboardElementButton
        label="+ Legende hinzufügen"
        handleClick={handleAddMapLegendValue}
      />
    </div>
  );
}
