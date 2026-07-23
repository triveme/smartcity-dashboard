import { useEffect } from 'react';
import L from 'leaflet';
import { useMap } from 'react-leaflet';

type CustomMapViewportProps = {
  bounds: L.LatLngBoundsExpression;
  zoomOffset: number;
  minZoomOffset: number;
  maxZoomOffset: number;
  onZoomChange?: (zoom: number) => void;
};

export default function CustomMapViewport({
  bounds,
  zoomOffset,
  minZoomOffset,
  maxZoomOffset,
  onZoomChange,
}: CustomMapViewportProps): null {
  const map = useMap();

  useEffect(() => {
    const handleZoomEnd = (): void => {
      onZoomChange?.(map.getZoom());
    };

    handleZoomEnd();
    map.on('zoomend', handleZoomEnd);

    return () => {
      map.off('zoomend', handleZoomEnd);
    };
  }, [map, onZoomChange]);

  useEffect(() => {
    const leafletBounds =
      bounds instanceof L.LatLngBounds
        ? bounds
        : L.latLngBounds(bounds[0], bounds[1]);
    const fitZoom = map.getBoundsZoom(leafletBounds);
    const nextMinZoom = fitZoom + minZoomOffset;
    const nextMaxZoom = fitZoom + maxZoomOffset;
    const resolvedMinZoom = Math.min(nextMinZoom, nextMaxZoom);
    const resolvedMaxZoom = Math.max(nextMinZoom, nextMaxZoom);
    const resolvedZoom = Math.min(
      Math.max(fitZoom + zoomOffset, resolvedMinZoom),
      resolvedMaxZoom,
    );

    map.setMinZoom(resolvedMinZoom);
    map.setMaxZoom(resolvedMaxZoom);
    map.setView(leafletBounds.getCenter(), resolvedZoom, { animate: false });
  }, [bounds, map, maxZoomOffset, minZoomOffset, zoomOffset]);

  return null;
}
