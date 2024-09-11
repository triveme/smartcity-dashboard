import { useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

export default function SetViewToBounds({
  markerPositions,
  centerPosition,
}: {
  markerPositions: { position: [number, number]; title: string }[];
  centerPosition: [number, number];
}): null {
  const map = useMap();

  useEffect(() => {
    if (markerPositions.length > 0) {
      const bounds = L.latLngBounds(
        markerPositions.map(({ position }) => position),
      );
      bounds.extend(centerPosition); // Extend bounds to include the center position

      map.fitBounds(bounds);
    }
  }, [map]); // this effect will only run once when the component mounts

  return null;
}
