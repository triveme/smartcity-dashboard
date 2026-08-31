import { ReactElement } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { SizeProp } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowRightFromBracket,
  faBars,
  faCircleNodes,
  faEye,
  faEyeSlash,
  faGear,
  faHouse,
  faKey,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faChevronUp,
  faExclamationCircle,
  faPen,
  faPlusCircle,
  faShapes,
  faSpinner,
  faTrashCan,
  faUser,
  faUpDownLeftRight,
  faUpRightFromSquare,
  faArrowUpShortWide,
  faArrowDownWideShort,
  faCircleXmark,
  faLocationDot,
  faCloud,
  faCar,
  faBus,
  faGlobe,
  faTree,
  faWifi,
  faBicycle,
  faCompass,
  faEarthAmericas,
  faSun,
  faLandmark,
  faChartSimple,
  faGauge,
  faBuilding,
  faWater,
  faHotel,
  faLeaf,
  faSeedling,
  faTrain,
  faTemperatureHalf,
  faRoad,
  faWind,
  faSolarPanel,
  faIndustry,
  faTableList,
  faTableCells,
  faLocationArrow,
  faLocationCrosshairs,
  faFan,
  faBatteryHalf,
  faRotateLeft,
  faRotateRight,
  faCircle,
  faArrowTrendDown,
  faCloudArrowUp,
  faClone,
  faFont,
  faCopy,
  faFloppyDisk,
  faImage,
  faEnvelope,
  faDownload,
  faCogs,
  faDatabase,
  faCircleInfo,
  faLink,
  faPaperPlane,
  faBusSimple,
  faPersonSwimming,
  faWaterLadder,
  faRecycle,
  faPersonDigging,
  faRoadBarrier,
  faDumpster,
  faCalendar,
  faCalendarDays,
  faCapsules,
  faStaffSnake,
  faPrescriptionBottleMedical,
  faKitMedical,
  faUserDoctor,
  faBriefcaseMedical,
  faHospital,
  faInfo,
  faBridgeWater,
  faTruck,
  faTrafficLight,
  faSquareParking,
  faChargingStation,
  faTaxi,
  faBolt,
  faGasPump,
  faFire,
  faSnowflake,
  faSchool,
  faChurch,
  faWarehouse,
  faLock,
  faChartLine,
  faChartColumn,
  faChartPie,
  faWheelchair,
  faStore,
  faFireExtinguisher,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';

export const AvailableIcons = [
  'empty',
  'Logout',
  'ChevronDown',
  'ChevronLeft',
  'ChevronRight',
  'ChevronUp',
  'Eye',
  'EyeSlash',
  'Gear',
  'File',
  'House',
  'Key',
  'Menu',
  'Pen',
  'Trashcan',
  'Arrows',
  'Building',
  'Hotel',
  'Landmark',
  'Industry',
  'LocationDot',
  'Car',
  'Bus',
  'Bicycle',
  'Train',
  'Gauge',
  'Road',
  'Globe',
  'EarthAmericas',
  'Cloud',
  'Wind',
  'Fan',
  'Tree',
  'Leaf',
  'Seedling',
  'Sun',
  'Water',
  'Wifi',
  'ChartSimple',
  'SolarPanel',
  'TableList',
  'TableCells',
  'Compass',
  'TemperatureHalf',
  'LocationArrow',
  'LocationCrosshairs',
  'BatteryHalf',
  'Revert',
  'Circle',
  'ArrowTrendDown',
  'CloudArrowUp',
  'Image',
  'Envelope',
  'Download',
  'Cogs',
  'Attention',
  'Info',
  'Link',
  'PaperPlane',
  'BusSimple',
  'PersonSwimming',
  'WaterLadder',
  'Recycle',
  'PersonDigging',
  'RoadBarrier',
  'Dumpster',
  'Calendar',
  'CalendarDays',
  'Capsules',
  'StaffSnake',
  'PrescriptionBottleMedical',
  'KitMedical',
  'UserDoctor',
  'BriefcaseMedical',
  'Hospital',
  'InfoPlain',
  'BridgeWater',
  'Truck',
  'TrafficLight',
  'SquareParking',
  'ChargingStation',
  'Taxi',
  'Bolt',
  'GasPump',
  'Fire',
  'Snowflake',
  'School',
  'Church',
  'Warehouse',
  'Lock',
  'ChartLine',
  'ChartColumn',
  'ChartPie',
  'Wheelchair',
  'Store',
  'FireExtinguisher',
  'XMark',
];

