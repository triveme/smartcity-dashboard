import { Injectable } from '@nestjs/common';

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  name: string;
  features: GeoJSONFeature[];
}

interface GeoJSONFeature {
  type: 'Feature';
  geometry: GeoJSONGeometry;
  properties: { [key: string]: string | number | object };
}

interface GeoJSONGeometry {
  type: 'Point' | 'LineString' | 'Polygon';
  coordinates: object;
}

export interface NGSIv2Entity {
  id: string;
  type: string;
  location: {
    type: 'geo:json';
    value: GeoJSONGeometry;
  };

  [key: string]: string | number | object;
}

@Injectable()
export class TransformationService {
  public transformToNgsi(
    featureCollection: GeoJSONFeatureCollection[] | GeoJSONFeatureCollection,
  ): NGSIv2Entity[] {
    if (!featureCollection) return [];

    if (Array.isArray(featureCollection)) {
      return featureCollection
        .map((collection) => {
          return this.transformFeatureCollection(collection);
        })
        .flat();
    } else {
      return this.transformFeatureCollection(featureCollection);
    }
  }

  private transformFeatureCollection(
    collection: GeoJSONFeatureCollection,
  ): NGSIv2Entity[] {
    return collection.features.map((feature, index) => {
      const ngsiEntity: NGSIv2Entity = {
        id: `Feature${index + 1}`, // ID der Entität, kann angepasst werden
        type: 'GeoFeature', // Typ der Entität, kann angepasst werden
        location: {
          type: 'geo:json',
          value: feature.geometry,
        },
        ...feature.properties, // Alle anderen Eigenschaften aus dem Feature
      };

      return ngsiEntity;
    });
  }
}
