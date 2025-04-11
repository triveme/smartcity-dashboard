import { ReactElement, useEffect, useState } from 'react';

import { QueryConfig } from '@/types';
import WizardDropdownSelection from '@/ui/WizardDropdownSelection';
import WizardLabel from '@/ui/WizardLabel';
import { WizardErrors } from '@/types/errors';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import RefreshButton from '@/ui/Buttons/RefreshButton';
import { getEventtypes, UsiEventType } from '@/api/wizard-service-usi-platform';
import WizardMultipleDropdownSelection from '@/ui/WizardMultipleDropdownSelection';

type QueryUsiWizardProps = {
  queryConfig: QueryConfig | undefined;
  setQueryConfig: (
    update: (prevQueryConfig: QueryConfig | undefined) => Partial<QueryConfig>,
  ) => void;
  errors?: WizardErrors;
  iconColor: string;
  borderColor: string;
  backgroundColor: string;
  hoverColor: string;
  isSingleWidget: boolean;
};

export default function QueryUsiWizard(
  props: QueryUsiWizardProps,
): ReactElement {
  const {
    queryConfig,
    setQueryConfig,
    errors,
    iconColor,
    borderColor,
    backgroundColor,
    hoverColor,
    isSingleWidget,
  } = props;

  const { openSnackbar } = useSnackbar();

  const [selectedCollection, setSelectedCollection] = useState('');
  const [collections, setCollections] = useState<string[]>([]);

  const [eventTypeData, setEventTypeData] = useState<UsiEventType[]>([]);
  const [selectedEventType, setSelectedEventType] = useState<UsiEventType>();

  const handleQueryConfigChange = (update: Partial<QueryConfig>): void => {
    setQueryConfig((prevQueryConfig) => ({ ...prevQueryConfig, ...update }));
  };

  const [loadingState, setLoadingState] = useState<{ [key: string]: boolean }>({
    collections: false,
    sources: false,
  });
  const toggleLoading = (key: string, isLoading: boolean): void => {
    setLoadingState((prev) => ({ ...prev, [key]: isLoading }));
  };

  const requestCollections = async (): Promise<void> => {
    toggleLoading('collections', true);
    try {
      const usiResponse = await getEventtypes(queryConfig?.dataSourceId);
      setEventTypeData(usiResponse);
      setCollections(['', ...usiResponse.map((e) => e.name)]);

      if (queryConfig?.fiwareService) {
        const selectedEventType = usiResponse.find(
          (eventType) => eventType.name === queryConfig.fiwareService,
        );
        if (selectedEventType) {
          setSelectedEventType(selectedEventType);
          setSelectedCollection(queryConfig.fiwareService);
        }
      }
    } catch (error) {
      console.error(error);
      openSnackbar('Fehler beim Abfragen von Eventtypes. Keine Daten', 'error');
    } finally {
      toggleLoading('collections', false);
    }
  };

  useEffect(() => {
    requestCollections();
  }, []);

  return (
    <div>
      <div className="flex flex-col w-full pb-2">
        <WizardLabel label="Eventtypes" />
        <div className="flex flex-row items-center">
          <div className="flex-1">
            <WizardDropdownSelection
              currentValue={selectedCollection || ''}
              selectableValues={collections || []}
              onSelect={(value: string | number): void => {
                handleQueryConfigChange({
                  fiwareService: value.toString(),
                  fiwareType: '',
                  entityIds: [],
                  attributes: [],
                });
                setSelectedCollection(value.toString());
                setSelectedEventType(
                  eventTypeData.find((eventType) => eventType.name === value),
                );
              }}
              error={errors && errors.fiwareServiceError}
              iconColor={iconColor}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
          </div>
          <RefreshButton
            handleClick={requestCollections}
            className={loadingState.collections ? 'animate-spin' : ''}
            fontColor={iconColor}
            hoverColor={hoverColor}
            backgroundColor={backgroundColor}
          />
        </div>
      </div>
      {isSingleWidget ? (
        <div className="flex flex-col w-full pb-2">
          <WizardLabel label={'Sensor'} />
          <div className="flex flex-row items-center">
            <div className="flex-1">
              <WizardDropdownSelection
                currentValue={queryConfig?.entityIds[0] || ''}
                selectableValues={['', ...(selectedEventType?.sensors || [])]}
                error={errors && errors.sensorError}
                onSelect={(value: string | number): void => {
                  handleQueryConfigChange({
                    entityIds: [value.toString()],
                  });
                }}
                iconColor={iconColor}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col w-full pb-2">
          <WizardLabel label={'Sensoren'} />
          <div className="flex flex-row items-center">
            <div className="flex-1">
              <WizardMultipleDropdownSelection
                currentValue={queryConfig?.entityIds || []}
                selectableValues={['', ...(selectedEventType?.sensors || [])]}
                error={errors && errors.sensorError}
                onSelect={(value: string[]): void => {
                  handleQueryConfigChange({ entityIds: value });
                }}
                iconColor={iconColor}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />
            </div>
          </div>
        </div>
      )}
      {isSingleWidget ? (
        <div className="flex flex-col w-full pb-2">
          <WizardLabel label={'Attribut'} />
          <div className="flex flex-row items-center">
            <div className="flex-1">
              <WizardDropdownSelection
                currentValue={queryConfig?.attributes[0] || ''}
                selectableValues={[
                  '',
                  ...(selectedEventType?.attributes || []),
                ]}
                error={errors && errors.attributeError}
                onSelect={(value: string | number): void =>
                  handleQueryConfigChange({
                    attributes: [value.toString()],
                  })
                }
                iconColor={iconColor}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
              />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col w-full pb-2">
            <WizardLabel label="Attribute" />
            <div className="flex flex-row items-center">
              <div className="flex-1">
                <WizardMultipleDropdownSelection
                  currentValue={queryConfig?.attributes || []}
                  error={errors && errors.attributeError}
                  selectableValues={[
                    '',
                    ...(selectedEventType?.attributes || []),
                  ]}
                  onSelect={(value: string[]): void => {
                    handleQueryConfigChange({ attributes: value });
                  }}
                  iconColor={iconColor}
                  borderColor={borderColor}
                  backgroundColor={backgroundColor}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
