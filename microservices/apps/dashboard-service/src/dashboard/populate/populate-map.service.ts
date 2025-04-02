/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { ChartData, MapObject, Position } from '../dashboard.service';
import { Tab } from '@app/postgres-db/schemas';
import { Query } from '@app/postgres-db/schemas/query.schema';
import { DataModel } from '@app/postgres-db/schemas/data-model.schema';
import * as wkx from 'wkx';

@Injectable()
export class PopulateMapService {
  constructor() {}

  public populateTabWithMapObjectFromArray(
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
      mapObject: MapObject[];
    },
    query: Query,
  ): void {
    const queryData = query.queryData;

    tab.mapObject = [];

    if (Array.isArray(queryData)) {
      for (const dataObject of queryData) {
        let position: Position;

        // Prioritize fakePosition if it exists, otherwise use location
        if (dataObject['fakePosition']) {
          position = dataObject['fakePosition'].value;
        } else if (dataObject['location']) {
          position = dataObject['location'].value;
        } else if (dataObject['attributes'] && dataObject['attributes'][0]) {
          position = this.getGeoJsonFromNgsi(dataObject);
        } else if (dataObject['position']) {
          position = dataObject.position;
        }

        if (position) {
          let tempCoordinates: number[] = [];
          if (position.coordinates[0] < position.coordinates[1]) {
            tempCoordinates = [
              position.coordinates[1],
              position.coordinates[0],
            ];
          } else {
            tempCoordinates = [
              position.coordinates[0],
              position.coordinates[1],
            ];
          }
          tab.mapObject.push({
            position: {
              type: position.type ?? 'Point',
              coordinates: tempCoordinates,
            },
            ...dataObject,
          });
        }
      }
    }
  }

  public populateTabWithMapObjectFromObject(
    tab: Tab & { query?: Query } & { dataModel: DataModel } & {
      chartData: ChartData[];
      mapObject: MapObject[];
    },
    query: Query,
  ): void {
    const queryData = query.queryData as object;

    tab.mapObject = [];

    // Prioritize fakePosition if it exists, otherwise use location
    if (queryData && queryData['fakePosition']) {
      const position = queryData['fakePosition'].value;

      tab.mapObject.push({
        position: position,
        ...queryData,
      });
    } else if (queryData && queryData['location']) {
      const position = queryData['location'].value;

      tab.mapObject.push({
        position: position,
        ...queryData,
      });
    } else if (
      queryData &&
      queryData['attributes'] &&
      queryData['attributes'].length > 0
    ) {
      const locationArray = queryData['attributes'].filter(
        (attribute) =>
          attribute.attrName === 'fakePosition' ||
          attribute.attrName === 'location' ||
          attribute.attrName === 'position',
      );
      const dataArrayWithoutLocation = queryData['attributes'].filter(
        (attribute) =>
          attribute.attrName !== 'position' &&
          attribute.attrName !== 'location' &&
          attribute.attrName !== 'fakePosition',
      );

      if (locationArray && locationArray.length > 0) {
        const locationValues = locationArray[0]['values'];

        if (locationValues && locationValues.length > 0) {
          const mapObject = this.buildMapObjectForSingleEntity(
            locationValues,
            dataArrayWithoutLocation,
          );

          tab.mapObject.push(mapObject);
        }
      }
    } else if (queryData && queryData['attrs']) {
      const locationArray = queryData['attrs'].filter(
        (attribute) =>
          attribute.attrName === 'fakePosition' ||
          attribute.attrName === 'location' ||
          attribute.attrName === 'position',
      );
      const dataArrayWithoutLocation = queryData['attrs'].filter(
        (attribute) =>
          attribute.attrName !== 'position' &&
          attribute.attrName !== 'location' &&
          attribute.attrName !== 'fakePosition',
      );

      if (this.isLocationArrayForMultipleEntitiesExisting(locationArray)) {
        let positions = this.getMultipleEntityPositions(locationArray);
        positions = this.populatePositionsWithValues(
          positions,
          dataArrayWithoutLocation,
        );

        tab.mapObject.push(...positions);
      }
    }
  }

  private buildMapObjectForSingleEntity(
    locationValues: any[],
    dataArrayWithoutLocation: object[],
  ): MapObject {
    let position: Position;
    const lastValue = locationValues[locationValues.length - 1];

    if (typeof lastValue === 'string') {
      position = this.getGeoJsonFromNgsi(lastValue);
    } else if (
      typeof lastValue === 'object' &&
      lastValue.type &&
      lastValue.coordinates
    ) {
      position = lastValue;
    } else {
      try {
        const parsedValue =
          typeof lastValue === 'string' ? JSON.parse(lastValue) : lastValue;
        if (parsedValue.type && parsedValue.coordinates) {
          position = parsedValue;
        }
      } catch (e) {
        console.error('Failed to parse position value:', lastValue);
        position = null;
      }
    }

    let mapObject: MapObject = {
      position: position,
    };

    if (dataArrayWithoutLocation && dataArrayWithoutLocation.length > 0) {
      mapObject = this.populateMapObjectWithValues(
        mapObject,
        dataArrayWithoutLocation,
      );
    }

    return mapObject;
  }

  private getMultipleEntityPositions(locationArray: object[]): MapObject[] {
    const entityArray = locationArray[0]['types'][0].entities;

    return entityArray
      .filter(
        (entity: object) => entity['values'] && entity['values'].length > 0,
      )
      .map((entity: object) => {
        const latestEntityLocationEntry =
          entity['values'][entity['values'].length - 1];
        return {
          position: this.getGeoJsonFromNgsi(latestEntityLocationEntry),
        };
      });
  }

  private getGeoJsonFromNgsi(wkbCoordinates: any): Position {
    if (
      typeof wkbCoordinates === 'object' &&
      wkbCoordinates !== null &&
      wkbCoordinates.type &&
      wkbCoordinates.coordinates
    ) {
      return wkbCoordinates;
    }

    if (wkbCoordinates && typeof wkbCoordinates === 'string') {
      try {
        const wkbBuffer = Buffer.from(wkbCoordinates, 'hex');
        const coordinates = wkx.Geometry.parse(wkbBuffer);

        if (coordinates) {
          const geoJsonCoordinates = coordinates.toGeoJSON();

          return {
            type: 'Point',
            coordinates: [
              geoJsonCoordinates['coordinates'][1],
              geoJsonCoordinates['coordinates'][0],
            ],
          };
        }
      } catch (error) {
        console.error('Error parsing WKB coordinates:', error);
      }
    }

    return null;
  }

  private populatePositionsWithValues(
    positions: Array<MapObject>,
    dataArrayWithoutLocation: object[],
  ): MapObject[] {
    positions.forEach((mapObject, entityIdIndex) => {
      return this.populateMapObjectWithAttributesForEntityId(
        mapObject,
        entityIdIndex,
        dataArrayWithoutLocation,
      );
    });

    return positions;
  }

  private populateMapObjectWithAttributesForEntityId(
    mapObject: MapObject,
    entityIdIndex: number,
    dataArrayWithoutLocation: Array<object>,
  ): MapObject {
    dataArrayWithoutLocation.forEach((noLocationAttribute: object) => {
      if (
        noLocationAttribute['types'] &&
        noLocationAttribute['types'].length > 0
      ) {
        const attributeName = noLocationAttribute['attrName'];
        const type = noLocationAttribute['types'][0];

        if (type['entities'] && type['entities'].length > 0) {
          const entityObject = type['entities'][entityIdIndex];
          const entityValues = entityObject['values'];

          if (entityValues && entityValues.length > 0) {
            mapObject[attributeName] = entityValues[entityValues.length - 1];
          }
        }
      }
    });

    return mapObject;
  }

  private populateMapObjectWithValues(
    mapObject: MapObject,
    dataArrayWithoutLocation: object[],
  ): MapObject {
    for (const noLocationAttribute of dataArrayWithoutLocation) {
      const attributeName = noLocationAttribute['attrName'];

      const noLocationAttributeValues = noLocationAttribute['values'];

      mapObject[attributeName] =
        noLocationAttributeValues[noLocationAttributeValues.length - 1];
    }

    return mapObject;
  }

  private isLocationArrayForMultipleEntitiesExisting(
    locationArray: object[],
  ): boolean {
    return (
      locationArray &&
      locationArray.length > 0 &&
      locationArray[0]['types'] &&
      locationArray[0]['types'].length > 0
    );
  }
}
