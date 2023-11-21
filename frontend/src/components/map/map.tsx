import L from 'leaflet'
import { MapContainer, WMSTileLayer } from 'react-leaflet'
// import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './map-control.css'
import { MapComponentOptions, MapData } from 'models/data-types'
import iconPoi from '../../assets/images/marker/pin-poi.png'
import { MapMoveToMarker } from './map-move-to-marker'
import { useEffect, useState } from 'react'

type MapComponentProps = {
  iconType: string
  mapData: MapData[]
  mapOptions?: MapComponentOptions
  zoomLocation?: number[]
  handlePoiClick?: (index: number) => void
}

export function MapComponent(props: MapComponentProps) {
  const { iconType, mapData, mapOptions, zoomLocation, handlePoiClick } = props
  const [mapCenter, setMapCenter] = useState<L.LatLngExpression>({
    lat: 50.57456353068457,
    lng: 9.706118343343359,
  })
  const [mapZoom, setMapZoom] = useState(15)

  useEffect(() => {
    setMapZoom(mapOptions?.zoom ? mapOptions!.zoom : 13)
  }, [mapZoom, mapOptions])

  useEffect(() => {
    if (mapData && mapData.length > 0) {
      setMapCenter({ lat: mapData[0].location.coordinates[0], lng: mapData[0].location.coordinates[1] })
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
      style={{ height: '100%', width: '100%', zIndex: 0 }}
      center={mapCenter}
      zoom={mapZoom}
      minZoom={mapOptions?.minZoom ? mapOptions!.minZoom : 10}
      maxZoom={mapOptions?.maxZoom ? mapOptions!.maxZoom : 20}
      fadeAnimation={true}
      closePopupOnClick={true}
      dragging={mapOptions?.allowScroll ? mapOptions!.allowScroll : false}
      zoomControl={mapOptions?.allowZoom ? mapOptions!.allowZoom : false}
      scrollWheelZoom={mapOptions?.allowZoom ? mapOptions!.allowZoom : false}
      touchZoom={mapOptions?.allowZoom ? mapOptions!.allowZoom : false}
      doubleClickZoom={mapOptions?.allowZoom ? mapOptions!.allowZoom : false}
      zoomAnimation={false}
    >
      {/* <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      /> */}
      <MapMoveToMarker
        defaultIcon={DefaultIcon}
        iconType={iconType}
        markerData={mapData}
        allowPopup={mapOptions?.allowPopups ? mapOptions!.allowPopups : false}
        zoomLevel={mapZoom}
        rotate={mapOptions?.occupancyRotate ? mapOptions!.occupancyRotate : false}
        zoomLocation={zoomLocation ? zoomLocation : []}
        handlePoiClick={handlePoiClick ? handlePoiClick : undefined}
      />
      <WMSTileLayer
        layers='spw2_light'
        className='night'
        version='1.3.0'
        url={'https://geodaten.metropoleruhr.de/spw2'}
        maxNativeZoom={19}
        maxZoom={mapOptions?.maxZoom ? mapOptions!.maxZoom : 20}
      />
    </MapContainer>
  )
}
