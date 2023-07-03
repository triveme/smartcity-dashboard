import { RadialComponent, UtilizationComponent } from 'models/chart-types'
import { InterestingPlace, MarkerPosition, ParkingInfo, SwimmingInfo } from 'models/data-types'

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
      latitude: 51.26044056122102,
      longitude: 7.147158001187522,
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
      latitude: 51.25851251639441,
      longitude: 7.144072052992271,
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
      latitude: 51.25327156701705,
      longitude: 7.142151500396632,
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
      latitude: 51.26063497274156,
      longitude: 7.145835432073219,
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
      latitude: 51.25500378356171,
      longitude: 7.143474231311426,
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

export const PARKING_LOCATIONS: MarkerPosition[] = [
  {
    latitude: 51.26044056122102,
    longitude: 7.147158001187522,
  },
  {
    latitude: 51.25851251639441,
    longitude: 7.144072052992271,
  },
  {
    latitude: 51.25327156701705,
    longitude: 7.142151500396632,
  },
  {
    latitude: 51.26063497274156,
    longitude: 7.145835432073219,
  },
  {
    latitude: 51.25500378356171,
    longitude: 7.143474231311426,
  },
]

export const SWIMMING_DATA_SLIDER: SwimmingInfo[] = [
  {
    name: 'Schwimmoper',
    sensors: [
      {
        name: 'Bad',
        maxValue: 100,
        currentlyUsed: 63,
      },
      {
        name: 'Sauna',
        maxValue: 100,
        currentlyUsed: 12,
      },
      {
        name: 'Fitness',
        maxValue: 100,
        currentlyUsed: 0,
      },
    ],
  },
  {
    name: 'Schwimmsportleistungszentrum',
    sensors: [
      {
        name: 'Bad',
        maxValue: 100,
        currentlyUsed: 25,
      },
      {
        name: 'Sauna',
        maxValue: 100,
        currentlyUsed: 51,
      },
      {
        name: 'Fitness',
        maxValue: 100,
        currentlyUsed: 10,
      },
    ],
  },
  {
    name: 'Gartenhallenbad Cronenberg',
    sensors: [
      {
        name: 'Bad',
        maxValue: 100,
        currentlyUsed: 48,
      },
      {
        name: 'Sauna',
        maxValue: 100,
        currentlyUsed: 26,
      },
    ],
  },
  {
    name: 'Statbad Uellendahl',
    sensors: [
      {
        name: 'Bad',
        maxValue: 100,
        currentlyUsed: 75,
      },
      {
        name: 'Sauna',
        maxValue: 100,
        currentlyUsed: 15,
      },
    ],
  },
  {
    name: 'Gartenhallenbad Langerfeld',
    sensors: [
      {
        name: 'Bad',
        maxValue: 100,
        currentlyUsed: 70,
      },
      {
        name: 'Sauna',
        maxValue: 100,
        currentlyUsed: 6,
      },
    ],
  },
  {
    name: 'Freibad Mählersbeck',
    sensors: [
      {
        name: 'Bad',
        maxValue: 100,
        currentlyUsed: 0,
      },
      {
        name: 'Sauna',
        maxValue: 100,
        currentlyUsed: 0,
      },
    ],
  },
]

