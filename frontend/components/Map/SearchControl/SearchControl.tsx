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
import { Control, LeafletEvent } from 'leaflet';

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

function createProvider(): AbstractProvider {
  const providerName: string = (
    process.env.NEXT_PUBLIC_GEOCODER_PROVIDER || 'osm'
  ).toLowerCase();
  const apiKey: string | undefined = process.env.NEXT_PUBLIC_API_KEY;

  console.log(`Geocoding Provider: ${providerName}`);

  switch (providerName) {
    case 'google':
      if (apiKey) return new GoogleProvider({ apiKey });
    case 'bing':
      if (apiKey) return new BingProvider({ params: { key: apiKey } });
    case 'locationiq':
      if (apiKey) return new LocationIQProvider({ params: { key: apiKey } });
    case 'here':
      if (apiKey) return new HereProvider({ params: { apiKey } });
    case 'geoapify':
      if (apiKey) return new GeoapifyProvider({ params: { apiKey } });
    case 'pelias':
      if (apiKey) return new PeliasProvider({ params: { apiKey } });
    case 'esri':
      if (apiKey) return new EsriProvider();
    case 'osm':
    default:
      if (providerName != 'osm')
        console.warn(`"${providerName}" benötigt einen API Key`);
      return new OpenStreetMapProvider();
  }
}

export default function SearchControl({
  position = 'topleft',
  onResultSelect,
}: SearchControlProps): null {
  const map = useMap();
  const controlRef = useRef<Control | null>(null);
  const providerRef = useRef<AbstractProvider | null>(null);
  const onResultSelectRef =
    useRef<SearchControlProps['onResultSelect']>(onResultSelect);

  // Provider nur einmal erstellen
  if (!providerRef.current) {
    providerRef.current = createProvider();
  }

  useEffect(() => {
    if (!map || controlRef.current) return;

    const searchControl = GeoSearchControl({
      provider: providerRef.current,
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

    // Warte, bis Input-Element wirklich existiert
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
  }, [map]);

  return null;
}
