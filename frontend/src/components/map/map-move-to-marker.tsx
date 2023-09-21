import { ElementRef, useEffect, useRef } from 'react'
import L, { latLngBounds } from 'leaflet'
import { useMap, Marker, Popup } from 'react-leaflet'
import { MapData } from 'models/data-types'
import { Card, CardMedia, CardContent } from '@mui/material'
import { CopyrightElement } from 'components/elements/copyright-element'
import { HeadlineYellow } from 'components/elements/font-types'
import colors from 'theme/colors'
import { roundDecimalPlaces } from 'utils/math-helper'

type MapMoveToMarkerProps = {
  defaultIcon: any
  iconType: string
  markerData: MapData[]
  allowPopup: boolean
  zoomLevel: number
  rotate: boolean
}

export function MapMoveToMarker(props: MapMoveToMarkerProps) {
  const { defaultIcon, iconType, markerData, allowPopup, zoomLevel, rotate } = props
  const map = useMap()
  const markerRefs = useRef<ElementRef<typeof Marker>[]>([])

  // Center map position
  useEffect(() => {
    let markerBounds = latLngBounds([])
    if (markerData !== undefined && markerData.length > 0) {
      //Center on single element
      if (markerData.length === 1) {
        map.flyTo(
          { lat: markerData[0].location.coordinates[0], lng: markerData[0].location.coordinates[1] },
          zoomLevel,
          {
            duration: 1,
          },
        )
        //Position and zoom map to display all markers
      } else {
        markerData.forEach((marker) => {
          markerBounds.extend([marker.location.coordinates[0], marker.location.coordinates[1]])
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
                  lat: info.location.coordinates[0],
                  lng: info.location.coordinates[1],
                }}
                icon={
                  iconType === 'parking'
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
                    : L.divIcon({
                        className: 'flood-marker',
                        iconAnchor: [0, 0],
                      })
                }
              >
                {allowPopup ? (
                  <Popup className={'map-marker-popup'} closeButton={false} closeOnEscapeKey={false}>
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
                          image={info.image && info.image !== 'none' ? info.image : ''}
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
                        {info.description ? <p>Beschreibung: {info.description}</p> : null}
                        {info.location ? <p>Longitude: {info.location.coordinates[1]}</p> : null}
                        {info.location ? <p>Latitude: {info.location.coordinates[0]}</p> : null}
                        {info.currentLevel && info.referenceLevel ? (
                          <p>
                            Wasserstand Relativ:{' '}
                            {roundDecimalPlaces((info.currentLevel / info.referenceLevel) * 100, 2)}%
                          </p>
                        ) : null}
                        {info.currentLevel ? <p>Wasserstand Absolut: {info.currentLevel}</p> : null}
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
