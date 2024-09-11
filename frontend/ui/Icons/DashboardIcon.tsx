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
  faFloppyDisk,
  faImage,
  faEnvelope,
  faDownload,
} from '@fortawesome/free-solid-svg-icons';

export const AvailableIcons = [
  '',
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
];

type DashboardIconsProps = {
  iconName: string;
  color: string;
  className?: string;
  size?: SizeProp;
};
export default function DashboardIcons(
  props: DashboardIconsProps,
): ReactElement {
  const { iconName, color, className, size } = props;

  switch (iconName) {
    case '':
    default:
      return (
        <FontAwesomeIcon
          icon={faChevronLeft}
          color={'#FFF'}
          size={size}
          className={className}
          style={{ opacity: 0 }}
        />
      );
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
        <FontAwesomeIcon icon={faSpinner} color={color} size={size} spin />
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
      return <FontAwesomeIcon icon={faRotateRight} color={color} size={size} />;
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
    case 'File':
      return <FontAwesomeIcon icon={faFile} color={color} size={size} />;
    case 'Gear':
      return <FontAwesomeIcon icon={faGear} color={color} size={size} />;
    case 'Font':
      return <FontAwesomeIcon icon={faFont} color={color} size={size} />;
    case 'SaveIcon':
      return <FontAwesomeIcon icon={faFloppyDisk} color={color} size={size} />;
    case 'Download':
      return <FontAwesomeIcon icon={faDownload} color={color} size={size} />;
  }
}
