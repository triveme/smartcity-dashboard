/**
 * Fetches and caches project categories for given marker positions.
 * @param markerPositions - Array of marker objects (should be MarkerType[])
 * @param authToken - User access token
 * @param projectCategoryCache - Current cache object
 * @param setProjectCategoryCache - State setter for cache
 */
export async function fetchAndCacheProjectCategories(params: {
  markerPositions: unknown[];
  authToken: string | undefined;
  projectCategoryCache: Record<string, string>;
  setProjectCategoryCache: (
    updater: (prev: Record<string, string>) => Record<string, string>,
  ) => void;
}): Promise<void> {
  const {
    markerPositions,
    authToken,
    projectCategoryCache,
    setProjectCategoryCache,
  } = params;
  const projectMarkers = markerPositions.filter((m) =>
    isProjectOrStreetType(m),
  );
  const idsToFetch = projectMarkers
    .map((m) => getProjectId(m))
    .filter(
      (id): id is string =>
        id !== null && !projectCategoryCache.hasOwnProperty(id),
    );

  if (idsToFetch.length === 0) return;

  const newCache: Record<string, string> = {};
  await Promise.all(
    idsToFetch.map(async function fetchCategoryForProject(id): Promise<void> {
      try {
        const { getProject } = await import('@/api/project-service');
        const project = await getProject(authToken, id);
        if (project && typeof project === 'object') {
          const catRaw = (project as Record<string, unknown>)['category'];
          const cat = typeof catRaw === 'string' ? catRaw : '';
          newCache[id] = cat;
          console.log(`[Map] Fetched category for ${id}:`, cat);
        }
      } catch (err) {
        console.error(`[Map] Failed to fetch project ${id}:`, err);
        newCache[id] = '';
      }
    }),
  );

  if (Object.keys(newCache).length > 0) {
    setProjectCategoryCache((prev) => ({ ...prev, ...newCache }));
  }
}
import L from 'leaflet';
import { BUILDING_PATH } from '@/assets/icons/Building';
import { EXCAVATOR_PATH } from '@/assets/icons/Excavator';
import { HANDYMAN_PATH_1, HANDYMAN_PATH_2 } from '@/assets/icons/Handyman';
import { extractLineCoords } from './MapLineUtils';

/**
 * Project category icon paths (white fill for visibility on colored pins)
 */
export const PROJECT_CATEGORY_ICONS: Record<string, string> = {
  // House icon for Hochbau
  hochbau: `<path fill="#FFFFFF" d="${BUILDING_PATH}"/>`,
  // Excavator icon for Tiefbau
  tiefbau: `<path fill="#FFFFFF" d="${EXCAVATOR_PATH}"/>`,
  // Handyman/tools icon for Sonstiges (default)
  sonstiges: `<path fill="#FFFFFF" d="${HANDYMAN_PATH_1}"/><path fill="#FFFFFF" d="${HANDYMAN_PATH_2}"/>`,
};

/**
 * Basic shape for map objects used across map utils
 */
export type MapObject = {
  id?: string;
  category?: string;
  queryConfigId?: string;
  queryId?: string;
  status?: string;
  type?: string;
  location?: { type: string; value: unknown; metadata: unknown };
  position?: { type: string; coordinates: [number, number] };
  details?: unknown;
  line_locations?: Array<{
    latitude?: number;
    longitude?: number;
  }>;
};
import { MapRef } from 'react-leaflet/MapContainer';
import { LatLngExpression } from 'leaflet';

/**
 * Coordinate selection input from the MapCreatePinModal
 */
export type CoordinateSelection = {
  lat: number;
  lng: number;
  label?: string;
} | null;

/**
 * Route point for multi-point route selection
 */
export type RoutePoint = {
  lat: number;
  lng: number;
};

/**
 * Search marker state type
 */
export type SearchMarkerState = {
  position: LatLngExpression;
  label: string;
  routePoints?: LatLngExpression[];
} | null;

/**
 * Creates a handler for coordinate selection from MapCreatePinModal
 * @param setSearchMarker - State setter for search marker
 * @param mapRef - Reference to the map container
 * @returns Handler function for onSelectCoordinates
 */
