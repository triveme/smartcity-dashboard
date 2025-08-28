import { ReactElement, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';

import { QueryConfig } from '@/types';
import WizardDropdownSelection from '@/ui/WizardDropdownSelection';
import WizardLabel from '@/ui/WizardLabel';
import WizardMultipleDropdownSelection from '@/ui/WizardMultipleDropdownSelection';
import {
  getAttributeForSource,
  getCollections,
  getEntitiesForSource,
  getSourcesForCollection,
} from '@/api/wizard-service-internal-data';
import { WizardErrors } from '@/types/errors';
import { DataConfigRequestType } from '@/types/wizard';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import RefreshButton from '@/ui/Buttons/RefreshButton';

type QueryInternalDataWizardProps = {
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
  tenant?: string;
};

export default function QueryInternalDataWizard(
  props: QueryInternalDataWizardProps,
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
    tenant,
  } = props;

  const auth = useAuth();
  const { openSnackbar } = useSnackbar();

  const [selectedCollection, setSelectedCollection] = useState('');
  const [collections, setCollections] = useState<string[]>([]);

  const [selectedSource, setSelectedSource] = useState('');
  const [sources, setSources] = useState<string[]>([]);

  // const [selectedSensors, setSelectedSensors] = useState<string[]>([]);
  const [sensors, setSensors] = useState<string[]>([]);

  const [attributes, setAttributes] = useState<string[]>([]);

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
      let req: string[] = [];
      req = await getCollections(
        queryConfig?.dataSourceId,
        auth?.user?.access_token,
      );

      if (req.length > 0) {
        setCollections(['', ...req]);
        if (queryConfig?.fiwareService) {
          setSelectedCollection(queryConfig?.fiwareService);
        } else {
          setSelectedCollection(collections[0]);
        }
      }
    } catch (error) {
      console.error(error);
      openSnackbar(
        'Fehler beim Abfragen von Collections. Keine Daten',
        'error',
      );
    } finally {
      toggleLoading('collections', false);
    }
  };

  const requestSource = async (): Promise<void> => {
    toggleLoading('source', true);
    try {
      const params: DataConfigRequestType = {
        collection: selectedCollection,
        apiId: queryConfig?.dataSourceId,
        accessToken: auth?.user?.access_token,
      };
      let req: string[] = [];
      req = await getSourcesForCollection(params, tenant);

      if (req.length > 0) {
        setSources(req);
        if (queryConfig?.fiwareType) {
          setSelectedSource(queryConfig?.fiwareType);
        } else {
          setSelectedSource(sources[0]);
        }
      }
    } catch (error) {
      console.error(error);
      openSnackbar('Fehler beim Abfragen von Sources. Keine Daten', 'error');
    } finally {
      toggleLoading('source', false);
    }
  };

  const requestSensors = async (): Promise<void> => {
    toggleLoading('sensors', true);
    try {
      let req: string[] = [];
      const params: DataConfigRequestType = {
        collection: selectedCollection,
        source: selectedSource,
        apiId: queryConfig?.dataSourceId,
        accessToken: auth?.user?.access_token,
      };
      req = await getEntitiesForSource(params);

      setSensors(req);
    } catch (error) {
      console.error(error);
      openSnackbar('Fehler beim Abfragen von Sensoren. Keine Daten', 'error');
    } finally {
      toggleLoading('sensors', false);
    }
  };

  const requestAttributes = async (): Promise<void> => {
    toggleLoading('attributes', true);
    try {
      let req: string[] = [];
      const params: DataConfigRequestType = {
        collection: selectedCollection,
        source: selectedSource,
        apiId: queryConfig?.dataSourceId,
        accessToken: auth?.user?.access_token,
      };
      req = await getAttributeForSource(params);

      if (req.length > 0) {
        setAttributes(req);
      }
    } catch (error) {
      console.error(error);
      openSnackbar('Fehler beim Abfragen von Attributen. Keine Daten', 'error');
    } finally {
      toggleLoading('attributes', false);
    }
  };

  useEffect(() => {
    if (selectedCollection && selectedCollection !== '') {
      requestSource();
    } else {
      setSelectedSource('');
      setSources([]);
      setSensors([]);
      setAttributes([]);
    }
  }, [selectedCollection]);

  useEffect(() => {
    if (selectedSource && selectedSource !== '') {
      requestSensors();
      requestAttributes();
    } else {
      setSensors([]);
      setAttributes([]);
    }
  }, [selectedSource]);

  useEffect(() => {
    requestCollections();
  }, [queryConfig]);

  return (
    <div>
      <div className="flex flex-col w-full pb-2">
        <WizardLabel label="Collections" />
        <div className="flex flex-row items-center">
          <div className="flex-1">
            <WizardDropdownSelection
              currentValue={queryConfig?.fiwareService || ''}
              selectableValues={collections || []}
              onSelect={(value: string | number): void => {
                handleQueryConfigChange({
                  fiwareService: value.toString(),
                  fiwareType: '',
                  entityIds: [],
                  attributes: [],
                });
                setSelectedCollection(value.toString());
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
      <div className="flex flex-col w-full pb-2">
        <WizardLabel label="Sources" />
        <div className="flex flex-row items-center">
          <div className="flex-1">
            <WizardDropdownSelection
              currentValue={queryConfig?.fiwareType || ''}
              selectableValues={['', ...sources]}
              onSelect={(value: string | number): void => {
                handleQueryConfigChange({
                  fiwareType: value.toString(),
                  entityIds: [],
                  attributes: [],
                });
                setSelectedSource(value.toString());
              }}
              error={errors && errors.fiwareTypeError}
              iconColor={iconColor}
              borderColor={borderColor}
              backgroundColor={backgroundColor}
            />
          </div>
          <RefreshButton
            handleClick={requestSource}
            className={loadingState.source ? 'animate-spin' : ''}
            fontColor={iconColor}
            hoverColor={hoverColor}
            backgroundColor={backgroundColor}
          />
        </div>
      </div>
      {isSingleWidget ? (
        <div className="flex flex-col w-full pb-2">
          <WizardLabel label={'Datenreihe'} />
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
            <RefreshButton
              handleClick={requestSensors}
              className={loadingState.sensors ? 'animate-spin' : ''}
              fontColor={iconColor}
              hoverColor={hoverColor}
              backgroundColor={backgroundColor}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col w-full pb-2">
          <WizardLabel label={'Datenreihen'} />
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
            <RefreshButton
              handleClick={requestSensors}
              className={loadingState.sensors ? 'animate-spin' : ''}
              fontColor={iconColor}
              hoverColor={hoverColor}
              backgroundColor={backgroundColor}
            />
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
            <RefreshButton
              handleClick={requestAttributes}
              className={loadingState.attributes ? 'animate-spin' : ''}
              fontColor={iconColor}
              hoverColor={hoverColor}
              backgroundColor={backgroundColor}
            />
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
            <RefreshButton
              handleClick={requestAttributes}
              className={loadingState.attributes ? 'animate-spin' : ''}
              fontColor={iconColor}
              hoverColor={hoverColor}
              backgroundColor={backgroundColor}
            />
          </div>
        </div>
      )}
    </div>
  );
}
