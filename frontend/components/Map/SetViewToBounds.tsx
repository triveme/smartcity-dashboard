import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

export default function SetViewToBounds({
  markerPositions,
  centerPosition,
  initialZoom,
}: {
  markerPositions: { position: [number, number]; title: string }[];
  centerPosition: [number, number];
  initialZoom?: number;
}): null {
  const map = useMap();
  const hasInitializedView = useRef(false);

  useEffect(() => {
    if (hasInitializedView.current || markerPositions.length === 0) {
      return;
    }

    const bounds = L.latLngBounds(
      markerPositions.map(({ position }) => position),
    );
    bounds.extend(centerPosition); // Extend bounds to include the center position

    if (markerPositions.length === 1 && initialZoom !== undefined) {
      map.setView(bounds.getCenter(), initialZoom);
      hasInitializedView.current = true;
      return;
    }

    map.fitBounds(
      bounds,
      initialZoom !== undefined ? { maxZoom: initialZoom } : undefined,
    );
    hasInitializedView.current = true;
  }, [centerPosition, initialZoom, map, markerPositions]);

  return null;
}