type FontAwesomeIconsProps = {
  iconName: string;
  color: string;
  className?: string;
  size?: SizeProp;
};
export default function FontAwesomeIcons(
  props: FontAwesomeIconsProps,
): ReactElement {
  const { iconName, color, className, size } = props;

  switch (iconName) {
    case 'empty':
      return <div></div>;
    case 'Logout':
      return (
        <FontAwesomeIcon
          icon={faArrowRightFromBracket}
          color={color}
          size={size}
        />
      );
    case 'ChevronDown':
      return (
        <FontAwesomeIcon
          icon={faChevronDown}
          color={color}
          size={size}
          className={className}
        />
      );
    case 'ChevronLeft':
      return <FontAwesomeIcon icon={faChevronLeft} color={color} size={size} />;
    case 'ChevronRight':
      return (
        <FontAwesomeIcon icon={faChevronRight} color={color} size={size} />
      );
    case 'ChevronUp':
      return (
        <FontAwesomeIcon
          icon={faChevronUp}
          color={color}
          size={size}
          className={className}
        />
      );
    case 'CircleNodes':
      return <FontAwesomeIcon icon={faCircleNodes} color={color} size={size} />;
    case 'Eye':
      return <FontAwesomeIcon icon={faEye} color={color} size={size} />;
    case 'EyeSlash':
      return <FontAwesomeIcon icon={faEyeSlash} color={color} size={size} />;
    case 'File':
      return <FontAwesomeIcon icon={faFile} color={color} size={size} />;
    case 'Copy':
      return <FontAwesomeIcon icon={faCopy} color={color} size={size} />;
    case 'Gear':
      return <FontAwesomeIcon icon={faGear} color={color} size={size} />;
    case 'House':
      return <FontAwesomeIcon icon={faHouse} color={color} size={size} />;
    case 'Key':
      return <FontAwesomeIcon icon={faKey} color={color} size={size} />;
    case 'Menu':
      return <FontAwesomeIcon icon={faBars} color={color} size={size} />;
    case 'Pen':
      return <FontAwesomeIcon icon={faPen} color={color} size={size} />;
    case 'Plus':
      return <FontAwesomeIcon icon={faPlusCircle} color={color} size={size} />;
    case 'Shapes':
      return <FontAwesomeIcon icon={faShapes} color={color} size={size} />;
    case 'Spinner':
      return (
        <FontAwesomeIcon
          icon={faSpinner}
          color={color}
          size={size}
          spin
          className={className}
        />
      );
    case 'Trashcan':
      return <FontAwesomeIcon icon={faTrashCan} color={color} size={size} />;
    case 'User':
      return <FontAwesomeIcon icon={faUser} color={color} size={size} />;
    case 'Open':
      return (
        <FontAwesomeIcon icon={faUpRightFromSquare} color={color} size={size} />
      );
    case 'Arrows':
      return (
        <FontAwesomeIcon icon={faUpDownLeftRight} color={color} size={size} />
      );
    case 'ArrowUp':
      return (
        <FontAwesomeIcon icon={faArrowUpShortWide} color={color} size={size} />
      );
    case 'ArrowDown':
      return (
        <FontAwesomeIcon
          icon={faArrowDownWideShort}
          color={color}
          size={size}
        />
      );
    case 'XMark':
      return <FontAwesomeIcon icon={faCircleXmark} color={color} size={size} />;
    case 'Attention':
      return (
        <FontAwesomeIcon icon={faExclamationCircle} color={color} size={size} />
      );
    case 'Building':
      return <FontAwesomeIcon icon={faBuilding} color={color} size={size} />;
    case 'Hotel':
      return <FontAwesomeIcon icon={faHotel} color={color} size={size} />;
    case 'Landmark':
      return <FontAwesomeIcon icon={faLandmark} color={color} size={size} />;
    case 'Industry':
      return <FontAwesomeIcon icon={faIndustry} color={color} size={size} />;
    case 'LocationDot':
      return <FontAwesomeIcon icon={faLocationDot} color={color} size={size} />;
    case 'Car':
      return <FontAwesomeIcon icon={faCar} color={color} size={size} />;
    case 'Bus':
      return <FontAwesomeIcon icon={faBus} color={color} size={size} />;
    case 'Bicycle':
      return <FontAwesomeIcon icon={faBicycle} color={color} size={size} />;
    case 'Train':
      return <FontAwesomeIcon icon={faTrain} color={color} size={size} />;
    case 'Gauge':
      return <FontAwesomeIcon icon={faGauge} color={color} size={size} />;
    case 'Road':
      return <FontAwesomeIcon icon={faRoad} color={color} size={size} />;
    case 'Globe':
      return <FontAwesomeIcon icon={faGlobe} color={color} size={size} />;
    case 'EarthAmericas':
      return (
        <FontAwesomeIcon icon={faEarthAmericas} color={color} size={size} />
      );
    case 'Cloud':
      return <FontAwesomeIcon icon={faCloud} color={color} size={size} />;
    case 'Wind':
      return <FontAwesomeIcon icon={faWind} color={color} size={size} />;
    case 'Fan':
      return <FontAwesomeIcon icon={faFan} color={color} size={size} />;
    case 'Tree':
      return <FontAwesomeIcon icon={faTree} color={color} size={size} />;
    case 'Leaf':
      return <FontAwesomeIcon icon={faLeaf} color={color} size={size} />;
    case 'Seedling':
      return <FontAwesomeIcon icon={faSeedling} color={color} size={size} />;
    case 'Sun':
      return <FontAwesomeIcon icon={faSun} color={color} size={size} />;
    case 'Water':
      return <FontAwesomeIcon icon={faWater} color={color} size={size} />;
    case 'Wifi':
      return <FontAwesomeIcon icon={faWifi} color={color} size={size} />;
    case 'ChartSimple':
      return <FontAwesomeIcon icon={faChartSimple} color={color} size={size} />;
    case 'SolarPanel':
      return <FontAwesomeIcon icon={faSolarPanel} color={color} size={size} />;
    case 'TableList':
      return <FontAwesomeIcon icon={faTableList} color={color} size={size} />;
    case 'TableCells':
      return <FontAwesomeIcon icon={faTableCells} color={color} size={size} />;
    case 'Compass':
      return <FontAwesomeIcon icon={faCompass} color={color} size={size} />;
    case 'TemperatureHalf':
      return (
        <FontAwesomeIcon icon={faTemperatureHalf} color={color} size={size} />
      );
    case 'LocationArrow':
      return (
        <FontAwesomeIcon icon={faLocationArrow} color={color} size={size} />
      );
    case 'LocationCrosshairs':
      return (
        <FontAwesomeIcon
          icon={faLocationCrosshairs}
          color={color}
          size={size}
        />
      );
    case 'BatteryHalf':
      return <FontAwesomeIcon icon={faBatteryHalf} color={color} size={size} />;
    case 'Revert':
      return <FontAwesomeIcon icon={faRotateLeft} color={color} size={size} />;
    case 'Update':
      return (
        <FontAwesomeIcon
          icon={faRotateRight}
          color={color}
          size={size}
          className={className}
        />
      );
    case 'Circle':
      return <FontAwesomeIcon icon={faCircle} color={color} size={size} />;
    case 'Envelope':
      return <FontAwesomeIcon icon={faEnvelope} color={color} size={size} />;
    case 'ArrowTrendDown':
      return (
        <FontAwesomeIcon icon={faArrowTrendDown} color={color} size={size} />
      );
    case 'CloudArrowUp':
      return (
        <FontAwesomeIcon icon={faCloudArrowUp} color={color} size={size} />
      );
    case 'Image':
      return <FontAwesomeIcon icon={faImage} color={color} size={size} />;
    case 'Clone':
      return <FontAwesomeIcon icon={faClone} color={color} size={size} />;
    case 'Bar':
      return <FontAwesomeIcon icon={faBars} color={color} size={size} />;
    case 'Gear':
      return <FontAwesomeIcon icon={faGear} color={color} size={size} />;
    case 'Font':
      return <FontAwesomeIcon icon={faFont} color={color} size={size} />;
    case 'SaveIcon':
      return <FontAwesomeIcon icon={faFloppyDisk} color={color} size={size} />;
    case 'Download':
      return <FontAwesomeIcon icon={faDownload} color={color} size={size} />;
    case 'Cogs':
      return <FontAwesomeIcon icon={faCogs} color={color} size={size} />;
    case 'Database':
      return <FontAwesomeIcon icon={faDatabase} color={color} size={size} />;
    case 'Info':
      return <FontAwesomeIcon icon={faCircleInfo} color={color} size={size} />;
    case 'Link':
      return <FontAwesomeIcon icon={faLink} color={color} size={size} />;
    case 'PaperPlane':
      return <FontAwesomeIcon icon={faPaperPlane} color={color} size={size} />;
    case 'BusSimple':
      return <FontAwesomeIcon icon={faBusSimple} color={color} size={size} />;
    case 'PersonSwimming':
      return (
        <FontAwesomeIcon icon={faPersonSwimming} color={color} size={size} />
      );
    case 'WaterLadder':
      return <FontAwesomeIcon icon={faWaterLadder} color={color} size={size} />;
    case 'Recycle':
      return <FontAwesomeIcon icon={faRecycle} color={color} size={size} />;
    case 'PersonDigging':
      return (
        <FontAwesomeIcon icon={faPersonDigging} color={color} size={size} />
      );
    case 'RoadBarrier':
      return <FontAwesomeIcon icon={faRoadBarrier} color={color} size={size} />;
    case 'Dumpster':
      return <FontAwesomeIcon icon={faDumpster} color={color} size={size} />;
    case 'Calendar':
      return <FontAwesomeIcon icon={faCalendar} color={color} size={size} />;
    case 'CalendarDays':
      return (
        <FontAwesomeIcon icon={faCalendarDays} color={color} size={size} />
      );
    case 'Capsules':
      return <FontAwesomeIcon icon={faCapsules} color={color} size={size} />;
    case 'StaffSnake':
      return <FontAwesomeIcon icon={faStaffSnake} color={color} size={size} />;
    case 'PrescriptionBottleMedical':
      return (
        <FontAwesomeIcon
          icon={faPrescriptionBottleMedical}
          color={color}
          size={size}
        />
      );
    case 'KitMedical':
      return <FontAwesomeIcon icon={faKitMedical} color={color} size={size} />;
    case 'UserDoctor':
      return <FontAwesomeIcon icon={faUserDoctor} color={color} size={size} />;
    case 'BriefcaseMedical':
      return (
        <FontAwesomeIcon icon={faBriefcaseMedical} color={color} size={size} />
      );
    case 'Hospital':
      return <FontAwesomeIcon icon={faHospital} color={color} size={size} />;
    case 'InfoPlain':
      return <FontAwesomeIcon icon={faInfo} color={color} size={size} />;
    case 'BridgeWater':
      return <FontAwesomeIcon icon={faBridgeWater} color={color} size={size} />;
    case 'Truck':
      return <FontAwesomeIcon icon={faTruck} color={color} size={size} />;
    case 'TrafficLight':
      return (
        <FontAwesomeIcon icon={faTrafficLight} color={color} size={size} />
      );
    case 'SquareParking':
      return (
        <FontAwesomeIcon icon={faSquareParking} color={color} size={size} />
      );
    case 'ChargingStation':
      return (
        <FontAwesomeIcon icon={faChargingStation} color={color} size={size} />
      );
    case 'Taxi':
      return <FontAwesomeIcon icon={faTaxi} color={color} size={size} />;
    case 'Bolt':
      return <FontAwesomeIcon icon={faBolt} color={color} size={size} />;
    case 'GasPump':
      return <FontAwesomeIcon icon={faGasPump} color={color} size={size} />;
    case 'Fire':
      return <FontAwesomeIcon icon={faFire} color={color} size={size} />;
    case 'Snowflake':
      return <FontAwesomeIcon icon={faSnowflake} color={color} size={size} />;
    case 'School':
      return <FontAwesomeIcon icon={faSchool} color={color} size={size} />;
    case 'Church':
      return <FontAwesomeIcon icon={faChurch} color={color} size={size} />;
    case 'Warehouse':
      return <FontAwesomeIcon icon={faWarehouse} color={color} size={size} />;
    case 'Lock':
      return <FontAwesomeIcon icon={faLock} color={color} size={size} />;
    case 'ChartLine':
      return <FontAwesomeIcon icon={faChartLine} color={color} size={size} />;
    case 'ChartColumn':
      return <FontAwesomeIcon icon={faChartColumn} color={color} size={size} />;
    case 'ChartPie':
      return <FontAwesomeIcon icon={faChartPie} color={color} size={size} />;
    case 'Wheelchair':
      return <FontAwesomeIcon icon={faWheelchair} color={color} size={size} />;
    case 'Store':
      return <FontAwesomeIcon icon={faStore} color={color} size={size} />;
    case 'FireExtinguisher':
      return (
        <FontAwesomeIcon icon={faFireExtinguisher} color={color} size={size} />
      );
    case 'XMark':
      return <FontAwesomeIcon icon={faXmark} color={color} size={size} />;
    default:
      return <div></div>;
  }
}
