import L from 'leaflet'
import { MapContainer, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './map-control.css'
import { MapData } from 'models/data-types'
import icon from '../../assets/images/marker/map-pin.png'
import iconEbike from '../../assets/images/marker/pin-ebike.png'
import iconEcar from '../../assets/images/marker/pin-ecar.png'
import iconParking from '../../assets/images/marker/pin-parking.png'
import iconPoi from '../../assets/images/marker/pin-poi.png'
import iconSwimming from '../../assets/images/marker/pin-swimming.png'
import iconWater from '../../assets/images/marker/pin-water.png'
import iconZooActive from '../../assets/images/marker/pin-zoo-active.png'
import { MapMoveToMarker } from './map-move-to-marker'

type MapComponentProps = {
  iconType: string
  mapData: MapData[]
  markerToDisplay?: (string | number)[]
}

export function MapComponent(props: MapComponentProps) {
  const { iconType, mapData, markerToDisplay } = props

  const defaultLocation = {
    latitude: 50.57455669751585,
    longitude: 9.706126750761428,
  }

  // const bounds = new LatLngBounds([
  //   [51.43865214506609, 6.777741881509436],
  //   [51.10557297544067, 7.646565643152505]
  // ]);

  const IconChooser = () => {
    switch (iconType) {
      case 'bikes':
        return iconEbike
      case 'cars':
        return iconEcar
      case 'parking':
        return iconParking
      case 'pois':
        return iconPoi
      case 'swimming':
        return iconSwimming
      case 'water':
        return iconWater
      case 'zoo':
        return iconZooActive
      default:
        return icon
    }
  }

  let DefaultIcon = L.icon({
    iconSize: [74, 80],
    iconAnchor: [35, 60],
    shadowSize: [41, 41],
    shadowAnchor: [35, 60],
    popupAnchor: [2, -40],
    iconUrl: IconChooser(),
  })

  return (
    <MapContainer
      key={'MapContainer-'}
      style={{ height: '100%', width: '100%' }}
      center={
        mapData[0]
          ? [mapData[0].location.latitude, mapData[0].location.longitude]
          : [defaultLocation.latitude, defaultLocation.longitude]
      }
      // maxBounds={bounds}
      zoom={14}
      minZoom={10}
      scrollWheelZoom={true}
      fadeAnimation={true}
      zoomAnimation={true}
      closePopupOnClick={false}
      doubleClickZoom={false}
    >
      <MapMoveToMarker
        defaultIcon={DefaultIcon}
        iconType={iconType}
        markerData={mapData}
        markerToDisplay={markerToDisplay}
      />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
    </MapContainer>
  )
}
