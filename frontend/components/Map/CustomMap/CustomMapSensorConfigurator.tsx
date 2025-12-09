import { ReactElement, useState } from 'react';
import WizardLabel from '../../../ui/WizardLabel';
import { CustomMapSensor, QueryConfig, Tab } from '@/types';
import CreateDashboardElementButton from '../../../ui/Buttons/CreateDashboardElementButton';
import WizardTextfield from '../../../ui/WizardTextfield';
import WizardDropdownSelection from '../../../ui/WizardDropdownSelection';

type CustomMapSensorConfiguratorProps = {
  queryConfig: QueryConfig;
  borderColor: string;
  backgroundColor: string;
  customMapSensorValues: CustomMapSensor[];
  handleTabChange: (update: Partial<Tab>) => void;
};

export default function CustomMapSensorConfigurator(
  props: CustomMapSensorConfiguratorProps,
): ReactElement {
  const {
    queryConfig,
    borderColor,
    backgroundColor,
    customMapSensorValues,
    handleTabChange,
  } = props;

  // sensor states
  const [sensorDataValues, setSensorDataValues] = useState<CustomMapSensor[]>(
    customMapSensorValues,
  );
  const [selectedAttribute, setSelectedAttribute] = useState('');

  const handleSensorAttributeChange = (value: string, index: number): void => {
    const newCustomMapSensors = [...sensorDataValues];
    newCustomMapSensors[index].attribute = value;
    setSensorDataValues(newCustomMapSensors);

    handleTabChange({ customMapSensorData: newCustomMapSensors });
  };

  const handleSensorPositionXChange = (value: number, index: number): void => {
    const newCustomMapSensors = [...sensorDataValues];
    newCustomMapSensors[index].positionX = value;
    setSensorDataValues(newCustomMapSensors);

    handleTabChange({ customMapSensorData: newCustomMapSensors });
  };

  const handleSensorPositionYChange = (value: number, index: number): void => {
    const newCustomMapSensors = [...sensorDataValues];
    newCustomMapSensors[index].positionY = value;
    setSensorDataValues(newCustomMapSensors);

    handleTabChange({ customMapSensorData: newCustomMapSensors });
  };

  const handleAddSensor = (): void => {
    const newSensor: CustomMapSensor = {
      entityId: '',
      attribute: '',
      positionX: 0,
      positionY: 0,
    };

    const newCustomMapSensors = [...sensorDataValues];
    newCustomMapSensors.push(newSensor);

    setSensorDataValues(newCustomMapSensors);

    handleTabChange({ customMapSensorData: newCustomMapSensors });
  };

  const handleAddSensorsFromSensorValues = (): void => {
    const newCustomMapSensors = [...sensorDataValues];

    for (const sensorEntityId of queryConfig.entityIds) {
      const match = newCustomMapSensors.find(
        (x) => x.entityId === sensorEntityId,
      );
      if (!match) {
        const newMarker: CustomMapSensor = {
          entityId: sensorEntityId,
          attribute: '',
          positionX: 0,
          positionY: 0,
        };
        newCustomMapSensors.push(newMarker);
      }
    }

    setSensorDataValues(newCustomMapSensors);

    handleTabChange({ customMapSensorData: newCustomMapSensors });
  };

  const handleRemoveSensor = (index: number): void => {
    console.log('remove');
    const newCustomMapSensors = [...sensorDataValues];
    newCustomMapSensors.splice(index, 1);
    setSensorDataValues(newCustomMapSensors);

    handleTabChange({ customMapSensorData: newCustomMapSensors });
  };

  const handleEntityIdValueChanged = (value: string, index: number): void => {
    const newCustomMapSensors = [...sensorDataValues];
    newCustomMapSensors[index].entityId = value;
    setSensorDataValues(newCustomMapSensors);

    handleTabChange({ customMapSensorData: newCustomMapSensors });
  };

  const handleApplySelectedAttributeToAllMarkers = (): void => {
    const newCustomMapSensors = [...sensorDataValues];
    for (const marker of newCustomMapSensors) {
      marker.attribute = selectedAttribute;
    }
    setSensorDataValues(newCustomMapSensors);

    handleTabChange({ customMapSensorData: newCustomMapSensors });
  };

  return (
    <div className="flex flex-col w-full pb-2 mb-4">
      <WizardLabel label="Marker Konfigurationen" />
      <div className="flex flex-row w-full gap-4">
        <WizardLabel label="Sensorattribut (nach Query Konfiguration möglich)" />
        <WizardDropdownSelection
          currentValue={selectedAttribute}
          selectableValues={['', ...queryConfig.attributes]}
          onSelect={(value: string | number): void => {
            setSelectedAttribute(value.toString());
          }}
          iconColor="#fff"
          backgroundColor={backgroundColor}
          borderColor={borderColor}
        />
      </div>
      <CreateDashboardElementButton
        label="Auf alle Marker anwenden"
        handleClick={() => {
          handleApplySelectedAttributeToAllMarkers();
        }}
      />
      <div className="flex flex-col w-full h-full gap-4">
        {sensorDataValues.map((value, index) => (
          <div
            key={`sensor-value-${index}`}
            className="flex flex-col w-full border-2 border-bg[#59647D] items-center content-center pb-4 pr-4"
          >
            <div className="flex flex-row w-full gap-4 justify-start items-center content-center">
              <WizardLabel label="Entität" />
              <WizardDropdownSelection
                currentValue={value.entityId}
                selectableValues={['', ...queryConfig.entityIds]}
                onSelect={(value: string | number): void => {
                  handleEntityIdValueChanged(value.toString(), index);
                }}
                iconColor="#fff"
                backgroundColor={backgroundColor}
                borderColor={borderColor}
              />
              <WizardLabel label="Attribut" />
              <WizardDropdownSelection
                currentValue={value.attribute}
                selectableValues={['', ...queryConfig.attributes]}
                onSelect={(value: string | number): void => {
                  handleSensorAttributeChange(value.toString(), index);
                }}
                iconColor="#fff"
                backgroundColor={backgroundColor}
                borderColor={borderColor}
              />
              <CreateDashboardElementButton
                label="-"
                handleClick={(): void => handleRemoveSensor(index)}
              />
            </div>
            <div className="flex flex-row w-full gap-4 justify-start items-center content-center mr-4">
              <WizardLabel label="X" />
              <WizardTextfield
                value={value.positionX}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
                isNumeric={true}
                onChange={(value: string | number): void => {
                  const numValue =
                    typeof value === 'number' ? value : parseFloat(value);

                  if (isNaN(numValue)) {
                    return;
                  }
                  handleSensorPositionXChange(numValue, index);
                }}
              />
              <WizardLabel label="Y" />
              <WizardTextfield
                value={value.positionY}
                borderColor={borderColor}
                backgroundColor={backgroundColor}
                onChange={(value: string | number): void => {
                  const numValue =
                    typeof value === 'number' ? value : parseFloat(value);

                  if (isNaN(numValue)) {
                    return;
                  }
                  handleSensorPositionYChange(numValue, index);
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <CreateDashboardElementButton
        label="+ Marker Hinzufügen"
        handleClick={handleAddSensor}
      />
      <CreateDashboardElementButton
        label="+ Pro Entität einen Marker erzeugen (nach Query Konfiguration möglich)"
        handleClick={handleAddSensorsFromSensorValues}
      />
    </div>
  );
}