export const createSelectCoordinatesHandler = (
  setSearchMarker: (marker: SearchMarkerState) => void,
  mapRef: React.RefObject<MapRef | null>,
): ((coords: CoordinateSelection) => void) => {
  return (coords: CoordinateSelection): void => {
    queueMicrotask(() => {
      try {
        if (!coords) {
          setSearchMarker(null);
          return;
        }
        setSearchMarker({
          position: [coords.lat, coords.lng],
          label: coords.label || '',
        });
        if (coords.lat && coords.lng) {
          // panTo like SearchControl does
          mapRef.current?.panTo(
            [coords.lat, coords.lng] as L.LatLngExpression,
            { duration: 1.2 } as L.PanOptions,
          );
        }
      } catch (err) {
        console.error(
          'Error handling onSelectCoordinates from MapCreatePinModal',
          err,
        );
      }
    });
  };
};

/**
 * Creates a handler for route selection from MapCreatePinModal
 * @param setSearchMarker - State setter for search marker
 * @param mapRef - Reference to the map container
 * @returns Handler function for onSelectRoute
 */
export const createSelectRouteHandler = (
  setSearchMarker: (marker: SearchMarkerState) => void,
  mapRef: React.RefObject<MapRef | null>,
): ((points: RoutePoint[]) => void) => {
  return (points: RoutePoint[]): void => {
    // Defer state updates to avoid setState during render
    queueMicrotask(() => {
      try {
        if (!points || points.length === 0) {
          setSearchMarker(null);
          return;
        }
        const last = points[points.length - 1];
        const routePositions = points.map(
          (p) => [p.lat, p.lng] as [number, number],
        );
        setSearchMarker({
          position: [last.lat, last.lng],
          label: 'Strecke',
          routePoints: routePositions,
        });
        if (last)
          mapRef.current?.panTo(
            [last.lat, last.lng] as L.LatLngExpression,
            { duration: 1.2 } as L.PanOptions,
          );
      } catch (err) {
        console.error(
          'Error handling onSelectRoute from MapCreatePinModal',
          err,
        );
      }
    });
  };
};

/**
 * Extracts a value from a map object's attribute (handles nested .value structures)
 */
export const getMapAttributeValue = (
  mapObject: MapObject | unknown,
  attributeName: string,
): unknown => {
  if (!mapObject) return null;
  const obj = mapObject as MapObject;
  switch (attributeName) {
    case 'id':
      return obj.id;
    case 'category':
      return obj.category;
    case 'queryConfigId':
      return obj.queryConfigId;
    case 'queryId':
      return obj.queryId;
    case 'status':
      return obj.status;
    case 'type':
      return obj.type;
    case 'location':
      return obj.location;
    case 'position':
      return obj.position;
    default:
      return null;
  }
};

/**
 * Extracts an attribute value from the project object, checking both root and details
 */
export const getProjectAttributeValue = (
  mapObject: MapObject,
  attributeName: string,
): unknown => {
  const direct = getMapAttributeValue(mapObject, attributeName);
  if (direct !== null && direct !== undefined) return direct;
  return getMapAttributeValue(mapObject?.details, attributeName);
};

/**
 * Gets the project ID from a map object (handles multiple data structures)
 */
export const getProjectId = (mapObject: unknown): string | null => {
  const raw = getProjectAttributeValue(mapObject as MapObject, 'id');
  return raw !== null && raw !== undefined ? String(raw) : null;
};

/**
 * Checks if the map object is of type "Project"
 */
export const isProjectType = (mapObject: unknown): boolean => {
  const rawType = getProjectAttributeValue(mapObject as MapObject, 'type');
  return String(rawType || '').toLowerCase() === 'project';
};

/**
 * Checks if the map object is of type "Project" or "Street"
 */
export const isProjectOrStreetType = (mapObject: unknown): boolean => {
  const rawType = getProjectAttributeValue(mapObject as MapObject, 'type');
  const normalized = String(rawType || '').toLowerCase();
  return normalized === 'project' || normalized === 'street';
};

/**
 * Gets the project status from a map object
 */
export const getProjectStatus = (mapObject: MapObject): string => {
  const raw = getProjectAttributeValue(mapObject, 'status');
  return raw !== null && raw !== undefined ? String(raw) : '';
};

/**
 * Returns a status-based color for project/street types
 * - ARCHIVED: Green (#0C8346)
 * - PLANNED: Blue (#0069B3)
 * - ACTIVE: Red (#F44336)
 */
export const getStatusColor = (mapObject: unknown): string | null => {
  if (!isProjectOrStreetType(mapObject)) return null;
  const status = getProjectStatus(mapObject as MapObject)
    .trim()
    .toUpperCase();
  if (status === 'ARCHIVED') return '#0C8346';
  if (status === 'PLANNED') return '#0069B3';
  if (status === 'ACTIVE') return '#F44336';
  return null;
};

