import L from 'leaflet'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './map-control.css'
import { MapData } from 'models/data-types'
import iconPoi from '../../assets/images/marker/pin-poi.png'
import { MapMoveToMarker } from './map-move-to-marker'
import { useEffect, useState } from 'react'

type MapComponentProps = {
  iconType: string
  mapData: MapData[]
}

export function MapComponent(props: MapComponentProps) {
  const { iconType, mapData } = props
  const [mapCenter, setMapCenter] = useState<L.LatLngExpression>({
    lat: 50.57456353068457,
    lng: 9.706118343343359,
  })

  useEffect(() => {
    if (mapData && mapData.length > 0) {
      setMapCenter({ lat: mapData[0].location.coordinates[1], lng: mapData[0].location.coordinates[0] })
    }
  }, [mapData])

  let DefaultIcon = L.icon({
    iconSize: [74, 80],
    iconAnchor: [35, 60],
    shadowSize: [41, 41],
    shadowAnchor: [35, 60],
    popupAnchor: [2, -40],
    iconUrl: iconPoi,
  })

  return (
    <MapContainer
      key={'MapContainer-'}
      style={{ height: '100%', width: '100%' }}
      center={mapCenter}
      zoom={20}
      minZoom={20}
      maxZoom={20}
      scrollWheelZoom={true}
      fadeAnimation={true}
      zoomAnimation={true}
      closePopupOnClick={false}
      doubleClickZoom={false}
    >
      <MapMoveToMarker defaultIcon={DefaultIcon} iconType={iconType} markerData={mapData} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
        maxNativeZoom={19}
        maxZoom={20}
      />
    </MapContainer>
  )
}
