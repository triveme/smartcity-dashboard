import { RadialComponent, UtilizationComponent } from 'models/chart-types'
import {
  InterestingPlace,
  LocationType,
  ParkingInfo,
  ParkingSpot,
  SwimmingInfo,
  SwimmingUtilizationModel,
} from 'models/data-types'

export const WEATHER_DATA_RADIAL: RadialComponent[] = [
  {
    name: 'Temperatur',
    icon: 'IconTemperature',
    minValue: -40,
    maxValue: 40,
    currentValue: 22,
    unit: '°C',
  },
  {
    name: 'Windstärke',
    icon: 'IconWind',
    minValue: 0,
    maxValue: 12,
    currentValue: 4.6,
    unit: 'km/h',
  },
  {
    name: 'Luftfeuchte',
    icon: 'IconDroplet',
    minValue: 0,
    maxValue: 100,
    currentValue: 76,
    unit: '%',
  },
  {
    name: 'Luftdruck',
    icon: 'IconDashboard',
    minValue: 850,
    maxValue: 1050,
    currentValue: 1014,
    unit: 'hPa',
  },
  {
    name: 'UV-Index',
    icon: 'IconSun',
    minValue: 0,
    maxValue: 11,
    currentValue: 4,
    unit: '',
  },
]

export const PARKING_DATA_SLIDER: ParkingInfo[] = [
  {
    name: 'Rathaus Galerie',
    maxHeight: 2.1,
    location: {
      type: 'point',
      coordinates: [51.26044056122102, 7.147158001187522],
    },
    capacity: [
      {
        capacityType: 'Kapazität',
        capacitySpace: 317,
      },
      {
        capacityType: 'Barrierefrei',
        capacitySpace: 5,
      },
      {
        capacityType: 'Frauen',
        capacitySpace: 50,
      },
    ],
    maxValue: 317,
    currentlyUsed: 100,
    type: 'Tiefgarage',
  },
  {
    name: 'Kleine Klotzbahn',
    maxHeight: 4.0,
    location: {
      type: 'point',
      coordinates: [51.25851251639441, 7.144072052992271],
    },
    capacity: [
      {
        capacityType: 'Kapazität',
        capacitySpace: 91,
      },
    ],
    maxValue: 91,
    currentlyUsed: 22,
    type: 'Tiefgarage',
  },
  {
    name: 'Stadthalle',
    maxHeight: 1.9,
    location: {
      type: 'point',
      coordinates: [51.25327156701705, 7.142151500396632],
    },
    capacity: [
      {
        capacityType: 'Kapazität',
        capacitySpace: 124,
      },
      {
        capacityType: 'Barrierefrei',
        capacitySpace: 2,
      },
      {
        capacityType: 'Frauen',
        capacitySpace: 9,
      },
    ],
    maxValue: 124,
    currentlyUsed: 111,
    type: 'Tiefgarage',
  },
  {
    name: 'Karlsplatz',
    maxHeight: 2.2,
    location: {
      type: 'point',
      coordinates: [51.26063497274156, 7.145835432073219],
    },
    capacity: [
      {
        capacityType: 'Kapazität',
        capacitySpace: 255,
      },
      {
        capacityType: 'Barrierefrei',
        capacitySpace: 6,
      },
      {
        capacityType: 'Familien',
        capacitySpace: 12,
      },
      {
        capacityType: 'Frauen',
        capacitySpace: 35,
      },
    ],
    maxValue: 255,
    currentlyUsed: 0,
    type: 'Tiefgarage',
  },
  {
    name: 'Ohligsmühle',
    maxHeight: 2.4,
    location: {
      type: 'point',
      coordinates: [51.25500378356171, 7.143474231311426],
    },
    capacity: [
      {
        capacityType: 'Kapazität',
        capacitySpace: 127,
      },
      {
        capacityType: 'Barrierefrei',
        capacitySpace: 8,
      },
    ],
    maxValue: 127,
    currentlyUsed: 127,
    type: 'Tiefgarage',
  },
]

export const PARKING_LOCATIONS: LocationType[] = [
  {
    type: 'point',
    coordinates: [51.26044056122102, 7.147158001187522],
  },
  {
    type: 'point',
    coordinates: [51.25851251639441, 7.144072052992271],
  },
  {
    type: 'point',
    coordinates: [51.25327156701705, 7.142151500396632],
  },
  {
    type: 'point',
    coordinates: [51.26063497274156, 7.145835432073219],
  },
  {
    type: 'point',
    coordinates: [51.25500378356171, 7.143474231311426],
  },
]

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

