import { useState, ReactElement, CSSProperties, useEffect } from 'react';
import WizardTextfield from './WizardTextfield';
import {
  MapModalWidget,
  Tab,
  tabComponentTypeEnum,
  tabComponentSubTypeEnum,
  QueryConfig,
  widgetImageSourceEnum,
} from '@/types';
import CreateDashboardElementButton from './Buttons/CreateDashboardElementButton';
import ColorPickerComponent from './ColorPickerComponent';
import WizardDropdownSelection from './WizardDropdownSelection';
import {
  chartComponentSubTypes,
  chartDateRepresentation,
  informationComponentSubTypes,
  widgetImageSources,
} from '@/utils/enumMapper';
import WizardLabel from './WizardLabel';
import HorizontalDivider from './HorizontalDivider';
import { WizardErrors } from '@/types/errors';
import { EMPTY_MAP_MODAL_WIDGET } from '@/utils/objectHelper';
import { getAttributes } from '@/api/wizard-service-fiware';
import RefreshButton from './Buttons/RefreshButton';
import WizardUrlTextfield from './WizardUrlTextfield';
import IconSelection from './Icons/IconSelection';
import WizardSelectBox from '@/ui/WizardSelectBox';
import WizardIntegerfield from './WizardIntegerfield';
import IconButton from './Buttons/IconButton';

