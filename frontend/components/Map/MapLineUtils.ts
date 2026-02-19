import { LatLngExpression } from 'leaflet';
import { MarkerType } from '@/types/mapRelatedModels';
import { ProjectInput } from './MapProjectUtils';

/**
 * Extracts line coordinates from a marker's line_locations or lineLocations property
 * @param marker - The marker object to extract coordinates from
 * @returns Array of LatLngExpression coordinates, or null if not a valid line
 */
export const getLineCoords = (
  marker: MarkerType,
): LatLngExpression[] | null => {
  const line =
    marker?.details?.line_locations || marker?.details?.lineLocations;
  if (!Array.isArray(line) || line.length < 2) return null;

  const coords: LatLngExpression[] = line
    .map(
      (p: {
        latitude?: number;
        longitude?: number;
      }): [number, number] | null => {
        const latRaw = p?.latitude;
        const lngRaw = p?.longitude;
        const lat = typeof latRaw === 'string' ? Number(latRaw) : latRaw;
        const lng = typeof lngRaw === 'string' ? Number(lngRaw) : lngRaw;
        if (lat === undefined || lng === undefined) return null;
        if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
        return [lat, lng] as [number, number];
      },
    )
    .filter((c): c is [number, number] => Boolean(c));

  return coords.length >= 2 ? coords : null;
};

/**
 * Extracts street line coordinates from a marker of type "Street"
 * @param marker - The marker object to extract street coordinates from
 * @returns Array of LatLngExpression coordinates, or null if not a valid street line
 */
export const getStreetLineCoords = (
  marker: MarkerType,
): LatLngExpression[] | null => {
  const details = marker?.details;
  if (!details || details?.type !== 'Street') return null;

  const rawCoords = details?.location?.value?.coordinates;
  if (!Array.isArray(rawCoords) || rawCoords.length < 2) return null;

  const coords: LatLngExpression[] = rawCoords
    .map(
      (p: {
        latitude?: number;
        longitude?: number;
      }): [number, number] | null => {
        if (Array.isArray(p) && p.length >= 2) {
          const lat = typeof p[0] === 'string' ? Number(p[0]) : p[0];
          const lng = typeof p[1] === 'string' ? Number(p[1]) : p[1];
          if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
          return [lat, lng] as [number, number];
        }
        const latRaw = p?.latitude;
        const lngRaw = p?.longitude;
        const lat = typeof latRaw === 'string' ? Number(latRaw) : latRaw;
        const lng = typeof lngRaw === 'string' ? Number(lngRaw) : lngRaw;
        if (lat === undefined || lng === undefined) return null;
        if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
        return [lat, lng] as [number, number];
      },
    )
    .filter((c): c is [number, number] => Boolean(c));

  return coords.length >= 2 ? coords : null;
};

/**
 * Extracts line coordinates from a project input (for newly created projects)
 * @param input - The project data object
 * @returns Array of [lat, lng] coordinate tuples
 */
export const extractLineCoords = (input: ProjectInput): [number, number][] => {
  const rawLine = input?.line_locations;

  if (!Array.isArray(rawLine)) return [];

  return rawLine
    .map((p: { latitude?: number; longitude?: number }) => {
      const latRaw = p?.latitude;
      const lngRaw = p?.longitude;
      const lat = typeof latRaw === 'string' ? Number(latRaw) : latRaw;
      const lng = typeof lngRaw === 'string' ? Number(lngRaw) : lngRaw;
      if (lat === undefined || lng === undefined) return null;
      if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
      return [lat, lng] as [number, number];
    })
    .filter((c): c is [number, number] => Boolean(c));
};