export const SWIMMING_LOCATIONS: MarkerPosition[] = [
  {
    latitude: 51.253229410701024,
    longitude: 7.1406070945760165,
  },
  {
    latitude: 51.229909187755794,
    longitude: 7.140263079583519,
  },
  {
    latitude: 51.2050600730376,
    longitude: 7.138313738394663,
  },
  {
    latitude: 51.283327908105704,
    longitude: 7.156590184420973,
  },
  {
    latitude: 51.27337099206417,
    longitude: 7.248797828598606,
  },
  {
    latitude: 51.292927645420455,
    longitude: 7.23201099976308,
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

export const ZOO_LOCATIONS: MarkerPosition[] = [
  {
    latitude: 51.24105292197138,
    longitude: 7.109721440050628,
  },
]

export const CAR_LOCATIONS: MarkerPosition[] = [
  {
    longitude: 7.0688478208,
    latitude: 51.2320437349,
  },
  {
    longitude: 7.2553009251,
    latitude: 51.3092673431,
  },
  {
    longitude: 7.2069645674,
    latitude: 51.2723886985,
  },
  {
    longitude: 7.1880699845,
    latitude: 51.2772299704,
  },
  {
    longitude: 7.1513606544,
    latitude: 51.2571366092,
  },
  {
    longitude: 7.1901737402,
    latitude: 51.2677692739,
  },
  {
    longitude: 7.1926831184,
    latitude: 51.2668603616,
  },
  {
    longitude: 7.1289047633,
    latitude: 51.2057701826,
  },
  {
    longitude: 7.2470899245,
    latitude: 51.275785308,
  },
  {
    longitude: 7.1515791946,
    latitude: 51.2586663721,
  },
]

export const BIKE_LOCATIONS: MarkerPosition[] = [
  {
    longitude: 7.2239740729,
    latitude: 51.2793837029,
  },
  {
    longitude: 7.0690246678,
    latitude: 51.2319117551,
  },
  {
    longitude: 7.1321197254,
    latitude: 51.2065613835,
  },
  {
    longitude: 7.1061097587,
    latitude: 51.2578063703,
  },
  {
    longitude: 7.151395057,
    latitude: 51.2322929999,
  },
  {
    longitude: 7.2495310325,
    latitude: 51.3114059836,
  },
  {
    longitude: 7.1876553212,
    latitude: 51.2450084008,
  },
  {
    longitude: 7.1121208231,
    latitude: 51.1913497542,
  },
]

export const POI_LOCATIONS: MarkerPosition[] = [
  {
    longitude: 7.120197671,
    latitude: 51.1951799443,
  },
  {
    longitude: 7.1660282304,
    latitude: 51.2627176015,
  },
  {
    longitude: 7.1598161469,
    latitude: 51.2825168533,
  },
  {
    longitude: 7.1842586409,
    latitude: 51.2592450201,
  },
  {
    longitude: 7.1063508018,
    latitude: 51.2579281092,
  },
  {
    longitude: 7.1250042768,
    latitude: 51.2501771092,
  },
]

export const POI_DATA: InterestingPlace[] = [
  {
    name: 'Kaltenbachtal',
    types: ['Grünanlagen und Wälder'],
    address: 'Wuppertal',
    image: 'http://www.fotokraemer-wuppertal.de/images/POI-Stadt%20Wuppertal-001-001.jpg',
    creator: 'Artist 1',
    location: {
      longitude: 7.120197671,
      latitude: 51.1951799443,
    },
    info: '',
  },
  {
    name: 'Bismarckturm',
    types: ['Gebäude und Bauwerke', 'Sehenswürdigkeiten'],
    address: 'Reichsallee 3, 42285 Wuppertal',
    image: 'http://www.fotokraemer-wuppertal.de/images/POI-Stadt%20Wuppertal-001-006.jpg',
    creator: 'Artist 1',
    location: {
      longitude: 7.1660282304,
      latitude: 51.2627176015,
    },
    info: '',
  },
  {
    name: 'Zentrum Röttgen',
    types: ['Jugend- und Kindertreffs'],
    address: 'Röttgen 102a, 42109 Wuppertal',
    image: 'none',
    creator: '',
    location: {
      longitude: 7.1598161469,
      latitude: 51.2825168533,
    },
    info: '',
  },
  {
    name: 'Inline-/ Skateboardanlage Barmen',
    types: ['Freizeitsportangebote'],
    address: 'Schluchtstraße, 42285 Wuppertal',
    image: 'http://www.fotokraemer-wuppertal.de/images/POI-Stadt%20Wuppertal-001-005.jpg',
    creator: 'Artist 2',
    location: {
      longitude: 7.1842586409,
      latitude: 51.2592450201,
    },
    info: '',
  },
  {
    name: 'Sportcenter Eskesberg',
    types: ['Freizeitsportangebote'],
    address: 'Am Eskesberg 5, 42115 Wuppertal',
    image: 'none',
    creator: '',
    location: {
      longitude: 7.1063508018,
      latitude: 51.2579281092,
    },
    info: '',
  },
  {
    name: 'Jakobstreppe',
    types: ['Gebäude und Bauwerke', 'Sehenswürdigkeiten'],
    address: 'Jakobstreppe, 42115 Wuppertal',
    image: 'http://www.fotokraemer-wuppertal.de/images/POI-Stadt%20Wuppertal-001-004.jpg',
    creator: 'Artist 3',
    location: {
      longitude: 7.1250042768,
      latitude: 51.2501771092,
    },
    info: '',
  },
]
