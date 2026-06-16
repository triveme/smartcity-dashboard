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
  usesQueryParameter: boolean;
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    usesQueryParameter,
  } = props;

  const { openSnackbar } = useSnackbar();

  const [selectedCollection, setSelectedCollection] = useState('');
  const [collections, setCollections] = useState<string[]>([]);
  const [sources, setSources] = useState<UsiEventType[]>([]);

  const [sensors, setSensors] = useState<string[]>([]);
  const [attributes, setAttributes] = useState<string[]>([]);

  const handleQueryConfigChange = (update: Partial<QueryConfig>): void => {
    setQueryConfig((prevQueryConfig) => {
      const base = prevQueryConfig || ({} as QueryConfig);
      return {
        ...base,
        ...update,
      };
    });
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
      setSources(usiResponse);

      const names = usiResponse.map((e) => e.name);
      setCollections(names.length > 0 ? ['', ...names] : []);

      const targetTypeName = queryConfig?.fiwareType || names[0];
      if (targetTypeName) {
        const matchedSource = usiResponse.find(
          (source) => source.name === targetTypeName,
        );
        if (matchedSource) {
          setSelectedCollection(targetTypeName);
          setSensors([...(matchedSource.sensors || [])]);
          setAttributes([...(matchedSource.attributes || [])]);

          if (!queryConfig?.entityIds || queryConfig.entityIds.length === 0) {
            handleQueryConfigChange({
              fiwareService: 'usi',
              fiwareType: targetTypeName,
              // Fallback to the first available sensor if it's a single widget, or take all/none depending on your needs
              entityIds:
                isSingleWidget && !usesQueryParameter
                  ? [matchedSource.sensors?.[0] || '']
                  : matchedSource.sensors || [],
              attributes: queryConfig?.attributes || [],
            });
          }
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
    if (queryConfig?.dataSourceId) {
      requestCollections();
    }
  }, [queryConfig?.dataSourceId]);

  const handleCollectionSelect = async (value: string): Promise<void> => {
    setSelectedCollection(value);

    const matchedSource = sources.find((source) => source.name === value);
    if (matchedSource) {
      setSensors([...(matchedSource.sensors || [])]);
      setAttributes([...(matchedSource.attributes || [])]);
      handleQueryConfigChange({
        fiwareService: 'usi',
        fiwareType: value,
        entityIds: [...(matchedSource.sensors || [])],
        attributes: [...(matchedSource.attributes || [])],
      });
    } else {
      setSensors([]);
      setAttributes([]);
      handleQueryConfigChange({
        fiwareService: 'usi',
        fiwareType: value,
        entityIds: [],
        attributes: [],
      });
    }
  };

  return (
    <div>
      {/* Eventtypes Dropdown */}
      <div className="flex flex-col w-full pb-2">
        <WizardLabel label="Eventtypes" />
        <div className="flex flex-row items-center">
          <div className="flex-1">
            <WizardDropdownSelection
              currentValue={queryConfig?.fiwareType || ''}
              selectableValues={collections || []}
              onSelect={async (value: string | number): Promise<void> => {
                await handleCollectionSelect(value.toString());
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

      {/* Sensor Dropdown Selection */}
      {isSingleWidget && usesQueryParameter === false ? (
        <div className="flex flex-col w-full pb-2">
          <WizardLabel label={'Sensor'} />
          <div className="flex flex-row items-center">
            <div className="flex-1">
              <WizardDropdownSelection
                currentValue={queryConfig?.entityIds?.[0] || ''}
                selectableValues={[...sensors]}
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
                selectableValues={[...sensors]}
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

      {/* Attribute Dropdown Selection */}
      {isSingleWidget ? (
        <div className="flex flex-col w-full pb-2">
          <WizardLabel label={'Attribut'} />
          <div className="flex flex-row items-center">
            <div className="flex-1">
              <WizardDropdownSelection
                currentValue={queryConfig?.attributes?.[0] || ''}
                selectableValues={[...attributes]}
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
        <div className="flex flex-col w-full pb-2">
          <WizardLabel label="Attribute" />
          <div className="flex flex-row items-center">
            <div className="flex-1">
              <WizardMultipleDropdownSelection
                currentValue={queryConfig?.attributes || []}
                error={errors && errors.attributeError}
                selectableValues={[...attributes]}
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
      )}
    </div>
  );
}
