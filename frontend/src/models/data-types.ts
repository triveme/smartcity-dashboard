import { SliderComponent } from './chart-types'

export type ParkingInfo = {
  name: string
  maxHeight: number
  capacity: ParkingCapacity[]
  location: LocationType
  currentlyUsed: number
  maxValue: number
  type: string
  address?: ParkingAdress
}

type ParkingAdress = {
  id: string
  street: string
  streetnumber: string
  zipcode: string
  city: string
  breitengrad: number
  laengengrad: number
  breitengradDisplayInternational: string
  laengengradDisplayInternational: string
  breitengradDisplay: string
  laengengradDisplay: string
}

export type ParkingCapacity = {
  capacityType: string
  capacitySpace: number
}

export type SwimmingInfo = {
  name: string
  sensors: SliderComponent[]
}

export type InterestingPlace = {
  name: string
  types: string[]
  address: AddressModel
  image: string
  creator: string
  location: LocationType
  info: string
}

export type MapData = {
  name: string
  location: LocationType
  image?: string
  creator?: string
  address?: AddressModel
  available?: boolean
  status?: string
  occupancy?: number
}

export type ParkingSpot = {
  id: string
  type: string
  address: AddressModel
  availableSpotNumber: number
  description: string
  location: LocationType
  name: string
  occupancy: number
  occupiedSpotNumber: number
  status: string
  totalSpotNumber: number
}

export type EvChargingStation = {
  id: string
  type: string
  socketType: string[]
  capacity: number
  name: string
  allowedVehicleType: string[]
  source: string
  location: LocationType
  chargeType: string[]
  address: AddressModel
  operator: string
  contactPoint: string
}

export type AddressModel = {
  addressLocality: string
  postalCode: string
  streetAddress: string
}

export type LocationType = {
  type: string
  coordinates: number[]
}

export type MeasurementModel = {
  dayValue: number
  weekValues: number[]
  weekDates: string[]
  monthValues: number[]
  monthDates: string[]
  warningValue: number
  alarmValue: number
}

export type MapComponentOptions = {
  zoom: number
  minZoom: number
  maxZoom: number
  allowPopups: boolean
  allowZoom: boolean
  allowScroll: boolean
  iconType: string
  occupancyRotate: boolean
}

export type SwimmingUtilizationModel = {
  id: string
  name: string
  zones: SwimmingZone[]
}

export type SwimmingZone = {
  id: string
  name: string
  capacityCurrent: number
  capacityMaximum: number
  occupancyRate: number
}