/**
 * Gets the project category from a map object, checking cache first
 */
export const getProjectCategory = (
  mapObject: MapObject,
  projectCategoryCache: Record<string, string>,
): string => {
  // First check the cache using project ID
  const projectId = getProjectId(mapObject);
  if (projectId && projectCategoryCache[projectId]) {
    console.log(
      `[Map] getProjectCategory - using cached value for ${projectId}:`,
      projectCategoryCache[projectId],
    );
    return projectCategoryCache[projectId].toLowerCase().trim();
  }

  // Fallback to checking the marker data directly
  const raw = getProjectAttributeValue(mapObject, 'category');
  console.log('[Map] getProjectCategory - raw value from marker:', raw);
  return raw !== null && raw !== undefined && raw !== ''
    ? String(raw).toLowerCase().trim()
    : '';
};

/**
 * Gets the SVG icon path for a project category
 */
export const getProjectCategoryIconSvg = (
  mapObject: MapObject,
  projectCategoryCache: Record<string, string>,
): string => {
  const category = getProjectCategory(mapObject, projectCategoryCache);
  console.log('[Map] getProjectCategoryIconSvg - category:', category);
  if (category.includes('hochbau')) return PROJECT_CATEGORY_ICONS.hochbau;
  if (category.includes('tiefbau')) return PROJECT_CATEGORY_ICONS.tiefbau;
  // Default to tools icon for sonstiges or unknown
  return PROJECT_CATEGORY_ICONS.sonstiges;
};

/**
 * Creates a custom Leaflet DivIcon for project/street markers with category-specific icons
 */