export const SWIMMING_LOCATIONS: LocationType[] = [
  {
    type: 'point',
    coordinates: [51.253229410701024, 7.1406070945760165],
  },
  {
    type: 'point',
    coordinates: [51.229909187755794, 7.140263079583519],
  },
  {
    type: 'point',
    coordinates: [51.2050600730376, 7.138313738394663],
  },
  {
    type: 'point',
    coordinates: [51.283327908105704, 7.156590184420973],
  },
  {
    type: 'point',
    coordinates: [51.27337099206417, 7.248797828598606],
  },
  {
    type: 'point',
    coordinates: [51.292927645420455, 7.23201099976308],
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

export const ZOO_LOCATIONS: LocationType[] = [
  {
    type: 'point',
    coordinates: [51.24105292197138, 7.109721440050628],
  },
]

export const CAR_LOCATIONS: LocationType[] = [
  {
    type: 'point',
    coordinates: [51.2320437349, 7.2553009251],
  },
  {
    type: 'point',
    coordinates: [51.3092673431, 7.2069645674],
  },
  {
    type: 'point',
    coordinates: [51.2723886985, 7.1880699845],
  },
  {
    type: 'point',
    coordinates: [51.2772299704, 7.1513606544],
  },
  {
    type: 'point',
    coordinates: [51.2571366092, 7.1901737402],
  },
  {
    type: 'point',
    coordinates: [51.2677692739, 7.1926831184],
  },
  {
    type: 'point',
    coordinates: [51.2668603616, 7.1289047633],
  },
  {
    type: 'point',
    coordinates: [51.2057701826, 7.2470899245],
  },
  {
    type: 'point',
    coordinates: [51.275785308, 7.1515791946],
  },
]
export const BIKE_LOCATIONS: LocationType[] = [
  {
    type: 'point',
    coordinates: [51.2793837029, 7.0690246678],
  },
  {
    type: 'point',
    coordinates: [51.2319117551, 7.1321197254],
  },
  {
    type: 'point',
    coordinates: [51.2065613835, 7.1061097587],
  },
  {
    type: 'point',
    coordinates: [51.2578063703, 7.151395057],
  },
  {
    type: 'point',
    coordinates: [51.2322929999, 7.2495310325],
  },
  {
    type: 'point',
    coordinates: [51.3114059836, 7.1876553212],
  },
  {
    type: 'point',
    coordinates: [51.2450084008, 7.1121208231],
  },
]

export const POI_LOCATIONS: LocationType[] = [
  {
    type: 'point',
    coordinates: [51.1951799443, 7.1660282304],
  },
  {
    type: 'point',
    coordinates: [51.2627176015, 7.1598161469],
  },
  {
    type: 'point',
    coordinates: [51.2825168533, 7.1842586409],
  },
  {
    type: 'point',
    coordinates: [51.2592450201, 7.1063508018],
  },
  {
    type: 'point',
    coordinates: [51.2579281092, 7.1250042768],
  },
]
export const POI_DATA: InterestingPlace[] = [
  {
    name: 'Kaltenbachtal',
    types: ['Grünanlagen und Wälder'],
    address: {
      addressLocality: 'Wuppertal',
      streetAddress: '',
      postalCode: '',
    },
    image: 'http://www.fotokraemer-wuppertal.de/images/POI-Stadt%20Wuppertal-001-001.jpg',
    creator: 'Artist 1',
    location: {
      type: 'point',
      coordinates: [51.1951799443, 7.120197671],
    },
    info: '',
  },
  {
    name: 'Bismarckturm',
    types: ['Gebäude und Bauwerke', 'Sehenswürdigkeiten'],
    address: {
      addressLocality: 'Wuppertal',
      streetAddress: 'Reichsallee 3',
      postalCode: '42285',
    },
    image: 'http://www.fotokraemer-wuppertal.de/images/POI-Stadt%20Wuppertal-001-006.jpg',
    creator: 'Artist 1',
    location: {
      type: 'point',
      coordinates: [51.2627176015, 7.1660282304],
    },
    info: '',
  },
  {
    name: 'Zentrum Röttgen',
    types: ['Jugend- und Kindertreffs'],
    address: {
      addressLocality: 'Wuppertal',
      streetAddress: 'Röttgen 102a',
      postalCode: '42109',
    },
    image: 'none',
    creator: '',
    location: {
      type: 'point',
      coordinates: [51.2825168533, 7.1598161469],
    },
    info: '',
  },
  {
    name: 'Inline-/ Skateboardanlage Barmen',
    types: ['Freizeitsportangebote'],
    address: {
      addressLocality: 'Wuppertal',
      streetAddress: 'Schluchtstraße',
      postalCode: '42285',
    },
    image: 'http://www.fotokraemer-wuppertal.de/images/POI-Stadt%20Wuppertal-001-005.jpg',
    creator: 'Artist 2',
    location: {
      type: 'point',
      coordinates: [51.2592450201, 7.1842586409],
    },
    info: '',
  },
  {
    name: 'Sportcenter Eskesberg',
    types: ['Freizeitsportangebote'],
    address: {
      addressLocality: 'Wuppertal',
      streetAddress: 'Am Eskesberg 5',
      postalCode: '42115',
    },
    image: 'none',
    creator: '',
    location: {
      type: 'point',
      coordinates: [51.2579281092, 7.1063508018],
    },
    info: '',
  },
  {
    name: 'Jakobstreppe',
    types: ['Gebäude und Bauwerke', 'Sehenswürdigkeiten'],
    address: {
      addressLocality: 'Wuppertal',
      streetAddress: 'Jakobstreppe',
      postalCode: '42115',
    },
    image: 'http://www.fotokraemer-wuppertal.de/images/POI-Stadt%20Wuppertal-001-004.jpg',
    creator: 'Artist 3',
    location: {
      type: 'point',
      coordinates: [51.2501771092, 7.1250042768],
    },
    info: '',
  },
]

export const PARKING_SPOTS: any[] = [
  {
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
  },
  {
    id: 'urn:ngsi:ParkingSpot:ADDIX:0004A30B00E891B5',
    type: 'ParkingSpot',
    address: {
      addressLocality: 'Kiel',
      postalCode: '24118',
      streetAddress: 'Schauenburgerstraße 116',
    },
    availableSpotNumber: 1,
    description: 'Libelium LSP-V2 Parkplatzsensor KITZ E-Säule 4',
    location: {
      type: 'Point',
      coordinates: [10.120251141, 54.334242503],
    },
    name: 'KITZ 09',
    occupancy: 0,
    occupiedSpotNumber: 0,
    status: 'free',
    totalSpotNumber: 1,
  },
]

export const EMPTY_POI: InterestingPlace = {
  name: '',
  types: [],
  address: {
    addressLocality: '',
    postalCode: '',
    streetAddress: '',
  },
  image: '',
  creator: '',
  location: {
    type: 'point',
    coordinates: [7.120197671, 51.1951799443],
  },
  info: '',
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
