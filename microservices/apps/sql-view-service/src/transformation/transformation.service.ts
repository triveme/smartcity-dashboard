import { Injectable } from '@nestjs/common';

interface Coordinate {
  latitude: number | string;
  longitude: number | string;
}

interface Attribute<T> {
  attrName: string;
  values: T[];
}

interface FiwareInput {
  attributes: Attribute<unknown>[];
}

interface FiwareGeoPoint {
  type: 'geo:json';
  value: {
    type: 'Point';
    coordinates: [number, number];
  };
  metadata: Record<string, unknown>;
}

interface FiwareGeoLine {
  type: 'geo:json';
  value: {
    type: 'Line';
    coordinates: [number, number][];
  };
  metadata: Record<string, unknown>;
}

interface FiwarePointEntity {
  id: string | null;
  type: 'Project';
  name: string;
  status: string;
  category: string;
  location: FiwareGeoPoint;
}

interface FiwareLineEntity {
  id: string;
  type: 'Street';
  status: string;
  category: string;
  location: FiwareGeoLine;
}

type FiwareOutput = (FiwarePointEntity | FiwareLineEntity)[];

@Injectable()
export class TransformationService {
  public convertAttributesToFiware(input: FiwareInput): FiwareOutput {
    const idAttr = input.attributes.find(
      (a) => a.attrName === 'id',
    ) as Attribute<string>;
    const locationAttr = input.attributes.find(
      (a) => a.attrName === 'location',
    ) as Attribute<Coordinate>;
    const lineAttr = input.attributes.find(
      (a) => a.attrName === 'line_locations',
    ) as Attribute<Coordinate[]>;
    const nameAttr = input.attributes.find(
      (a) => a.attrName === 'title',
    ) as Attribute<string>;
    const statusAttr = input.attributes.find(
      (a) => a.attrName === 'status',
    ) as Attribute<string>;
    const categoryAttr = input.attributes.find(
      (a) => a.attrName === 'category',
    ) as Attribute<string>;
    const output: FiwareOutput = [];

    console.error(input.attributes);
    if (locationAttr) {
      locationAttr.values.forEach((loc, index) => {
        output.push({
          id: idAttr?.values[index] ?? null,
          name: nameAttr?.values[index] ?? '',
          status: statusAttr?.values[index] ?? '',
          category: categoryAttr?.values[index] ?? '',
          type: 'Project',
          location: {
            type: 'geo:json',
            value: {
              type: 'Point',
              coordinates: [Number(loc.latitude), Number(loc.longitude)],
            },
            metadata: {},
          },
        });
      });
    }

    if (lineAttr) {
      lineAttr.values.forEach((lineArray, index) => {
        const coords: [number, number][] = lineArray.map((p) => [
          Number(p.latitude),
          Number(p.longitude),
        ]);
        output.push({
          id: `${idAttr?.values[index] ?? null}_line`,
          type: 'Street',
          status: statusAttr?.values[index] ?? '',
          category: categoryAttr?.values[index] ?? '',
          location: {
            type: 'geo:json',
            value: {
              type: 'Line',
              coordinates: coords,
            },
            metadata: {},
          },
        });
      });
    }
    return output;
  }
}
