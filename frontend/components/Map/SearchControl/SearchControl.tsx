'use client';
import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import {
  GeoSearchControl,
  OpenStreetMapProvider,
  GoogleProvider,
  BingProvider,
  EsriProvider,
  GeoapifyProvider,
  HereProvider,
  LocationIQProvider,
  PeliasProvider,
} from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import './SearchControl.css';
import AbstractProvider from 'leaflet-geosearch/dist/providers/provider.js';
import L, { Control, LeafletEvent, Map as LeafletMap } from 'leaflet';

type SearchControlProps = {
  position?: 'topleft' | 'topright' | 'bottomleft' | 'bottomright';
  onResultSelect?: (
    result: { position: L.LatLngLiteral; label: string } | null,
  ) => void;
};

interface LeafletGeoSearchEvent extends LeafletEvent {
  location?: {
    x: number;
    y: number;
    label: string;
  };
}

type SearchResultItem = {
  x: number;
  y: number;
  label: string;
};

type ProviderDetails = {
  provider: AbstractProvider;
  providerName: string;
};

type SearchProvider = {
  search: (options: { query: string }) => Promise<SearchResultItem[]>;
};

type QueryParams = Record<string, string | number | boolean>;

type GoogleBoundsLiteral = {
  north: number;
  south: number;
  east: number;
  west: number;
};

function createProvider(): ProviderDetails {
  const providerName: string = (
    process.env.NEXT_PUBLIC_GEOCODER_PROVIDER || 'osm'
  ).toLowerCase();
  const apiKey: string | undefined = process.env.NEXT_PUBLIC_API_KEY;

  console.log(`Geocoding Provider: ${providerName}`);

  switch (providerName) {
    case 'google':
      if (apiKey) {
        return { provider: new GoogleProvider({ apiKey }), providerName };
      }
      break;
    case 'bing':
      if (apiKey) {
        return {
          provider: new BingProvider({ params: { key: apiKey } }),
          providerName,
        };
      }
      break;
    case 'locationiq':
      if (apiKey) {
        return {
          provider: new LocationIQProvider({ params: { key: apiKey } }),
          providerName,
        };
      }
      break;
    case 'here':
      if (apiKey) {
        return {
          provider: new HereProvider({ params: { apiKey } }),
          providerName,
        };
      }
      break;
    case 'geoapify':
      if (apiKey) {
        return {
          provider: new GeoapifyProvider({ params: { apiKey } }),
          providerName,
        };
      }
      break;
    case 'pelias':
      if (apiKey) {
        return {
          provider: new PeliasProvider({ params: { apiKey } }),
          providerName,
        };
      }
      break;
    case 'esri':
      if (apiKey) {
        return { provider: new EsriProvider(), providerName };
      }
      break;
    case 'osm':
      return { provider: new OpenStreetMapProvider(), providerName: 'osm' };
    default:
      break;
  }

  if (providerName !== 'osm') {
    console.warn(`"${providerName}" benötigt einen API Key`);
  }

  return { provider: new OpenStreetMapProvider(), providerName: 'osm' };
}

function buildOsmViewportQuery(
  map: LeafletMap,
  query: string,
): Record<string, string> {
  const bounds = map.getBounds();

  return {
    q: query,
    viewbox: [
      bounds.getWest(),
      bounds.getNorth(),
      bounds.getEast(),
      bounds.getSouth(),
    ].join(','),
    bounded: '1',
    limit: '10',
  };
}

function buildCenterPoint(map: LeafletMap): L.LatLng {
  return map.getCenter();
}

function buildViewportBounds(map: LeafletMap): L.LatLngBounds {
  return map.getBounds();
}

