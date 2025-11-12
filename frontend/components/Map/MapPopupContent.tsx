import React, { JSX } from 'react';
import { convertToLocaleNumber, roundToDecimal } from '@/utils/mathHelper';
import {
  getGermanVehicleType,
  getGermanLabelForSensorAttribute,
  getFormattedDate,
  getValueString,
} from './MapLabelUtils';

export type Marker = {
  position: [number, number];
  title: string;
  details: Record<string, unknown>;
  dataSource?: number;
  color?: string;
  unitsTexts?: string[];
};

interface MapPopupContentProps {
  marker: Marker;
  isCombinedMap: boolean;
  decimalSeparator: string;
}

export default function MapPopupContent({
  marker,
  isCombinedMap,
  decimalSeparator,
}: MapPopupContentProps): JSX.Element {
  let index = -1;
  return (
    <div style={{ fontSize: '14px', color: '#000000' }}>
      {Object.entries(marker.details).map(([key, value]) => {
        const tempValue = value as { value?: unknown; type?: string };
        if (
          key === 'id' ||
          key === 'location' ||
          key === 'position' ||
          key === 'name' ||
          key === 'queryId' ||
          key === 'queryConfigId' ||
          key === 'type'
        )
          return;
        if (isCombinedMap) {
          // Combined map popup logic
          if (value && tempValue.value) {
            if (key.toUpperCase() === 'TOTALCONSUMPTION') {
              return (
                <div key={key}>
                  Gesamtverbrauch:
                  <strong>
                    {' '}
                    {convertToLocaleNumber(
                      String(tempValue.value),
                      decimalSeparator,
                    )}{' '}
                    {'m³'}
                  </strong>
                </div>
              );
            }
            if (key.toUpperCase() === 'METERTYPE') {
              return (
                <div key={key}>
                  Zählertyp:
                  <strong>
                    {' '}
                    {String(tempValue.value) === 'water' ? 'Wasser' : 'Gas'}
                  </strong>
                </div>
              );
            }
            if (key.toUpperCase() === 'VEHICLETYPE') {
              return (
                <div key={key}>
                  Fahrzeugart:
                  <strong>
                    {' '}
                    {getGermanVehicleType(
                      String(tempValue.value).toUpperCase(),
                    )}
                  </strong>
                </div>
              );
            }
            if (
              key.toUpperCase() === 'DATE' ||
              key.toUpperCase() === 'DATEOBSERVED'
            ) {
              return (
                <div key={key}>
                  Datum:
                  <strong>{getFormattedDate(String(tempValue.value))}</strong>
                </div>
              );
            }
            index++;
            return (
              <div key={key}>
                {getGermanLabelForSensorAttribute(key.toUpperCase())}:{' '}
                <strong>
                  {' '}
                  {tempValue.value
                    ? convertToLocaleNumber(
                        roundToDecimal(Number(tempValue.value)).toString(),
                        decimalSeparator,
                      )
                    : convertToLocaleNumber(
                        roundToDecimal(Number(tempValue)).toString(),
                        decimalSeparator,
                      )}{' '}
                  {marker.unitsTexts?.[index]}
                </strong>
              </div>
            );
          }
        } else {
          // Single map popup logic
          if (value && typeof tempValue === 'object' && 'type' in tempValue) {
            if (key.toUpperCase() === 'TOTALCONSUMPTION') {
              return (
                <div key={key}>
                  Gesamtverbrauch:
                  <strong>
                    {' '}
                    {convertToLocaleNumber(
                      String(tempValue.value),
                      decimalSeparator,
                    )}{' '}
                    {'m³'}
                  </strong>
                </div>
              );
            }
            if (key.toUpperCase() === 'METERTYPE') {
              return (
                <div key={key}>
                  Zählertyp:
                  <strong>
                    {' '}
                    {String(tempValue.value) === 'water' ? 'Wasser' : 'Gas'}
                  </strong>
                </div>
              );
            }
            if (key.toUpperCase() === 'VEHICLETYPE') {
              return (
                <div key={key}>
                  Fahrzeugart:
                  <strong>
                    {' '}
                    {getGermanVehicleType(
                      String(tempValue.value).toUpperCase(),
                    )}
                  </strong>
                </div>
              );
            }
            if (
              key.toUpperCase() === 'DATE' ||
              key.toUpperCase() === 'DATEOBSERVED'
            ) {
              return (
                <div key={key}>
                  Datum:
                  <strong>{getFormattedDate(String(tempValue.value))}</strong>
                </div>
              );
            }
            index++;
            return (
              <div key={key}>
                {getGermanLabelForSensorAttribute(key.toUpperCase())}:{' '}
                <strong>
                  {' '}
                  {getValueString(tempValue, decimalSeparator)}{' '}
                  {marker.unitsTexts?.[index]}
                </strong>
              </div>
            );
          } else if (value !== null && value !== undefined) {
            index++;
            return (
              <div key={key}>
                {key}:{' '}
                <strong>
                  {typeof value === 'number'
                    ? convertToLocaleNumber(
                        roundToDecimal(value).toString(),
                        decimalSeparator,
                      )
                    : String(value)}{' '}
                  {marker.unitsTexts?.[index]}
                </strong>
              </div>
            );
          }
        }

        return null;
      })}
    </div>
  );
}
