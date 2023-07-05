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
  address: string
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
  address?: string
  available?: boolean
  status?: string
  occupancy?: number
}

export type ParkingSpot = {
  id: string
  type: string
  address: string
  availableSpotNumber: number
  description: string
  location: LocationType
  name: string
  occupancy: number
  occupiedSpotNumber: number
  status: string
  totalSpotNumber: number
}

export type ParkingSpotAddress = {
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
