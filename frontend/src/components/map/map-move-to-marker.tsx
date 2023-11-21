import { ElementRef, useEffect, useRef, useState } from 'react'
import L, { latLngBounds } from 'leaflet'
import { useMap, Marker, Popup, useMapEvents } from 'react-leaflet'
import { MapData } from 'models/data-types'
import { Card, CardMedia, CardContent } from '@mui/material'
import { CopyrightElement } from 'components/elements/copyright-element'
import { HeadlineYellow } from 'components/elements/font-types'
import colors from 'theme/colors'
import activeIconPoi from '../../assets/images/marker/pin-poi-active.png'

type MapMoveToMarkerProps = {
  defaultIcon: any
  iconType: string
  markerData: MapData[]
  allowPopup: boolean
  zoomLevel: number
  rotate: boolean
  zoomLocation: number[]
  handlePoiClick?: (index: number) => void
}

let activeIcon = L.icon({
  iconSize: [74, 80],
  iconAnchor: [35, 60],
  shadowSize: [41, 41],
  shadowAnchor: [35, 60],
  popupAnchor: [2, -40],
  iconUrl: activeIconPoi,
})

export function MapMoveToMarker(props: MapMoveToMarkerProps) {
  const { defaultIcon, iconType, markerData, allowPopup, zoomLevel, rotate, zoomLocation, handlePoiClick } = props
  const map = useMap()
  const markerRefs = useRef<ElementRef<typeof Marker>[]>([])
  const [activeMarkerIndex, setActiveMarkerIndex] = useState<number | null>(null)

  // Center map position
  useEffect(() => {
    let markerBounds = latLngBounds([])
    if (markerData !== undefined && markerData.length > 0) {
      //Center on single element
      if (markerData.length <= 1) {
        map.flyTo(
          { lat: markerData[0].location.coordinates[0], lng: markerData[0].location.coordinates[1] },
          zoomLevel,
          {
            duration: 1,
          },
        )
        // Position and zoom map to display all markers
      } else {
        markerData.forEach((marker) => {
          markerBounds.extend([marker.location.coordinates[0], marker.location.coordinates[1]])
        })
        map.fitBounds(markerBounds)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markerData])

  useEffect(() => {
    if (zoomLocation && zoomLocation.length === 2) {
      map.flyTo({ lat: zoomLocation[1], lng: zoomLocation[0] }, zoomLevel, {
        duration: 1,
      })
    }
  }, [map, zoomLevel, zoomLocation])

  const handleClick = (index: number) => {
    if (activeMarkerIndex === index) {
      setActiveMarkerIndex(null)
    } else {
      if (handlePoiClick) {
        handlePoiClick(index)
      }
      setActiveMarkerIndex(index)
    }
  }

  const handleMapClick = () => {
    setActiveMarkerIndex(null)
  }

  useMapEvents({
    click: handleMapClick,
  })

  return (
    <>
      {markerData !== undefined && markerData.length > 0
        ? markerData.map((info, index) => {
            let markerId = `Marker-${info.location.coordinates[0]}-${info.location.coordinates[1]}-${index}`
            const isActive = index === activeMarkerIndex // Check if this marker is active
            return (
              <Marker
                ref={(ref) => (markerRefs.current[index] = ref!)}
                key={markerId}
                position={[info.location.coordinates[0], info.location.coordinates[1]]}
                icon={
                  isActive
                    ? activeIcon
                    : iconType === 'parking'
                    ? L.divIcon({
                        className:
                          info.status === 'free'
                            ? rotate
                              ? 'available-marker-rotate'
                              : 'available-marker'
                            : rotate
                            ? 'occupied-marker-rotate'
                            : 'occupied-marker',
                        iconAnchor: [30, 10],
                      })
                    : defaultIcon
                }
                eventHandlers={{
                  click: () => handleClick(index),
                }}
              >
                {allowPopup ? (
                  <Popup className={'map-marker-popup'} closeButton={false} closeOnEscapeKey={true}>
                    <Card
                      sx={{
                        maxWidth: { xs: 200, md: 250 },
                        minWidth: { xs: 200, md: 250 },
                        border: 2,
                        borderColor: colors.iconColor,
                      }}
                    >
                      {info.image && info.image !== 'none' ? (
                        <CardMedia
                          sx={{ height: { xs: 80, md: 120 }, position: 'relative' }}
                          image={
                            info.imagePreview
                              ? info.imagePreview
                              : info.image && info.image !== 'none'
                              ? info.image
                              : ''
                          }
                          title={info.creator !== null ? `${info.name} - ${info.creator}` : `POI Bild: ${info.name}`}
                        />
                      ) : null}
                      {info.creator && <CopyrightElement creator={info.creator} />}
                      <CardContent
                        sx={{
                          p: {
                            xs: '8px !important',
                            md: '12px !important',
                          },
                        }}
                      >
                        <HeadlineYellow text={info.name} />
                        <p>{info.address}</p>
                      </CardContent>
                    </Card>
                  </Popup>
                ) : null}
              </Marker>
            )
          })
        : null}
    </>
  )
}
