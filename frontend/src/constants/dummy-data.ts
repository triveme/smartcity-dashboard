import { UtilizationComponent } from 'models/chart-types'
import { InterestingPlace, ParkingSpot, SwimmingInfo, SwimmingUtilizationModel } from 'models/data-types'

export const SWIMMING_DATA_SLIDER: SwimmingInfo[] = [
  {
    name: 'Schwimmoper',
    sensors: [
      {
        name: 'Bad',
        capacityMax: 100,
        capacityCurrent: 63,
      },
      {
        name: 'Sauna',
        capacityMax: 100,
        capacityCurrent: 12,
      },
      {
        name: 'Fitness',
        capacityMax: 100,
        capacityCurrent: 0,
      },
    ],
  },
  {
    name: 'Schwimmsportleistungszentrum',
    sensors: [
      {
        name: 'Bad',
        capacityMax: 100,
        capacityCurrent: 25,
      },
      {
        name: 'Sauna',
        capacityMax: 100,
        capacityCurrent: 51,
      },
      {
        name: 'Fitness',
        capacityMax: 100,
        capacityCurrent: 10,
      },
    ],
  },
  {
    name: 'Gartenhallenbad Cronenberg',
    sensors: [
      {
        name: 'Bad',
        capacityMax: 100,
        capacityCurrent: 48,
      },
      {
        name: 'Sauna',
        capacityMax: 100,
        capacityCurrent: 26,
      },
    ],
  },
  {
    name: 'Statbad Uellendahl',
    sensors: [
      {
        name: 'Bad',
        capacityMax: 100,
        capacityCurrent: 75,
      },
      {
        name: 'Sauna',
        capacityMax: 100,
        capacityCurrent: 15,
      },
    ],
  },
  {
    name: 'Gartenhallenbad Langerfeld',
    sensors: [
      {
        name: 'Bad',
        capacityMax: 100,
        capacityCurrent: 70,
      },
      {
        name: 'Sauna',
        capacityMax: 100,
        capacityCurrent: 6,
      },
    ],
  },
  {
    name: 'Freibad Mählersbeck',
    sensors: [
      {
        name: 'Bad',
        capacityMax: 100,
        capacityCurrent: 0,
      },
      {
        name: 'Sauna',
        capacityMax: 100,
        capacityCurrent: 0,
      },
    ],
  },
]

export const ZOO_UTILIZATION_DATA: UtilizationComponent = {
  interval: 'today',
  valuesDay: [10, 15, 20, 25, 52, 45, 48, 42, 78, 55, 0, 0, 0, 0, 0, 0, 0],
  dateDay: [
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
  ],
  valuesWeek: [30, 40, 50, 60, 70, 80, 90],
  dateWeek: ['3.8.', '4.8.', '5.8.', '6.8.', '7.8', '8.8.', '9.8'],
  valuesMonth: [
    25, 63, 90, 2, 11, 28, 44, 75, 56, 33, 82, 51, 17, 40, 69, 3, 22, 39, 59, 79, 16, 43, 67, 6, 27, 48, 80, 55, 37, 91,
  ],
  dateMonth: [
    '1.8.',
    '2.8.',
    '3.8.',
    '4.8.',
    '5.8.',
    '6.8.',
    '7.8.',
    '8.8.',
    '9.8.',
    '10.8.',
    '11.8.',
    '12.8.',
    '13.8.',
    '14.8.',
    '15.8.',
    '16.8.',
    '17.8.',
    '18.8.',
    '19.8.',
    '20.8.',
    '21.8.',
    '22.8.',
    '23.8.',
    '24.8.',
    '25.8.',
    '26.8.',
    '27.8.',
    '28.8.',
    '29.8.',
    '30.8.',
    '31.8.',
  ],
}

export const EMPTY_POI: InterestingPlace = {
  name: '',
  types: [],
  address: '',
  image: '',
  imagePreview: '',
  creator: '',
  location: {
    type: 'point',
    coordinates: [7.120197671, 51.1951799443],
  },
  info: '',
  zoomprio: '',
}

export const EMPTY_PARKING_SPOT: ParkingSpot = {
  id: 'urn:ngsi:ParkingSpot:ADDIX:0004A30B00E8CD31',
  type: 'ParkingSpot',
  address: {
    addressLocality: 'Kiel',
    postalCode: '24118',
    streetAddress: 'Schauenburgerstraße 116',
  },
  availableSpotNumber: 0,
  description: 'Libelium LSP-V2 Parkplatzsensor KITZ E-Säule 3',
  location: {
    type: 'Point',
    coordinates: [10.120266576, 54.334269361],
  },
  name: 'KITZ 08',
  occupancy: 1,
  occupiedSpotNumber: 1,
  status: 'occupied',
  totalSpotNumber: 1,
}

export const SWIMMING_DATA: SwimmingUtilizationModel[] = [
  {
    id: 'aff9fc4d-e389-4178-9b34-2b3646ddae32',
    name: 'Schwimmoper',
    zones: [
      {
        id: 'e32caa82-40f7-4d1d-aa4f-33b74db6834d',
        name: 'Sauna',
        capacityCurrent: 9,
        capacityMaximum: 40,
        occupancyRate: 0.225,
      },
      {
        id: '4387d99d-7854-461b-998a-d029e8698e69',
        name: 'Schwimmhalle',
        capacityCurrent: 132,
        capacityMaximum: 120,
        occupancyRate: 1.0,
      },
      {
        id: 'bca47966-8060-468c-8129-dde6068f7d54',
        name: 'Fitness',
        capacityCurrent: 0,
        capacityMaximum: 15,
        occupancyRate: 0.0,
      },
    ],
  },
  {
    id: '4bdc7ebe-9693-444a-9fc3-6dd3d09cd929',
    name: 'Langerfeld',
    zones: [
      {
        id: 'bddf615b-90ae-4187-b59f-af627350d4ea',
        name: 'Sauna',
        capacityCurrent: 9,
        capacityMaximum: 30,
        occupancyRate: 0.3,
      },
      {
        id: 'c460822a-7248-43b6-b1bd-c3cae90b6774',
        name: 'Schwimmhalle',
        capacityCurrent: 126,
        capacityMaximum: 70,
        occupancyRate: 1.0,
      },
    ],
  },
]
