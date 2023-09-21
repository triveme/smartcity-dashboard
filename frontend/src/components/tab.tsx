import { ApexOptions } from 'apexcharts'
import { MapComponentOptions } from 'models/data-types'

export type TabComponent = {
  _id: string
  type: string
  name: string
  uid: string
  donutToTotalLabel?: boolean
  text?: string
  apexType?: string
  apexOptions?: ApexOptions
  apexSeries?: Array<any>
  apexMaxValue?: number
  apexMaxAlias?: string
  apexMaxColor?: string
  apexStepline?: boolean
  componentType: string
  componentData: Array<any>
  componentDataType: string
  componentName: string
  componentDescription: string
  componentIcon: string
  componentMinimum: number
  componentMaximum: number
  componentWarning: number
  componentAlarm: number
  componentUnit: string
  componentValue: number
  componentOptions: MapComponentOptions
  timeframe?: number
  fiwareService?: string
  fiwareType?: string
  entityId?: string[]
  filterProperty: string
  filterAttribute: string
  filterValues: string[]
  attribute?: {
    keys: string[]
    aliases: string[]
  }
  values?: number[]
  decimals?: number
  attributeType?: string
  aggrMode?: string
  queryData?: {
    id?: string
  }
  queryUpdateMsg?: String
}