type StaticValuesFieldProps = {
  errors?: WizardErrors;
  handleTabChange: (update: Partial<Tab>) => void;
  backgroundColor: string;
  borderColor: string;
  initialMapModalWidgetsValues?: MapModalWidget[];
  queryConfig: QueryConfig;
  accessToken: string;
  iconColor: string;
  hoverColor: string;
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
    queryConfig,
    accessToken,
    iconColor,
    hoverColor,
  } = props;

  const defaultMapModalWidget: MapModalWidget = EMPTY_MAP_MODAL_WIDGET;
  const [mapWidgetValues, setMapWidgetValues] = useState<MapModalWidget[]>(
    initialMapModalWidgetsValues || [defaultMapModalWidget],
  );

  const [loadingState, setLoadingState] = useState<{ [key: string]: boolean }>({
    collections: false,
    sources: false,
  });
  const toggleLoading = (key: string, isLoading: boolean): void => {
    setLoadingState((prev) => ({ ...prev, [key]: isLoading }));
  };

  // Get all Attributes
  const [availableAttributes, setAvailableAttributes] = useState<string[]>([]);
  const requestAttributes = async (): Promise<void> => {
    toggleLoading('attributes', true);
    try {
      //TODO implement a callback instead of calling the API directly
      const req = await getAttributes(
        queryConfig?.fiwareType,
        accessToken,
        queryConfig?.fiwareService,
        queryConfig?.dataSourceId,
        'v2',
      );
      if (req && req.length > 0) {
        setAvailableAttributes(req);
      }
    } catch (error) {
      console.error(error);
    } finally {
      toggleLoading('attributes', false);
    }
  };

  const changeWidgetOrder = (widget: MapModalWidget, isUp: boolean): void => {
    const widgetPos = mapWidgetValues.findIndex(
      (element) => element === widget,
    );
    const arr: MapModalWidget[] = [...mapWidgetValues];
    if (isUp) {
      const temp: MapModalWidget = arr[widgetPos - 1];
      arr[widgetPos - 1] = widget;
      arr[widgetPos] = temp;
    } else {
      const temp: MapModalWidget = arr[widgetPos + 1];
      arr[widgetPos + 1] = widget;
      arr[widgetPos] = temp;
    }
    handleTabChange({ mapWidgetValues: arr });
    setMapWidgetValues(arr);
  };

  useEffect((): void => {
    if (queryConfig && accessToken) {
      requestAttributes();
    }
  }, [queryConfig, accessToken]);

  const getAllowableComponentTypes = (): string[] => {
    return [
      ...Object.values(tabComponentTypeEnum).filter(
        (type) =>
          type === tabComponentTypeEnum.default ||
          type === tabComponentTypeEnum.information ||
          type === tabComponentTypeEnum.value ||
          type === tabComponentTypeEnum.diagram ||
          type === tabComponentTypeEnum.image,
      ),
      'Button', // Add manually here because dont want to create as an enum
    ];
  };

  const getAllowableComponentSubTypes = (
    componentType: string,
  ): {
    label: string;
    value: string;
  }[] => {
    if (componentType === tabComponentTypeEnum.information) {
      return informationComponentSubTypes;
    } else if (componentType === tabComponentTypeEnum.value) {
      return [{ label: '', value: '' }];
    } else if (componentType === tabComponentTypeEnum.diagram) {
      return chartComponentSubTypes.filter(
        (subType) =>
          subType.value === '' ||
          subType.value === tabComponentSubTypeEnum.degreeChart180 ||
          subType.value === tabComponentSubTypeEnum.stageableChart ||
          subType.value === tabComponentSubTypeEnum.lineChart ||
          subType.value === tabComponentSubTypeEnum.barChart,
      );
    } else if (componentType === tabComponentTypeEnum.image) {
      return widgetImageSources;
    } else if (componentType === 'Button') {
      return [
        { label: '', value: '' },
        { label: 'Jumpoff URL', value: 'jumpoff-url' },
        { label: 'Jumpoff Sensor Attribute', value: 'jumpoff-attribute' },
      ];
    } else {
      return [{ label: '', value: '' }];
    }
  };

  const componentTypes = getAllowableComponentTypes();

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
            <div
              className={'flex flex-row justify-between items-end'}
              key={index}
            >
              <div
                className="flex flex-col w-full mr-8"
                style={mapWidgetHasError ? errorStyle : {}}
              >
                {/* component, subcomponent and attributes */}
                <div className="flex flex-row justify-start items-end gap-x-2">
                  <div className="flex flex-col w-1/4 pb-2">
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
                      iconColor={'#fff'}
                      borderColor={borderColor}
                      backgroundColor={backgroundColor}
                    />
                  </div>
                  {(value.componentType === tabComponentTypeEnum.information ||
                    value.componentType === tabComponentTypeEnum.diagram ||
                    value.componentType === tabComponentTypeEnum.image ||
                    value.componentType === 'Button') && (
                    <div className="flex flex-col w-1/4 pb-2">
                      <WizardLabel label="Typ" />
                      <WizardDropdownSelection
                        currentValue={
                          (
                            getAllowableComponentSubTypes(
                              value.componentType,
                            ) || []
                          ).find(
                            (option) =>
                              option.value === value?.componentSubType,
                          )?.label || ''
                        }
                        selectableValues={(
                          getAllowableComponentSubTypes(value.componentType) ||
                          []
                        ).map((option) => option.label)}
                        onSelect={(label: string | number): void => {
                          const enumValue =
                            (
                              getAllowableComponentSubTypes(
                                value.componentType,
                              ) || []
                            ).find((option) => option.label === label)?.value ||
                            '';
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
                        iconColor={'#fff'}
                        borderColor={borderColor}
                        backgroundColor={backgroundColor}
                      />
                    </div>
                  )}
                  {(value.componentType === tabComponentTypeEnum.value ||
                    value.componentType === tabComponentTypeEnum.diagram ||
                    (value.componentType === tabComponentTypeEnum.image &&
                      value.componentSubType ===
                        widgetImageSourceEnum.sensor)) && (
                    <div className="flex flex-col w-2/4 pb-2">
                      <WizardLabel label="Attribute (nach Query Konfiguration möglich)" />
                      <div className="flex flex-row items-end">
                        <div className="flex-1">
                          <WizardDropdownSelection
                            currentValue={value?.attributes || ''}
                            selectableValues={availableAttributes}
                            onSelect={(newValue): void => {
                              const updatedMapWidgetValues =
                                mapWidgetValues.map((widget, idx) =>
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
                            iconColor={'#fff'}
                            borderColor={borderColor}
                            backgroundColor={backgroundColor}
                          />
                        </div>
                        <RefreshButton
                          handleClick={requestAttributes}
                          className={
                            loadingState.attributes ? 'animate-spin' : ''
                          }
                          fontColor={iconColor}
                          hoverColor={hoverColor}
                          backgroundColor={backgroundColor}
                        />
                      </div>
                    </div>
                  )}
                  {value.componentType === tabComponentTypeEnum.image &&
                    value.componentSubType === widgetImageSourceEnum.url && (
                      <div className="flex flex-col w-2/4 pb-2">
                        <WizardLabel label="Bild URL" />
                        <WizardUrlTextfield
                          value={value?.imageUrl ?? ''}
                          onChange={(newValue: string | number): void => {
                            const updatedMapWidgetValues = mapWidgetValues.map(
                              (widget, idx) =>
                                idx === index
                                  ? {
                                      ...widget,
                                      imageUrl: newValue as string,
                                    }
                                  : widget,
                            );
                            handleTabChange({
                              mapWidgetValues: updatedMapWidgetValues,
                            });
                            setMapWidgetValues(updatedMapWidgetValues);
                          }}
                          iconColor={iconColor}
                          borderColor={borderColor}
                        />
                      </div>
                    )}
                </div>
                {/* value */}
                {value.componentType == tabComponentTypeEnum.value && (
                  <>
                    <div className="flex flex-row justify-between gap-x-2 pb-4">
                      <div className="flex flex-col w-full pb-2">
                        <WizardLabel label="Titel" />
                        <WizardTextfield
                          value={value?.title || ''}
                          onChange={(newValue: string | number): void => {
                            const updatedMapWidgetValues = mapWidgetValues.map(
                              (widget, idx) =>
                                idx === index
                                  ? {
                                      ...widget,
                                      title: newValue.toString(),
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
                      <div className="flex flex-col pb-2">
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
                      <div className="flex flex-col w-full pb-2">
                        <WizardLabel label="Dezimalstellen" />
                        <WizardIntegerfield
                          value={value?.decimalPlaces || ''}
                          onChange={(newValue: string | number): void => {
                            const updatedMapWidgetValues = mapWidgetValues.map(
                              (widget, idx) =>
                                idx === index
                                  ? {
                                      ...widget,
                                      decimalPlaces: newValue as number,
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
                    <div className="gap-x-2 pb-4">
                      <div className="pb-4">Statische Werte</div>
                      {value.chartStaticValues?.map(
                        (staticValue, staticValueIndex) => (
                          <div
                            className="flex justify-start items-center content-center gap-4"
                            key={staticValueIndex}
                          >
                            <div className="w-1/4">
                              {staticValueIndex === 0 && (
                                <WizardLabel label="Wert" />
                              )}
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
                            </div>

                            <div className="w-1/4">
                              {staticValueIndex === 0 && (
                                <WizardLabel label="Icon" />
                              )}
                              <IconSelection
                                activeIcon={
                                  value.chartStaticValuesLogos?.[
                                    staticValueIndex
                                  ] || ''
                                }
                                handleIconSelect={(
                                  newValue: string | number,
                                ): void => {
                                  const updatedMapWidgetValues =
                                    mapWidgetValues.map((widget, idx) =>
                                      idx === index
                                        ? {
                                            ...widget,
                                            chartStaticValuesLogos: (
                                              widget.chartStaticValuesLogos ||
                                              []
                                            ).map((val, valIdx) =>
                                              valIdx === staticValueIndex
                                                ? (newValue as string)
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
                                iconColor={'#ffffff'}
                                borderColor={borderColor}
                              />
                            </div>

                            <div
                              className={`w-1/4 ${staticValueIndex === 0 && 'pt-4'}`}
                            >
                              <ColorPickerComponent
                                currentColor={
                                  value.chartStaticValuesColors?.[
                                    staticValueIndex
                                  ] || '#FFFFFF'
                                }
                                handleColorChange={(color: string): void => {
                                  const updatedMapWidgetValues =
                                    mapWidgetValues.map((widget, idx) =>
                                      idx === index
                                        ? {
                                            ...widget,
                                            chartStaticValuesColors: (
                                              widget.chartStaticValuesColors ||
                                              []
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
                                label="Icon Farbe"
                              />
                            </div>

                            <div className="w-1/4">
                              {staticValueIndex === 0 && (
                                <WizardLabel label="Label" />
                              )}
                              <WizardTextfield
                                value={
                                  value.chartStaticValuesTexts?.[
                                    staticValueIndex
                                  ] || ''
                                }
                                onChange={(newValue: string | number): void => {
                                  const updatedMapWidgetValues =
                                    mapWidgetValues.map((widget, idx) =>
                                      idx === index
                                        ? {
                                            ...widget,
                                            chartStaticValuesTexts: (
                                              widget.chartStaticValuesTexts ||
                                              []
                                            ).map((val, valIdx) =>
                                              valIdx === staticValueIndex
                                                ? (newValue as string)
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
                                isNumeric={false}
                                borderColor={borderColor}
                                backgroundColor={backgroundColor}
                              />
                            </div>

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
                                      '#FFFFFF',
                                    ],
                                    chartStaticValuesLogos: [
                                      ...(widget.chartStaticValuesLogos || []),
                                      '',
                                    ],
                                    chartStaticValuesTexts: [
                                      ...(widget.chartStaticValuesTexts || []),
                                      '',
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
                  </>
                )}
                {/* information */}
                {value.componentType === tabComponentTypeEnum.information &&
                  value.componentSubType === tabComponentSubTypeEnum.text && (
                    <div className="flex flex-col justify-between gap-x-2">
                      <WizardLabel label="Text" />
                      <WizardTextfield
                        value={value?.textValue || ''}
                        onChange={(textValue: string | number): void => {
                          const updatedMapWidgetValues = mapWidgetValues.map(
                            (widget, idx) =>
                              idx === index
                                ? {
                                    ...widget,
                                    textValue: textValue.toString(),
                                  }
                                : widget,
                          );
                          handleTabChange({
                            mapWidgetValues: updatedMapWidgetValues,
                          });
                          setMapWidgetValues(updatedMapWidgetValues);
                        }}
                        componentType={tabComponentTypeEnum.information}
                        subComponentType={tabComponentSubTypeEnum.text}
                        borderColor={borderColor}
                        backgroundColor={backgroundColor}
                      />
                    </div>
                  )}
                {value.componentType === tabComponentTypeEnum.information &&
                  value.componentSubType ===
                    tabComponentSubTypeEnum.iconWithLink && (
                    <div className="flex flex-col justify-between gap-x-2">
                      <div className="flex flex-row w-full pb-2">
                        <div className="flex flex-col w-full">
                          <WizardLabel label="Icon auswählen" />
                          <IconSelection
                            activeIcon={value?.icon || ''}
                            handleIconSelect={(iconName: string): void => {
                              const updatedMapWidgetValues =
                                mapWidgetValues.map((widget, idx) =>
                                  idx === index
                                    ? { ...widget, icon: iconName }
                                    : widget,
                                );
                              handleTabChange({
                                mapWidgetValues: updatedMapWidgetValues,
                              });
                              setMapWidgetValues(updatedMapWidgetValues);
                            }}
                            iconColor={iconColor}
                            borderColor={borderColor}
                          />
                        </div>
                        <div className="flex items-end ml-4 mb-2">
                          <ColorPickerComponent
                            currentColor={value?.iconColor || '#fff'}
                            handleColorChange={(color: string): void => {
                              const updatedMapWidgetValues =
                                mapWidgetValues.map((widget, idx) =>
                                  idx === index
                                    ? { ...widget, iconColor: color }
                                    : widget,
                                );
                              handleTabChange({
                                mapWidgetValues: updatedMapWidgetValues,
                              });
                              setMapWidgetValues(updatedMapWidgetValues);
                            }}
                            label="Icon Farbe"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col w-full pb-2">
                        <WizardLabel label="Url" />
                        <WizardUrlTextfield
                          value={value?.iconUrl || 'https://'}
                          onChange={(urlValue: string | number): void => {
                            const updatedMapWidgetValues = mapWidgetValues.map(
                              (widget, idx) =>
                                idx === index
                                  ? { ...widget, iconUrl: urlValue.toString() }
                                  : widget,
                            );
                            handleTabChange({
                              mapWidgetValues: updatedMapWidgetValues,
                            });
                            setMapWidgetValues(updatedMapWidgetValues);
                          }}
                          error={errors && errors.urlError}
                          iconColor={iconColor}
                          borderColor={borderColor}
                        />
                      </div>
                      <div className="flex flex-col justify-between gap-x-2">
                        <WizardLabel label="Text" />
                        <WizardTextfield
                          value={value?.iconText || ''}
                          onChange={(textValue: string | number): void => {
                            const updatedMapWidgetValues = mapWidgetValues.map(
                              (widget, idx) =>
                                idx === index
                                  ? {
                                      ...widget,
                                      iconText: textValue.toString(),
                                    }
                                  : widget,
                            );
                            handleTabChange({
                              mapWidgetValues: updatedMapWidgetValues,
                            });
                            setMapWidgetValues(updatedMapWidgetValues);
                          }}
                          componentType={tabComponentTypeEnum.information}
                          subComponentType={tabComponentSubTypeEnum.text}
                          borderColor={borderColor}
                          backgroundColor={backgroundColor}
                        />
                      </div>
                    </div>
                  )}
                {/* jumpoff button with static url*/}
                {value.componentType === 'Button' &&
                  value.componentSubType === 'jumpoff-url' && (
                    <>
                      <div className="flex flex-row w-full gap-x-4 pb-2">
                        <div className="flex flex-col w-1/2">
                          <WizardLabel label="Icon" />
                          <IconSelection
                            activeIcon={value?.jumpoffIcon || ''}
                            handleIconSelect={(iconName: string): void => {
                              const updatedMapWidgetValues =
                                mapWidgetValues.map((widget, idx) =>
                                  idx === index
                                    ? { ...widget, jumpoffIcon: iconName }
                                    : widget,
                                );
                              handleTabChange({
                                mapWidgetValues: updatedMapWidgetValues,
                              });
                              setMapWidgetValues(updatedMapWidgetValues);
                            }}
                            iconColor={iconColor}
                            borderColor={borderColor}
                          />
                        </div>
                        <div className="flex flex-col w-1/2">
                          <WizardLabel label="Beschriftung" />
                          <WizardTextfield
                            value={value?.jumpoffLabel || ''}
                            onChange={(textValue: string | number): void => {
                              const updatedMapWidgetValues =
                                mapWidgetValues.map((widget, idx) =>
                                  idx === index
                                    ? {
                                        ...widget,
                                        jumpoffLabel: textValue.toString(),
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
                      <div className="flex flex-col w-full pb-2">
                        <WizardLabel label="Jumpoff-URL" />
                        <WizardUrlTextfield
                          value={value?.jumpoffUrl || 'https://'}
                          onChange={(urlValue: string | number): void => {
                            const updatedMapWidgetValues = mapWidgetValues.map(
                              (widget, idx) =>
                                idx === index
                                  ? {
                                      ...widget,
                                      jumpoffUrl: urlValue.toString(),
                                    }
                                  : widget,
                            );
                            handleTabChange({
                              mapWidgetValues: updatedMapWidgetValues,
                            });
                            setMapWidgetValues(updatedMapWidgetValues);
                          }}
                          iconColor={iconColor}
                          borderColor={borderColor}
                        />
                      </div>
                      <div className="flex flex-col w-full pb-2">
                        <WizardSelectBox
                          label="Link in neuem Tab öffnen"
                          checked={value?.openJumpoffLinkInNewTab ?? true}
                          onChange={(linkValue: boolean): void => {
                            const updatedMapWidgetValues = mapWidgetValues.map(
                              (widget, idx) =>
                                idx === index
                                  ? {
                                      ...widget,
                                      openJumpoffLinkInNewTab: linkValue,
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
                    </>
                  )}
                {/* jumpoff button with sensor attribute*/}
                {value.componentType === 'Button' &&
                  value.componentSubType === 'jumpoff-attribute' && (
                    <>
                      <div className="flex flex-row w-full gap-x-4 pb-2">
                        <div className="flex flex-col w-1/2">
                          <WizardLabel label="Icon" />
                          <IconSelection
                            activeIcon={value?.jumpoffIcon || ''}
                            handleIconSelect={(iconName: string): void => {
                              const updatedMapWidgetValues =
                                mapWidgetValues.map((widget, idx) =>
                                  idx === index
                                    ? { ...widget, jumpoffIcon: iconName }
                                    : widget,
                                );
                              handleTabChange({
                                mapWidgetValues: updatedMapWidgetValues,
                              });
                              setMapWidgetValues(updatedMapWidgetValues);
                            }}
                            iconColor={iconColor}
                            borderColor={borderColor}
                          />
                        </div>
                        <div className="flex flex-col w-1/2">
                          <WizardLabel label="Beschriftung" />
                          <WizardTextfield
                            value={value?.jumpoffLabel || ''}
                            onChange={(textValue: string | number): void => {
                              const updatedMapWidgetValues =
                                mapWidgetValues.map((widget, idx) =>
                                  idx === index
                                    ? {
                                        ...widget,
                                        jumpoffLabel: textValue.toString(),
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
                      <div className="flex flex-col w-full pb-2">
                        <div className="flex flex-col w-2/4 pb-2">
                          <WizardLabel label="Attribut (nach Query Konfiguration möglich)" />
                          <div className="flex flex-row items-end">
                            <div className="flex-1">
                              <WizardDropdownSelection
                                currentValue={value?.jumpoffAttribute || ''}
                                selectableValues={availableAttributes}
                                onSelect={(textValue): void => {
                                  const updatedMapWidgetValues =
                                    mapWidgetValues.map((widget, idx) =>
                                      idx === index
                                        ? {
                                            ...widget,
                                            jumpoffAttribute:
                                              textValue.toString(),
                                          }
                                        : widget,
                                    );
                                  handleTabChange({
                                    mapWidgetValues: updatedMapWidgetValues,
                                  });
                                  setMapWidgetValues(updatedMapWidgetValues);
                                }}
                                iconColor={'#fff'}
                                borderColor={borderColor}
                                backgroundColor={backgroundColor}
                              />
                            </div>
                            <RefreshButton
                              handleClick={requestAttributes}
                              className={
                                loadingState.attributes ? 'animate-spin' : ''
                              }
                              fontColor={iconColor}
                              hoverColor={hoverColor}
                              backgroundColor={backgroundColor}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col w-full pb-2">
                        <WizardSelectBox
                          label="Link in neuem Tab öffnen"
                          checked={value?.openJumpoffLinkInNewTab ?? true}
                          onChange={(linkValue: boolean): void => {
                            const updatedMapWidgetValues = mapWidgetValues.map(
                              (widget, idx) =>
                                idx === index
                                  ? {
                                      ...widget,
                                      openJumpoffLinkInNewTab: linkValue,
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
                    </>
                  )}
                {/* chart min, max and unit */}
                {value.componentType === tabComponentTypeEnum.diagram && (
                  <div className="flex flex-row justify-between gap-x-2 pb-4">
                    <div className="flex flex-col w-full pb-2">
                      <WizardLabel label="Titel" />
                      <WizardTextfield
                        value={value?.title || ''}
                        onChange={(newValue: string | number): void => {
                          const updatedMapWidgetValues = mapWidgetValues.map(
                            (widget, idx) =>
                              idx === index
                                ? {
                                    ...widget,
                                    title: newValue.toString(),
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
                    <div className="flex flex-col pb-2">
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
                    <div className="flex flex-col pb-2">
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
                    <div className="flex flex-col pb-2">
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
                )}
                {/* static values for stageable chart */}
                {value.componentSubType ===
                  tabComponentSubTypeEnum.stageableChart && (
                  <div className="gap-x-2 pb-4">
                    <div className="w-full pb-4">
                      <WizardSelectBox
                        checked={value?.showAxisLabels !== false}
                        onChange={(newValue: boolean): void => {
                          const updatedMapWidgetValues = mapWidgetValues.map(
                            (widget, idx) =>
                              idx === index
                                ? {
                                    ...widget,
                                    showAxisLabels: newValue as boolean,
                                  }
                                : widget,
                          );
                          handleTabChange({
                            mapWidgetValues: updatedMapWidgetValues,
                          });
                          setMapWidgetValues(updatedMapWidgetValues);
                        }}
                        label="Achsenbeschriftungen anzeigen"
                      />
                    </div>
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

                {(value.componentSubType ===
                  tabComponentSubTypeEnum.lineChart ||
                  value.componentSubType ===
                    tabComponentSubTypeEnum.barChart) && (
                  <div>
                    <div className="flex flex-col w-full pb-2">
                      <WizardLabel label="Name der X-Achse" />
                      <WizardTextfield
                        value={value.chartXAxisLabel || ''}
                        onChange={(value: string | number): void => {
                          const updatedMapWidgetValues = mapWidgetValues.map(
                            (widget, idx) =>
                              idx === index
                                ? {
                                    ...widget,
                                    chartXAxisLabel: value.toString(),
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
                    <div className="flex flex-col w-full pb-2">
                      <WizardLabel label="Name der Y-Achse" />
                      <WizardTextfield
                        value={value.chartYAxisLabel || ''}
                        onChange={(value: string | number): void => {
                          const updatedMapWidgetValues = mapWidgetValues.map(
                            (widget, idx) =>
                              idx === index
                                ? {
                                    ...widget,
                                    chartYAxisLabel: value.toString(),
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
                    <div className="flex flex-col w-full pb-2">
                      <div>
                        <WizardLabel label="Anzahl Dezimalstellen" />
                        <WizardIntegerfield
                          value={value.decimalPlaces || '0'}
                          onChange={(value: string | number): void => {
                            const updatedMapWidgetValues = mapWidgetValues.map(
                              (widget, idx) =>
                                idx === index
                                  ? {
                                      ...widget,
                                      decimalPlaces: Number(value),
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
                    <div className="flex w-full items-center">
                      <div className="flex flex-col w-full pb-2">
                        <WizardLabel label="Format Datumsanzeige xAchse" />
                        <WizardDropdownSelection
                          currentValue={
                            chartDateRepresentation.find(
                              (option) =>
                                option.value === value.chartDateRepresentation,
                            )?.label || ''
                          }
                          selectableValues={chartDateRepresentation.map(
                            (option) => option.label,
                          )}
                          onSelect={(label: string | number): void => {
                            const enumValue = chartDateRepresentation.find(
                              (option) => option.label === label,
                            )?.value;
                            handleTabChange({
                              chartDateRepresentation: enumValue,
                            });
                          }}
                          iconColor={iconColor}
                          borderColor={borderColor}
                          backgroundColor={backgroundColor}
                          error={errors?.chartDateRepresentationError}
                        />
                      </div>
                    </div>
                    <div className="w-full flex flex-col">
                      {value.componentSubType ===
                        tabComponentSubTypeEnum.lineChart && (
                        <>
                          <div className="flex w-full items-center">
                            <div className="min-w-[220px]">
                              <WizardLabel label="Stufenlinie anzeigen?" />
                            </div>
                            <WizardSelectBox
                              checked={value.isStepline || false}
                              onChange={(value: boolean): void =>
                                handleTabChange({ isStepline: value })
                              }
                              label=" Stufenlinie"
                            />
                          </div>
                          <div className="flex w-full items-center">
                            <div className="min-w-[220px]">
                              <WizardLabel label="Automatischer Zoom der Achseneinteilung" />
                            </div>
                            <WizardSelectBox
                              checked={value.chartHasAutomaticZoom || false}
                              onChange={(value: boolean): void =>
                                handleTabChange({
                                  chartHasAutomaticZoom: value,
                                })
                              }
                              label="Automatischer Zoom"
                            />
                          </div>
                        </>
                      )}
                      {value.componentSubType ===
                        tabComponentSubTypeEnum.barChart && (
                        <div className="flex w-full items-center">
                          <div className="min-w-[220px]">
                            <WizardLabel label="Gestapelte Balken?" />
                          </div>
                          <WizardSelectBox
                            checked={value.isStepline || false}
                            onChange={(value: boolean): void =>
                              handleTabChange({ isStepline: value })
                            }
                            label=" Stapel"
                          />
                        </div>
                      )}
                      <div className="flex w-full items-center">
                        <div className="min-w-[220px]">
                          <WizardLabel label="Y-Achsen Interval setzen?" />
                        </div>
                        <WizardSelectBox
                          checked={value.setYAxisInterval || false}
                          onChange={(value: boolean): void => {
                            if (value) {
                              handleTabChange({
                                setYAxisInterval: value,
                                chartYAxisScale: 0,
                                chartYAxisScaleChartMinValue: 0,
                                chartYAxisScaleChartMaxValue: 100,
                              });
                            } else {
                              handleTabChange({
                                setYAxisInterval: false,
                                chartYAxisScale: undefined,
                                chartYAxisScaleChartMinValue: undefined,
                                chartYAxisScaleChartMaxValue: undefined,
                              });
                            }
                          }}
                          label=" Interval"
                        />
                      </div>
                      <div className="flex flex-col w-full pb-2">
                        {value.setYAxisInterval && (
                          <>
                            <div className="flex-grow">
                              <WizardLabel label="Skalierung y-Achse (Werte von 0.1 bis 1000 möglich, 0 für Automatische Skallierung)." />
                              <WizardTextfield
                                isNumeric={true}
                                value={value.chartYAxisScale || 0}
                                onChange={(value: string | number): void =>
                                  handleTabChange({
                                    chartYAxisScale: value as number,
                                  })
                                }
                                borderColor={borderColor}
                                backgroundColor={backgroundColor}
                              />
                            </div>
                            <div className="flex-grow">
                              <WizardLabel label="Minimalwert Skala der yAchse" />
                              <WizardTextfield
                                isNumeric={true}
                                value={value.chartYAxisScaleChartMinValue || 0}
                                onChange={(value: string | number): void =>
                                  handleTabChange({
                                    chartYAxisScaleChartMinValue:
                                      value as number,
                                  })
                                }
                                borderColor={borderColor}
                                backgroundColor={backgroundColor}
                              />
                            </div>
                            <div className="flex-grow">
                              <WizardLabel label="Maximalwert Skala der yAchse" />
                              <WizardTextfield
                                isNumeric={true}
                                value={
                                  value.chartYAxisScaleChartMaxValue || 100
                                }
                                onChange={(value: string | number): void =>
                                  handleTabChange({
                                    chartYAxisScaleChartMaxValue:
                                      value as number,
                                  })
                                }
                                borderColor={borderColor}
                                backgroundColor={backgroundColor}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex gap-2 items-center pb-4">
                {index !== 0 && (
                  <IconButton
                    iconName="ChevronUp"
                    handleClick={(): void =>
                      changeWidgetOrder(mapWidgetValues[index], true)
                    }
                  />
                )}
                {index !== mapWidgetValues.length - 1 && (
                  <IconButton
                    iconName="ChevronDown"
                    handleClick={(): void =>
                      changeWidgetOrder(mapWidgetValues[index], false)
                    }
                  />
                )}
                <CreateDashboardElementButton
                  label="-"
                  handleClick={(): void => handleRemoveMapWidgetValue(index)}
                />
              </div>
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