function buildGoogleBounds(map: LeafletMap): GoogleBoundsLiteral {
  const bounds = buildViewportBounds(map);

  return {
    north: bounds.getNorth(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    west: bounds.getWest(),
  };
}

function buildBingViewport(map: LeafletMap): string {
  const bounds = buildViewportBounds(map);
  return [
    bounds.getSouth(),
    bounds.getWest(),
    bounds.getNorth(),
    bounds.getEast(),
  ].join(',');
}

function buildEsriSearchExtent(map: LeafletMap): string {
  const bounds = buildViewportBounds(map);
  return [
    bounds.getWest(),
    bounds.getSouth(),
    bounds.getEast(),
    bounds.getNorth(),
  ].join(',');
}

function buildGeoapifyRectBias(map: LeafletMap): string {
  const bounds = buildViewportBounds(map);
  return `rect:${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
}

function buildBiasedQuery(
  providerName: string,
  map: LeafletMap,
  query: string,
): QueryParams | null {
  const center = buildCenterPoint(map);

  switch (providerName) {
    case 'osm':
    case 'locationiq':
      return buildOsmViewportQuery(map, query);
    case 'bing':
      return {
        q: query,
        userLocation: `${center.lat},${center.lng}`,
        userMapView: buildBingViewport(map),
      };
    case 'esri':
      return {
        text: query,
        location: `${center.lng},${center.lat}`,
        searchExtent: buildEsriSearchExtent(map),
      };
    case 'geoapify':
      return {
        text: query,
        bias: buildGeoapifyRectBias(map),
      };
    case 'here':
      return {
        q: query,
        at: `${center.lat},${center.lng}`,
      };
    case 'pelias':
      return {
        text: query,
        'focus.point.lat': center.lat,
        'focus.point.lon': center.lng,
      };
    default:
      return null;
  }
}

async function searchProviderWithQuery(
  provider: AbstractProvider,
  query: QueryParams,
): Promise<SearchResultItem[]> {
  const response = await fetch(
    provider.endpoint({
      query,
    } as never),
  );
  const data = await response.json();
  return provider.parse({ data } as never) as SearchResultItem[];
}

async function searchWithFallback(
  primarySearch: () => Promise<SearchResultItem[]>,
  fallbackSearch: () => Promise<SearchResultItem[]>,
): Promise<SearchResultItem[]> {
  const primaryResults = await primarySearch();

  if (primaryResults.length > 0) {
    return primaryResults;
  }

  return fallbackSearch();
}

async function searchProviderWithQueryFallback(
  provider: AbstractProvider,
  primaryQuery: QueryParams,
  fallbackQuery: string,
): Promise<SearchResultItem[]> {
  return searchWithFallback(
    () => searchProviderWithQuery(provider, primaryQuery),
    async () =>
      (await provider.search({
        query: fallbackQuery,
      })) as SearchResultItem[],
  );
}

async function loadJsonp<T>(url: string, callbackName: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const callbackWindow = window as unknown as Record<string, unknown>;
    const cleanup = (): void => {
      script.remove();
      delete callbackWindow[callbackName];
    };

    callbackWindow[callbackName] = (payload: T): void => {
      cleanup();
      resolve(payload);
    };

    script.src = url;
    script.async = true;
    script.onerror = (): void => {
      cleanup();
      reject(new Error(`JSONP request failed: ${url}`));
    };

    document.body.appendChild(script);
  });
}

async function searchGoogleProviderWithBias(
  provider: GoogleProvider,
  map: LeafletMap,
  query: string,
): Promise<SearchResultItem[]> {
  const geocoder = provider.geocoder || (await provider.loader);
  if (!geocoder) {
    throw new Error(
      'GoogleMaps GeoCoder is not loaded. Are you trying to run this server side?',
    );
  }

  const response = await geocoder.geocode({
    address: query,
    bounds: buildGoogleBounds(map),
  });

  return provider.parse({ data: response } as never) as SearchResultItem[];
}

async function searchGoogleProviderWithBiasFallback(
  provider: GoogleProvider,
  map: LeafletMap,
  query: string,
): Promise<SearchResultItem[]> {
  return searchWithFallback(
    () => searchGoogleProviderWithBias(provider, map, query),
    async () =>
      (await provider.search({
        query,
      })) as SearchResultItem[],
  );
}

async function searchBingProviderWithBias(
  provider: BingProvider,
  map: LeafletMap,
  query: string,
): Promise<SearchResultItem[]> {
  const jsonp = `BING_JSONP_CB_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}`;
  const data = await loadJsonp(
    provider.endpoint({
      query: buildBiasedQuery('bing', map, query)!,
      jsonp,
    } as never),
    jsonp,
  );

  return provider.parse({ data } as never) as SearchResultItem[];
}

async function searchBingProviderWithBiasFallback(
  provider: BingProvider,
  map: LeafletMap,
  query: string,
): Promise<SearchResultItem[]> {
  return searchWithFallback(
    () => searchBingProviderWithBias(provider, map, query),
    async () =>
      (await provider.search({
        query,
      })) as SearchResultItem[],
  );
}

function sortResultsByDistance<T extends SearchResultItem>(
  results: T[],
  map: LeafletMap,
): T[] {
  const center = map.getCenter();

  return [...results].sort((left, right) => {
    const leftDistance = map.distance(center, L.latLng(left.y, left.x));
    const rightDistance = map.distance(center, L.latLng(right.y, right.x));
    return leftDistance - rightDistance;
  });
}

function createBiasedProvider(
  baseProvider: AbstractProvider,
  providerName: string,
  map: LeafletMap,
): SearchProvider {
  return {
    async search({ query }: { query: string }): Promise<SearchResultItem[]> {
      const trimmedQuery = query.trim();
      if (!trimmedQuery) {
        return [];
      }

      let results: SearchResultItem[];

      if (providerName === 'google' && baseProvider instanceof GoogleProvider) {
        results = await searchGoogleProviderWithBiasFallback(
          baseProvider,
          map,
          trimmedQuery,
        );
      } else if (
        providerName === 'bing' &&
        baseProvider instanceof BingProvider
      ) {
        results = await searchBingProviderWithBiasFallback(
          baseProvider,
          map,
          trimmedQuery,
        );
      } else {
        const biasedQuery = buildBiasedQuery(providerName, map, trimmedQuery);
        if (biasedQuery) {
          results = await searchProviderWithQueryFallback(
            baseProvider,
            biasedQuery,
            trimmedQuery,
          );
        } else {
          results = (await baseProvider.search({
            query: trimmedQuery,
          })) as SearchResultItem[];
        }
      }

      return sortResultsByDistance(results, map);
    },
  };
}

export default function SearchControl({
  position = 'topleft',
  onResultSelect,
}: SearchControlProps): null {
  const map = useMap();
  const controlRef = useRef<Control | null>(null);
  const providerDetailsRef = useRef<ProviderDetails | null>(null);
  const providerRef = useRef<SearchProvider | null>(null);
  const onResultSelectRef =
    useRef<SearchControlProps['onResultSelect']>(onResultSelect);

  if (!providerDetailsRef.current) {
    providerDetailsRef.current = createProvider();
  }

  if (!providerRef.current && providerDetailsRef.current) {
    providerRef.current = createBiasedProvider(
      providerDetailsRef.current.provider,
      providerDetailsRef.current.providerName,
      map,
    );
  }

  useEffect(() => {
    onResultSelectRef.current = onResultSelect;
  }, [onResultSelect]);

  useEffect(() => {
    if (!map || controlRef.current || !providerRef.current) return;

    const searchControl = GeoSearchControl({
      provider: providerRef.current as never,
      style: 'bar',
      showPopup: false,
      showMarker: false,
      retainZoomLevel: true,
      animateZoom: true,
      autoClose: true,
      keepResult: true,
      searchLabel: 'Adresse suchen...',
      position,
    });

    map.addControl(searchControl);
    controlRef.current = searchControl;

    const handleShowLocation = (e: LeafletGeoSearchEvent): void => {
      const { location } = e;
      if (location && onResultSelectRef.current) {
        onResultSelectRef.current({
          position: { lat: location.y, lng: location.x },
          label: location.label,
        });
      }
    };
    map.on('geosearch/showlocation', handleShowLocation);

    const waitForInput = (): void => {
      const inputEl = document.querySelector(
        '.leaflet-control-geosearch input',
      ) as HTMLInputElement | null;
      const clearBtn = document.querySelector(
        '.leaflet-control-geosearch button',
      ) as HTMLInputElement | null;

      const handleClear = (): void => {
        onResultSelectRef.current?.(null);
      };

      inputEl?.addEventListener('input', () => {
        if (inputEl.value.trim() === '') handleClear();
      });

      clearBtn?.addEventListener('click', handleClear);
    };

    waitForInput();

    return () => {
      if (controlRef.current) {
        map.removeControl(controlRef.current);
        controlRef.current = null;
      }
      map.off('geosearch/showlocation', handleShowLocation);
    };
  }, [map, position]);

  return null;
}
