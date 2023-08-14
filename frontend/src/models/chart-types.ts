import { ParkingInfo } from './data-types'

export type RadialComponent = {
  name: string
  icon: string
  minValue: number
  maxValue: number
  currentValue: number
  unit: string
}

export type SliderComponent = {
  name: string
  capacityMax: number
  capacityCurrent: number
  parkingInfo?: ParkingInfo
}

export type UtilizationComponent = {
  interval: string
  valuesDay: number[]
  dateDay: string[]
  valuesWeek: number[]
  dateWeek: string[]
  valuesMonth: number[]
  dateMonth: string[]
}
