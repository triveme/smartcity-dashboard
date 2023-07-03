import { SliderComponent } from './chart-types'

export type ParkingInfo = {
  name: string
  maxHeight: number
  capacity: ParkingCapacity[]
  location: MarkerPosition
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

export type MarkerPosition = {
  latitude: number
  longitude: number
}

export type InterestingPlace = {
  name: string
  types: string[]
  address: string
  image: string
  creator: string
  location: MarkerPosition
  info: string
}

export type MapData = {
  name: string
  location: MarkerPosition
  image?: string
  creator?: string
  address?: string
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
