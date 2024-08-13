import { useState, ReactElement, CSSProperties } from 'react';
import WizardTextfield from './WizardTextfield';
import {
  MapModalWidget,
  Tab,
  tabComponentTypeEnum,
  tabComponentSubTypeEnum,
} from '@/types';
import CreateDashboardElementButton from './Buttons/CreateDashboardElementButton';
import ColorPickerComponent from './ColorPickerComponent';
import WizardDropdownSelection from './WizardDropdownSelection';
import { chartComponentSubTypes } from '@/utils/enumMapper';
import WizardLabel from './WizardLabel';
import HorizontalDivider from './HorizontalDivider';
import { WizardErrors } from '@/types/errors';
import { EMPTY_MAP_MODAL_WIDGET } from '@/utils/objectHelper';

type StaticValuesFieldProps = {
  errors?: WizardErrors;
  handleTabChange: (update: Partial<Tab>) => void;
  backgroundColor: string;
  borderColor: string;
  initialMapModalWidgetsValues?: MapModalWidget[];
};

export default function StaticValuesFieldMapWidgets(
  props: StaticValuesFieldProps,
): ReactElement {
  const {
    errors,
    handleTabChange,
    borderColor,
    backgroundColor,
    initialMapModalWidgetsValues,
  } = props;

  const defaultMapModalWidget: MapModalWidget = EMPTY_MAP_MODAL_WIDGET;
  const [mapWidgetValues, setMapWidgetValues] = useState<MapModalWidget[]>(
    initialMapModalWidgetsValues || [defaultMapModalWidget],
  );

  const getAllowableComponentTypes = (): string[] => {
    return Object.values(tabComponentTypeEnum).filter(
      (type) =>
        type === tabComponentTypeEnum.default ||
        type === tabComponentTypeEnum.diagram,
    );
  };

  const getAllowableComponentSubTypes = (): {
    label: string;
    value: string;
  }[] => {
    return chartComponentSubTypes.filter(
      (subType) =>
        subType.value === '' ||
        subType.value === tabComponentSubTypeEnum.degreeChart180 ||
        subType.value === tabComponentSubTypeEnum.stageableChart,
    );
  };

  const componentTypes = getAllowableComponentTypes();
  const componentSubTypes = getAllowableComponentSubTypes();

  const handleAddMapWidgetValue = (): void => {
    const newValues = [...mapWidgetValues, defaultMapModalWidget];
    handleTabChange({ mapWidgetValues: newValues });
    setMapWidgetValues(newValues);
  };

  const handleRemoveMapWidgetValue = (index: number): void => {
    const updatedMapWidgetValues = mapWidgetValues.filter(
      (_, idx) => idx !== index,
    );
    handleTabChange({
      mapWidgetValues: updatedMapWidgetValues,
    });
    setMapWidgetValues(updatedMapWidgetValues);
  };

  const errorStyle: CSSProperties = {
    borderWidth: '4px',
    borderRadius: '0.5rem',
    borderColor: '#FFEB3B',
    background: backgroundColor,
    padding: '6px',
  };

  return (
    <div>
      {mapWidgetValues.map((value, index) => {
        const mapWidgetHasError =
          errors?.mapModalWidgetIndexError?.includes(index);

        return (
          <>
            <div className="flex flex-row justify-between" key={index}>
              <div
                className={`flex flex-col w-full mr-8`}
                style={mapWidgetHasError ? errorStyle : {}}
              >
                {/* component, subcomponent and attributes */}
                <div className="flex flex-row justify-between gap-x-2">
                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label="Komponente" />
                    <WizardDropdownSelection
                      currentValue={value?.componentType || ''}
                      selectableValues={componentTypes}
                      onSelect={(newValue): void => {
                        const updatedMapWidgetValues = mapWidgetValues.map(
                          (widget, idx) =>
                            idx === index
                              ? {
                                  ...widget,
                                  componentType: newValue.toString(),
                                  componentSubType: '',
                                }
                              : widget,
                        );
                        handleTabChange({
                          mapWidgetValues: updatedMapWidgetValues,
                        });
                        setMapWidgetValues(updatedMapWidgetValues);
                      }}
                      iconColor={'fff'}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label="Typ" />
                    <WizardDropdownSelection
                      currentValue={
                        (componentSubTypes || []).find(
                          (option) => option.value === value?.componentSubType,
                        )?.label || ''
                      }
                      selectableValues={(componentSubTypes || []).map(
                        (option) => option.label,
                      )}
                      onSelect={(label: string | number): void => {
                        const enumValue =
                          (componentSubTypes || []).find(
                            (option) => option.label === label,
                          )?.value || '';
                        const updatedMapWidgetValues = mapWidgetValues.map(
                          (widget, idx) =>
                            idx === index
                              ? { ...widget, componentSubType: enumValue }
                              : widget,
                        );
                        handleTabChange({
                          mapWidgetValues: updatedMapWidgetValues,
                        });
                        setMapWidgetValues(updatedMapWidgetValues);
                      }}
                      iconColor={'fff'}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label="Attribute" />
                    <WizardDropdownSelection
                      currentValue={value?.attributes || ''}
                      selectableValues={[]}
                      onSelect={(newValue): void => {
                        const updatedMapWidgetValues = mapWidgetValues.map(
                          (widget, idx) =>
                            idx === index
                              ? {
                                  ...widget,
                                  attributes: newValue.toString(),
                                }
                              : widget,
                        );
                        handleTabChange({
                          mapWidgetValues: updatedMapWidgetValues,
                        });
                        setMapWidgetValues(updatedMapWidgetValues);
                      }}
                      iconColor={'fff'}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                </div>
                {/* chart min, max and unit */}
                <div className="flex flex-row justify-between gap-x-2">
                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label="Minimum" />
                    <WizardTextfield
                      value={value?.chartMinimum ?? ''}
                      onChange={(newValue: string | number): void => {
                        const updatedMapWidgetValues = mapWidgetValues.map(
                          (widget, idx) =>
                            idx === index
                              ? {
                                  ...widget,
                                  chartMinimum: newValue as number,
                                }
                              : widget,
                        );
                        handleTabChange({
                          mapWidgetValues: updatedMapWidgetValues,
                        });
                        setMapWidgetValues(updatedMapWidgetValues);
                      }}
                      isNumeric={true}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label="Maximum" />
                    <WizardTextfield
                      value={value?.chartMaximum ?? ''}
                      onChange={(newValue: string | number): void => {
                        const updatedMapWidgetValues = mapWidgetValues.map(
                          (widget, idx) =>
                            idx === index
                              ? {
                                  ...widget,
                                  chartMaximum: newValue as number,
                                }
                              : widget,
                        );
                        handleTabChange({
                          mapWidgetValues: updatedMapWidgetValues,
                        });
                        setMapWidgetValues(updatedMapWidgetValues);
                      }}
                      isNumeric={true}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                  <div className="flex flex-col w-full pb-2">
                    <WizardLabel label="Einheit" />
                    <WizardTextfield
                      value={value?.chartUnit || ''}
                      onChange={(newValue: string | number): void => {
                        const updatedMapWidgetValues = mapWidgetValues.map(
                          (widget, idx) =>
                            idx === index
                              ? {
                                  ...widget,
                                  chartUnit: newValue.toString(),
                                }
                              : widget,
                        );
                        handleTabChange({
                          mapWidgetValues: updatedMapWidgetValues,
                        });
                        setMapWidgetValues(updatedMapWidgetValues);
                      }}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                </div>
                {/* static values for stageable chart */}
                {value.componentSubType ===
                  tabComponentSubTypeEnum.stageableChart && (
                  <div>
                    <div>Statische Werte</div>
                    {value.chartStaticValues?.map(
                      (staticValue, staticValueIndex) => (
                        <div
                          className="flex justify-start items-center content-center gap-4"
                          key={staticValueIndex}
                        >
                          <WizardTextfield
                            value={staticValue}
                            onChange={(newValue: string | number): void => {
                              const updatedMapWidgetValues =
                                mapWidgetValues.map((widget, idx) =>
                                  idx === index
                                    ? {
                                        ...widget,
                                        chartStaticValues: (
                                          widget.chartStaticValues || []
                                        ).map((val, valIdx) =>
                                          valIdx === staticValueIndex
                                            ? (newValue as number)
                                            : val,
                                        ),
                                      }
                                    : widget,
                                );
                              handleTabChange({
                                mapWidgetValues: updatedMapWidgetValues,
                              });
                              setMapWidgetValues(updatedMapWidgetValues);
                            }}
                            isNumeric={true}
                            borderColor={borderColor}
                            backgroundColor={backgroundColor}
                          />
                          <ColorPickerComponent
                            currentColor={
                              value.chartStaticValuesColors?.[
                                staticValueIndex
                              ] || 'FFFFFF'
                            }
                            handleColorChange={(color: string): void => {
                              const updatedMapWidgetValues =
                                mapWidgetValues.map((widget, idx) =>
                                  idx === index
                                    ? {
                                        ...widget,
                                        chartStaticValuesColors: (
                                          widget.chartStaticValuesColors || []
                                        ).map((col, colIdx) =>
                                          colIdx === staticValueIndex
                                            ? color
                                            : col,
                                        ),
                                      }
                                    : widget,
                                );
                              handleTabChange({
                                mapWidgetValues: updatedMapWidgetValues,
                              });
                              setMapWidgetValues(updatedMapWidgetValues);
                            }}
                            label="Farbe"
                          />
                          <CreateDashboardElementButton
                            label="-"
                            handleClick={(): void => {
                              const updatedMapWidgetValues =
                                mapWidgetValues.map((widget, widgetIdx) =>
                                  widgetIdx === index
                                    ? {
                                        ...widget,
                                        chartStaticValues: (
                                          widget.chartStaticValues || []
                                        ).filter(
                                          (_, i) => i !== staticValueIndex,
                                        ),
                                        chartStaticValuesColors: (
                                          widget.chartStaticValuesColors || []
                                        ).filter(
                                          (_, i) => i !== staticValueIndex,
                                        ),
                                      }
                                    : widget,
                                );
                              handleTabChange({
                                mapWidgetValues: updatedMapWidgetValues,
                              });
                              setMapWidgetValues(updatedMapWidgetValues);
                            }}
                          />
                        </div>
                      ),
                    )}
                    <CreateDashboardElementButton
                      label="+ Statischen Wert hinzufügen"
                      handleClick={(): void => {
                        const updatedMapWidgetValues = mapWidgetValues.map(
                          (widget, widgetIdx) =>
                            widgetIdx === index
                              ? {
                                  ...widget,
                                  chartStaticValues: [
                                    ...(widget.chartStaticValues || []),
                                    0,
                                  ],
                                  chartStaticValuesColors: [
                                    ...(widget.chartStaticValuesColors || []),
                                    'FFFFFF',
                                  ],
                                }
                              : widget,
                        );
                        handleTabChange({
                          mapWidgetValues: updatedMapWidgetValues,
                        });
                        setMapWidgetValues(updatedMapWidgetValues);
                      }}
                    />
                  </div>
                )}
              </div>
              <CreateDashboardElementButton
                label="-"
                handleClick={(): void => handleRemoveMapWidgetValue(index)}
              />
            </div>
            {/* divider between each widget static value */}
            {mapWidgetValues.length !== index + 1 && (
              <div className="mx-8">
                <HorizontalDivider />
              </div>
            )}
          </>
        );
      })}

      <CreateDashboardElementButton
        label="+ Widget hinzufügen"
        handleClick={handleAddMapWidgetValue}
      />
    </div>
  );
}
