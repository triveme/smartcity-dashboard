import { ElementRef, useEffect, useRef, useState } from 'react';
import L, { latLngBounds } from 'leaflet';
import { useMap, Marker, Popup } from 'react-leaflet';
import { MapData } from 'models/data-types';
import colors from 'theme/colors';
import iconEbikeActive from '../../assets/images/marker/pin-ebike-active.png';
import iconEcarActive from '../../assets/images/marker/pin-ecar-active.png';
import iconParkingActive from '../../assets/images/marker/pin-parking-active.png';
import iconPoiActive from '../../assets/images/marker/pin-poi-active.png';
import iconSwimmingActive from '../../assets/images/marker/pin-swimming-active.png';
import iconWaterActive from '../../assets/images/marker/pin-water-active.png';
import iconZooActive from '../../assets/images/marker/pin-zoo-active.png';
import { Card, CardContent, CardMedia } from '@mui/material';
import { HeadlineYellow } from 'components/elements/font-types';
// import parkingImage from '../../assets/images/parking_image.png';
import { CopyrightElement } from 'components/elements/copyright-element';

type MapMoveToMarkerProps = {
  defaultIcon: any;
  iconType: string;
  markerData: MapData[];
  markerToDisplay? : (string | number)[];
}

export function MapMoveToMarker(props: MapMoveToMarkerProps) {
  const { defaultIcon, iconType, markerData, markerToDisplay } = props;
  const map = useMap()

  const [selectedMarker, setSelectedMarker] = useState<string|number|undefined>("");
  const [icon, setIcon] = useState(defaultIcon);
  const [zoomLevel, setZoomLevel] = useState(20);
  const markerRefs = useRef<ElementRef<typeof Marker>[]>([]);

  const ActiveIconChooser = () => {
    switch (iconType) {
      case "bikes":
        return iconEbikeActive;
      case "cars":
        return iconEcarActive;
      case "parking":
        return iconParkingActive;
      case "pois":
        return iconPoiActive;
      case "swimming":
        return iconSwimmingActive;
      case "water":
        return iconWaterActive;
      case "zoo":
        return iconZooActive;
      default:
        return icon;
    }
  }

  useEffect(() => {
    // Calculate Map Position
    let markerBounds = latLngBounds([]);
    if (markerData !== undefined && markerData.length > 0) {
        //Center on single element
        if (markerData.length === 1) {
          map.flyTo({lat: markerData[0].location.latitude, lng: markerData[0].location.longitude}, zoomLevel, { duration: 1 });
        //Position and zoom map to display all markers
        } else {
          markerData.forEach(marker => {
            markerBounds.extend([marker.location.latitude, marker.location.longitude])
          })
          map.fitBounds(markerBounds)
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markerData]);

  useEffect(() => {
    if (markerToDisplay){
      if(markerToDisplay[1] !== 0) {
        let parts = String(markerToDisplay[0]).split("-");
        let index = Number(parts[parts.length - 1]);
        handleMarkerClick(String(markerToDisplay[0]), Number(markerToDisplay[1]), Number(markerToDisplay[2]), index)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markerToDisplay]);

  
  const handleMarkerClick = (markerId: string, lat: number, lng: number, index: number) => {
    const latOffset = +lat + 0.004;
    if (selectedMarker === markerId) {
      setSelectedMarker('');
      if (markerRefs.current[index] && markerRefs.current[index].getPopup() !== undefined) {
        markerRefs.current[index].closePopup();
      }
    } else {
      setSelectedMarker(markerId)
      setIcon(
        L.icon({
          iconUrl: ActiveIconChooser(),
          iconSize: [94, 100],
          iconAnchor: [45, 70],
          shadowSize: [41, 41],
          shadowAnchor: [35, 60],
          popupAnchor: [0, -44],
        })
      );
      if (markerRefs.current[index] && markerRefs.current[index].getPopup() !== undefined) {
        markerRefs.current[index].openPopup();
      }
      map.flyTo([latOffset, lng], 14, { duration: 1 })
    }
  }

  return (
    <>
      {markerData !== undefined && markerData.length > 0 ?
        markerData.map((info, index) => {
          let markerId = `Marker-${info.location.latitude}-${info.location.longitude}-${index}`
          return (
            <Marker
              eventHandlers={{
                click: () => {
                  handleMarkerClick(
                    markerId,
                    info.location.latitude,
                    info.location.longitude,
                    index
                  )
                },
              }}
              ref={ref => markerRefs.current[index] = ref!}
              key={markerId}
              position={{
                lat: info.location.latitude,
                lng: info.location.longitude,
              }}
              icon={selectedMarker === markerId ? icon : defaultIcon}
            >
              <Popup
                className={'map-marker-popup'}
                closeButton={false}
                closeOnEscapeKey={false}
              >
                <Card
                  sx={{
                    maxWidth: {xs:200, md:250},
                    minWidth: {xs:200, md:250},
                    border: 2,
                    borderColor: colors.iconColor,
                  }}
                >
                  <CardMedia
                    sx={{ height: {xs:80, md:120}, position: "relative" }}
                    image={(info.image && info.image !== "none") ? info.image : ''}
                    title={info.creator !== null ? `${info.name} - ${info.creator}` : `POI Bild: ${info.name}`}
                  >
                  </CardMedia>
                  {info.creator && <CopyrightElement  creator={info.creator}/>}
                  <CardContent
                    sx={{
                      p: {
                        xs:"8px !important",
                        md:"12px !important"
                      }
                    }}
                  >
                    <HeadlineYellow text={info.name}/>
                    <p>
                      {info.address}
                    </p>
                  </CardContent>
                </Card>
              </Popup>
            </Marker>
          )
        })
      : null}
    </>
  )
}
