import { ReactElement, useEffect, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { QueryConfig } from '@/types';
import WizardDropdownSelection from '@/ui/WizardDropdownSelection';
import WizardLabel from '@/ui/WizardLabel';
import { WizardErrors } from '@/types/errors';
import { DataConfigRequestType } from '@/types/wizard';
import { useSnackbar } from '@/providers/SnackBarFeedbackProvider';
import RefreshButton from '@/ui/Buttons/RefreshButton';
import WizardMultipleDropdownSelection from '@/ui/WizardMultipleDropdownSelection';
import {
  getCollections,
  getEntities,
  getSources,
  getAttributes,
} from '@/api/wizard-service-planbar';

type QueryPlanBarWizardProps = {
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

export default function QueryPlanBarWizard(
  props: QueryPlanBarWizardProps,
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

  const auth = useAuth();
  const { openSnackbar } = useSnackbar();

  const [selectedCollection, setSelectedCollection] = useState('');
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedSource, setSelectedSource] = useState('');
  const [sources, setSources] = useState<string[]>([]);
  const [sensors, setSensors] = useState<{ id: string; name: string }[]>([]);
  const [attributes, setAttributes] = useState<string[]>([]);

  const handleQueryConfigChange = (update: Partial<QueryConfig>): void => {
    setQueryConfig((prevQueryConfig) => ({ ...prevQueryConfig, ...update }));
  };

  const [loadingState, setLoadingState] = useState<{ [key: string]: boolean }>({
    collections: false,
    sources: false,
    sensors: false,
    attributes: false,
  });
  const toggleLoading = (key: string, isLoading: boolean): void => {
    setLoadingState((prev) => ({ ...prev, [key]: isLoading }));
  };

  const requestCollections = async (): Promise<void> => {
    toggleLoading('collections', true);
    try {
      const req = await getCollections(
        queryConfig?.dataSourceId,
        auth?.user?.access_token,
      );
      if (req.length > 0) {
        setCollections(['', ...req]);
        if (queryConfig?.fiwareService) {
          setSelectedCollection(queryConfig.fiwareService);
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
      const req = await getSources(params);
      if (req.length > 0) {
        setSources(req);
        const source = queryConfig?.fiwareType || req[0];
        setSelectedSource(source);
        handleQueryConfigChange({ fiwareType: source });
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
      const params: DataConfigRequestType = {
        collection: selectedCollection,
        apiId: queryConfig?.dataSourceId,
        accessToken: auth?.user?.access_token,
      };
      const req = await getEntities(params);
      setSensors(
        req
          .filter((s) => s !== 'all' && s !== '')
          .map((s) => {
            const [id, ...nameParts] = s.split('::');
            return { id, name: nameParts.join('::') };
          }),
      );
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
      const params: DataConfigRequestType = {
        collection: selectedCollection,
        apiId: queryConfig?.dataSourceId,
        accessToken: auth?.user?.access_token,
      };
      const req = await getAttributes(params);
      setAttributes(req);
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
  }, [queryConfig?.dataSourceId]);

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
              selectableValues={sources}
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
                currentValue={
                  sensors.find((s) => s.id === queryConfig?.entityIds?.[0])
                    ?.name || ''
                }
                selectableValues={['', ...sensors.map((s) => s.name)]}
                error={errors && errors.sensorError}
                onSelect={(value: string | number): void => {
                  const sensor = sensors.find(
                    (s) => s.name === value.toString(),
                  );
                  handleQueryConfigChange({
                    entityIds: sensor ? [sensor.id] : [],
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
                currentValue={(queryConfig?.entityIds || [])
                  .filter((id) => id !== 'all' && id !== '')
                  .map((id) => sensors.find((s) => s.id === id)?.name ?? id)}
                selectableValues={sensors.map((s) => s.name)}
                error={errors && errors.sensorError}
                onSelect={(value: string[]): void => {
                  const ids = value.map(
                    (name) => sensors.find((s) => s.name === name)?.id ?? name,
                  );
                  handleQueryConfigChange({ entityIds: ids });
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
          <WizardLabel label={'Attribute'} />
          <div className="flex flex-row items-center">
            <div className="flex-1">
              <WizardMultipleDropdownSelection
                currentValue={queryConfig?.attributes || []}
                selectableValues={[...attributes]}
                error={errors && errors.attributeError}
                onSelect={(value: string[]): void =>
                  handleQueryConfigChange({ attributes: value })
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