export const createProjectCategoryIcon = (
  color: string,
  mapObject: unknown,
  projectCategoryCache: Record<string, string>,
): L.DivIcon => {
  const categoryIconPath = getProjectCategoryIconSvg(
    mapObject as MapObject,
    projectCategoryCache,
  );
  const iconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="${color}">
      <path d="M15 2C10.58 2 7 5.58 7 10c0 6.627 8 16 8 16s8-9.373 8-16c0-4.42-3.58-8-8-8z"/>
      <g transform="translate(10.2,5) scale(0.4)">${categoryIconPath}</g>
    </svg>`;
  return L.divIcon({
    html: `<div class="custom-icon-wrapper">${iconSvg}</div>`,
    className: 'custom-marker-icon',
    iconSize: L.point(60, 60),
    iconAnchor: [30, 60],
    popupAnchor: [0, -60],
  });
};

/**
 * Checks if a map object is public
 */
export const hasProjectVisibilityFlag = (mapObject: MapObject): boolean => {
  return Boolean(getProjectAttributeValue(mapObject, 'is_public'));
};

/**
 * Determines if a project is public based on visibility flags
 */
export const isProjectPublic = (mapObject: unknown): boolean => {
  const raw = getProjectAttributeValue(mapObject as MapObject, 'is_public');

  if (raw === null || raw === undefined) return true;
  return Boolean(raw);
};

/**
 * Filters project items based on visibility settings
 * @param items - Array of map items to filter
 * @param visibilityMap - Optional map of project IDs to visibility status
 * @param isProjectAdmin - Whether the current user is a project admin
 */
export const filterProjectVisibility = (
  items: MapObject[],
  visibilityMap: Record<string, boolean> | undefined,
  isProjectAdmin: boolean,
): MapObject[] => {
  const rawItems: MapObject[] = items || [];
  const hiddenProjectIds = new Set<string>();

  // If we have visibility from API, use it to flag hidden ids
  if (visibilityMap) {
    Object.entries(visibilityMap).forEach(([id, isPublic]) => {
      if (!isPublic) hiddenProjectIds.add(id);
    });
  }

  // Otherwise fall back to inline flags from the data
  if (!visibilityMap) {
    rawItems.forEach((item) => {
      if (
        (isProjectType(item) || hasProjectVisibilityFlag(item)) &&
        !isProjectPublic(item)
      ) {
        const rawId = getProjectId(item);
        if (rawId) {
          hiddenProjectIds.add(rawId);
        }
      }
    });
  }

  return rawItems.filter((item) => {
    if (isProjectType(item) || hasProjectVisibilityFlag(item)) {
      const pid = getProjectId(item);
      if (isProjectAdmin) return true;
      if (visibilityMap && pid && visibilityMap[pid] !== undefined) {
        return Boolean(visibilityMap[pid]);
      }
      return isProjectPublic(item);
    }

    const rawId = getProjectId(item);
    const idStr = rawId !== null ? rawId : '';

    let isHidden = false;
    hiddenProjectIds.forEach((projectId) => {
      if (
        idStr === `${projectId}_line` ||
        idStr.startsWith(`${projectId}_line`)
      ) {
        isHidden = true;
      }
    });
    if (isHidden) return false;

    return true;
  });
};

/**
 * Normalizes incoming map data by deduplicating items and handling project/line relationships
 */
export const normalizeIncomingMapData = (items: MapObject[]): MapObject[] => {
  const result: MapObject[] = [];
  const seen = new Set<string>();
  const positionIndex = new Map<string, number>();

  (items || []).forEach((item) => {
    const rawId = getProjectId(item);
    const idStr = rawId !== undefined && rawId !== null ? String(rawId) : '';
    const isLine = idStr.includes('_line');
    const normalizedId = isLine ? `${idStr.split('_line')[0]}_line` : idStr;
    const posCoords = item?.position?.coordinates;
    const posKey = Array.isArray(posCoords)
      ? `${posCoords[0].toFixed(6)},${posCoords[1].toFixed(6)}`
      : '';
    const isProjectLike = isProjectType(item) || hasProjectVisibilityFlag(item);
    const typeRaw = getProjectAttributeValue(item, 'type');
    const isProjectEntity = String(typeRaw || '').toLowerCase() === 'project';
    const key = normalizedId || posKey;
    if (key && seen.has(key)) return;
    if (key) seen.add(key);

    if (isProjectLike && posKey) {
      const existingIndex = positionIndex.get(posKey);
      if (existingIndex !== undefined) {
        const existing = result[existingIndex];
        const existingTypeRaw = getProjectAttributeValue(existing, 'type');
        const existingIsProject =
          String(existingTypeRaw || '').toLowerCase() === 'project';
        if (!existingIsProject && isProjectEntity) {
          result[existingIndex] = item;
        }
        return;
      }
      positionIndex.set(posKey, result.length);
    }

    result.push(item);
  });

  return result;
};
/**
 * Marker data type that can be passed to edit/delete handlers
 */
export type MarkerDataWithDetails = {
  details?: {
    id?: { value?: string | number } | string | number;
  };
  id?: { value?: string | number } | string | number;
};

/**
 * Project input data for normalization
 */
export type ProjectInput = {
  id?: string | number | undefined;
  details?: {
    id?: string | number | undefined;
  };
  title?: string | { value?: string };
  name?: string | { value?: string };
  location?: {
    coordinates?: [number, number];
    latitude?: number;
    longitude?: number;
  };
  position?: {
    coordinates?: [number, number];
  };
  line_locations?: Array<{
    latitude?: number;
    longitude?: number;
  }>;
  is_public?: boolean | number | string;
};

/**
 * Normalized project data for adding to local state
 */
export type NormalizedProject = {
  id: string | number | undefined;
  position: {
    coordinates: [number, number] | undefined;
  };
  type: string;
  name: { value: string } | string;
};

/**
 * Street entry for line/route visualization
 */
export type StreetEntry = {
  id: string;
  type: string;
  position: {
    type: string;
    coordinates: [number, number];
  };
  location: {
    type: string;
    value: {
      type: string;
      coordinates: [number, number][];
    };
    metadata: Record<string, unknown>;
  };
};

/**
 * Result of normalizing a newly created project
 */
export type NormalizedProjectResult = {
  normalized: NormalizedProject;
  streetEntries: StreetEntry[];
  shouldInclude: boolean;
};

/**
 * Extracts the project ID from marker data
 * @param markerData - Marker data object
 * @returns The project ID as a string, or null if not found
 */
export const extractProjectIdFromMarker = (
  markerData: MarkerDataWithDetails,
): string | null => {
  const tryGet = (idField: unknown): string | number | undefined => {
    if (idField == null) return undefined;
    if (typeof idField === 'object' && idField !== null && 'value' in idField) {
      const v = (idField as { value?: unknown }).value;
      return v as string | number | undefined;
    }
    return idField as string | number | undefined;
  };

  const rawId = tryGet(markerData?.details?.id) ?? tryGet(markerData?.id);
  return rawId ? String(rawId) : null;
};

/**
 * Fetches project data for editing
 * @param accessToken - Auth access token
 * @param markerData - Marker data containing project ID
 * @returns Project data or null if not found
 */
export const fetchProjectForEdit = async (
  accessToken: string | undefined,
  markerData: MarkerDataWithDetails,
): Promise<Record<string, unknown> | null> => {
  const { getProject } = await import('@/api/project-service');
  const projectId = extractProjectIdFromMarker(markerData);
  if (!projectId) {
    console.warn(
      'Edit requested but no project id found on marker',
      markerData,
    );
    return null;
  }

  try {
    const project = await getProject(accessToken, projectId);
    return project as Record<string, unknown>;
  } catch (err) {
    console.error('Failed to fetch project for edit', err);
    return null;
  }
};

/**
 * Deletes a project marker and returns the updated local data filter
 * @param accessToken - Auth access token
 * @param markerData - Marker data containing project ID
 * @returns A filter function to remove deleted items from local data, or null on failure
 */
export const deleteProjectMarker = async (
  accessToken: string | undefined,
  markerData: MarkerDataWithDetails,
): Promise<((prev: MapObject[]) => MapObject[]) | null> => {
  const { deleteProject } = await import('@/api/project-service');
  const projectId = extractProjectIdFromMarker(markerData);
  if (!projectId) {
    console.warn(
      'Delete requested but no project id found on marker',
      markerData,
    );
    return null;
  }

  try {
    await deleteProject(accessToken, projectId);

    // Return a filter function to remove deleted items
    return (prev: MapObject[]): MapObject[] =>
      (prev || []).filter((item: MapObject) => {
        const itemIdStr = getProjectId(item) ?? '';
        return (
          itemIdStr !== projectId &&
          itemIdStr !== `${projectId}_line` &&
          !itemIdStr.startsWith(`${projectId}_line`)
        );
      });
  } catch (err) {
    console.error('Failed to delete project', err);
    return null;
  }
};

/**
 * Normalizes a newly created project for adding to local data
 * @param project - The raw project data from the API
 * @param isProjectAdmin - Whether the user is a project admin
 * @returns Normalized project data with street entries
 */
export const normalizeCreatedProject = (
  project: ProjectInput,
  isProjectAdmin: boolean,
): NormalizedProjectResult => {
  const createdId = ((): string | number | undefined => {
    const idField = project?.id ?? project?.details?.id;
    if (idField == null) return undefined;
    if (typeof idField === 'object' && idField !== null && 'value' in idField) {
      return (idField as { value?: string | number }).value;
    }
    return idField as string | number | undefined;
  })();

  // Normalize position
  const loc = project?.location || {};
  const coords = Array.isArray(loc.coordinates)
    ? loc.coordinates
    : [
        loc.latitude ?? loc.latitude ?? undefined,
        loc.longitude ?? loc.longitude ?? undefined,
      ];
  const lat = Number(coords?.[0]);
  const lng = Number(coords?.[1]);
  const position = {
    coordinates:
      !Number.isNaN(lat) && !Number.isNaN(lng)
        ? ([lat, lng] as [number, number])
        : (project?.position?.coordinates as [number, number] | undefined),
  };

  const rawName = project?.title;
  const normalized: NormalizedProject = {
    id: createdId ?? project.id,
    position,
    type: 'Project',
    name: rawName ? { value: String(rawName) } : '',
  };

  const shouldInclude =
    isProjectAdmin || !isProjectType(normalized) || isProjectPublic(normalized);

  // Extract line coordinates for street entries
  const lineCoords = extractLineCoords(project);
  const lineId = createdId ? `${createdId}_line` : null;
  const streetEntries: StreetEntry[] =
    lineId && lineCoords.length >= 2
      ? lineCoords.map((coord: [number, number]) => ({
          id: lineId,
          type: 'Street',
          position: {
            type: 'Line',
            coordinates: coord,
          },
          location: {
            type: 'geo:json',
            value: {
              type: 'Line',
              coordinates: lineCoords,
            },
            metadata: {},
          },
        }))
      : [];

  return {
    normalized,
    streetEntries,
    shouldInclude,
  };
};

/**
 * Creates an updater function for local data after project creation
 * @param project - The newly created project
 * @param isProjectAdmin - Whether the user is a project admin
 * @returns A function to update local data state
 */
export const createProjectAddedUpdater = (
  project: ProjectInput,
  isProjectAdmin: boolean,
): ((prev: unknown[]) => unknown[]) => {
  const { normalized, streetEntries, shouldInclude } = normalizeCreatedProject(
    project,
    isProjectAdmin,
  );

  return (prev: unknown[]): unknown[] =>
    shouldInclude ? [...prev, normalized, ...streetEntries] : prev;
};
