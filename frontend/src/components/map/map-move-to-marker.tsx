import { ElementRef, useEffect, useRef, useState } from 'react'
import L, { latLngBounds } from 'leaflet'
import { useMap, Marker } from 'react-leaflet'
import { MapData } from 'models/data-types'

type MapMoveToMarkerProps = {
  defaultIcon: any
  iconType: string
  markerData: MapData[]
}

export function MapMoveToMarker(props: MapMoveToMarkerProps) {
  const { defaultIcon, iconType, markerData } = props
  const map = useMap()
  const [zoomLevel] = useState(20)
  const markerRefs = useRef<ElementRef<typeof Marker>[]>([])

  // Center map position
  useEffect(() => {
    let markerBounds = latLngBounds([])
    if (markerData !== undefined && markerData.length > 0) {
      //Center on single element
      if (markerData.length === 1) {
        map.flyTo(
          { lat: markerData[0].location.coordinates[1], lng: markerData[0].location.coordinates[0] },
          zoomLevel,
          {
            duration: 1,
          },
        )
        //Position and zoom map to display all markers
      } else {
        markerData.forEach((marker) => {
          markerBounds.extend([marker.location.coordinates[1], marker.location.coordinates[0]])
        })
        map.fitBounds(markerBounds)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markerData])

  return (
    <>
      {markerData !== undefined && markerData.length > 0
        ? markerData.map((info, index) => {
            let markerId = `Marker-${info.location.coordinates[0]}-${info.location.coordinates[1]}-${index}`
            return (
              <Marker
                ref={(ref) => (markerRefs.current[index] = ref!)}
                key={markerId}
                position={{
                  lat: info.location.coordinates[1],
                  lng: info.location.coordinates[0],
                }}
                icon={
                  iconType === 'parking'
                    ? L.divIcon({
                        className: info.status === 'free' ? 'available-marker' : 'occupied-marker',
                        iconAnchor: [30, 10],
                      })
                    : defaultIcon
                }
              />
            )
          })
        : null}
    </>
  )
}
