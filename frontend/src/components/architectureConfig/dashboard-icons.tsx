import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccessibilityIcon from "@mui/icons-material/Accessibility";
import AccessibleIcon from "@mui/icons-material/Accessible";
import AutoStoriesIcon from "@mui/icons-material/AutoStories";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import CallIcon from "@mui/icons-material/Call";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import CloudIcon from "@mui/icons-material/Cloud";
import HomeIcon from "@mui/icons-material/Home";
import ParkIcon from "@mui/icons-material/Park";
import { default as DashIcon } from "@mui/icons-material/Dashboard";
import DeleteIcon from "@mui/icons-material/Delete";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import DirectionsBikeIcon from "@mui/icons-material/DirectionsBike";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import NightlightIcon from "@mui/icons-material/Nightlight";
import LightModeIcon from "@mui/icons-material/LightMode";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import SchoolIcon from "@mui/icons-material/School";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import WbIncandescentIcon from "@mui/icons-material/WbIncandescent";
import HotelIcon from "@mui/icons-material/Hotel";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import ElectricalServicesIcon from "@mui/icons-material/ElectricalServices";
import ChildFriendlyIcon from "@mui/icons-material/ChildFriendly";
import ElectricCarIcon from "@mui/icons-material/ElectricCar";
import LocalDiningIcon from "@mui/icons-material/LocalDining";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import TrafficIcon from "@mui/icons-material/Traffic";
import AirIcon from "@mui/icons-material/Air";
import PoolIcon from "@mui/icons-material/Pool";
import WaterIcon from "@mui/icons-material/Water";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from '@mui/icons-material/Close';
import {
  IconBatteryCharging2,
  IconDropletFilled2,
  IconHaze,
  IconParking,
  IconPaw,
  IconPin,
  IconRipple,
  IconSwimming,
  IconTemperature,
  IconWind,
  IconDroplet,
  IconDashboard,
  IconSun,
  IconPoint,
  IconArrowNarrowRight,
  IconArrowNarrowLeft,
  IconMap,
  IconList,
  IconInfoCircle,
  IconFilter,
  IconMapSearch,
  IconCar,
  IconBike,
  IconArrowWaveRightDown,
  IconDotsVertical,
} from '@tabler/icons';

export const iconList = [
  "money",
  "accessibility",
  "accessible",
  "tree",
  "book",
  "battery",
  "phone",
  "camera",
  "cloud",
  "house",
  "parking",
  "water",
  "dashboard",
  "trash",
  "bike",
  "bus",
  "nightlight",
  "daylight",
  "flash",
  "education",
  "healthcare",
  "light",
  "hotel",
  "run",
  "drink",
  "eat",
  "cable",
  "child",
  "electriccar",
  "car",
  "traffic",
  "air",
  "swim",
  "right",
  "IconBatteryCharging2",
  "IconDropletFilled2",
  "IconHaze",
  "IconParking",
  "IconPaw",
  "IconPin",
  "IconRipple",
  "IconSwimming",
  "IconTemperature",
  "IconWind",
  "IconDroplet",
  "IconDashboard",
  "IconSun",
  "IconPoint",
  "IconArrowNarrowRight",
  "IconArrowNarrowLeft",
  "IconMap",
  "IconList",
  "IconInfoCircle",
  "IconFilter",
  "IconMapSearch",
  "IconCar",
  "IconBike",
  "IconArrowWaveRightDown",
  "IconDotsVertical"
];

type DashboardIconProps = {
  icon: string;
  color: string;
  fontSize?: string;
};

export function DashboardIcon(props: DashboardIconProps) {
  const { icon, color, fontSize } = props;

  let iconStyle: React.CSSProperties = {
    color: color,
    fontSize: fontSize ? fontSize : "1.25rem"
  }

  switch (icon) {
    case "money":
      return <AttachMoneyIcon style={iconStyle} />;
    case "accessibility":
      return <AccessibilityIcon style={iconStyle} />;
    case "accessible":
      return <AccessibleIcon style={iconStyle} />;
    case "tree":
      return <ParkIcon style={iconStyle} />;
    case "book":
      return <AutoStoriesIcon style={iconStyle} />;
    case "battery":
      return <BatteryChargingFullIcon style={iconStyle} />;
    case "phone":
      return <CallIcon style={iconStyle} />;
    case "camera":
      return <CameraAltIcon style={iconStyle} />;
    case "cloud":
      return <CloudIcon style={iconStyle} />;
    case "house":
      return <HomeIcon style={iconStyle} />;
    case "parking":
      return <LocalParkingIcon style={iconStyle} />;
    case "water":
      return <WaterIcon style={iconStyle} />;
    case "dashboard":
      return <DashIcon style={iconStyle} />;
    case "trash":
      return <DeleteIcon style={iconStyle} />;
    case "bike":
      return <DirectionsBikeIcon style={iconStyle} />;
    case "bus":
      return <DirectionsBusIcon style={iconStyle} />;
    case "nightlight":
      return <NightlightIcon style={iconStyle} />;
    case "daylight":
      return <LightModeIcon style={iconStyle} />;
    case "flash":
      return <FlashOnIcon style={iconStyle} />;
    case "education":
      return <SchoolIcon style={iconStyle} />;
    case "healthcare":
      return <LocalHospitalIcon style={iconStyle} />;
    case "light":
      return <WbIncandescentIcon style={iconStyle} />;
    case "hotel":
      return <HotelIcon style={iconStyle} />;
    case "run":
      return <DirectionsRunIcon style={iconStyle} />;
    case "drink":
      return <LocalBarIcon style={iconStyle} />;
    case "eat":
      return <LocalDiningIcon style={iconStyle} />;
    case "cable":
      return <ElectricalServicesIcon style={iconStyle} />;
    case "child":
      return <ChildFriendlyIcon style={iconStyle} />;
    case "electriccar":
      return <ElectricCarIcon style={iconStyle} />;
    case "car":
      return <DirectionsCarIcon style={iconStyle} />;
    case "traffic":
      return <TrafficIcon style={iconStyle} />;
    case "air":
      return <AirIcon style={iconStyle} />;
    case "swim":
      return <PoolIcon style={iconStyle} />;
    case "right":
      return <ChevronRightIcon style={iconStyle} />;
    case "IconBatteryCharging2":
      return <IconBatteryCharging2 style={iconStyle} />;
    case "IconDropletFilled2":
      return <IconDropletFilled2 style={iconStyle} />;
    case "IconHaze":
      return <IconHaze style={iconStyle} />;
    case "IconParking":
      return <IconParking style={iconStyle} />;
    case "IconPaw":
      return <IconPaw style={iconStyle} />;
    case "IconPin":
      return <IconPin style={iconStyle} />;
    case "IconRipple":
      return <IconRipple style={iconStyle} />;
    case "IconSwimming":
      return <IconSwimming style={iconStyle} />;    
    case "IconTemperature":
      return <IconTemperature style={iconStyle} />;
    case "IconWind":
      return <IconWind style={iconStyle} />;
    case "IconDroplet":
      return <IconDroplet style={iconStyle} />;
    case "IconDashboard":
      return <IconDashboard style={iconStyle} />;
    case "IconSun":
      return <IconSun style={iconStyle} />;
    case "IconPoint":
      return <IconPoint style={iconStyle} />;
    case "IconArrowNarrowRight":
      return <IconArrowNarrowRight style={iconStyle} />;
    case "IconArrowNarrowLeft":
      return <IconArrowNarrowLeft style={iconStyle} />;    
    case "IconMap":
      return <IconMap style={iconStyle} />;
    case "IconList":
      return <IconList style={iconStyle} />;
    case "IconInfoCircle":
      return <IconInfoCircle style={iconStyle} />;
    case "IconFilter":
      return <IconFilter style={iconStyle} />;
    case "IconMapSearch":
      return <IconMapSearch style={iconStyle} />;
    case "IconCar":
      return <IconCar style={iconStyle} />;
    case "IconBike":
      return <IconBike style={iconStyle} />;
    case "IconArrowWaveRightDown":
      return <IconArrowWaveRightDown style={iconStyle} />;
    case "IconDotsVertical":
      return <IconDotsVertical style={iconStyle} />;
    case "IconClose":
      return <CloseIcon style={iconStyle} />;
    default:
      return <ChevronRightIcon style={iconStyle} />;
  }
}

export const widgetTabIconList = [
  "listView",
  "mapCar",
  "mapBike",
  "mapView",
  "infoView",
]

export function WidgetTabIcons(props: DashboardIconProps) {
  const { icon, color, fontSize } = props;

  let iconStyle: React.CSSProperties = {
    color: color,
    fontSize: fontSize ? fontSize : "1.25rem"
  }

  switch (icon) {
    case "mapView":
      return <IconMap style={iconStyle} />;
    case "listView":
      return <IconList style={iconStyle} />;
    case "infoView":
      return <IconInfoCircle style={iconStyle} />;
    case "mapCar":
      return <IconCar style={iconStyle} />;
    case "mapBike":
      return <IconBike style={iconStyle} />;
    case "verticalThreeDotsMenu":
      return <IconDotsVertical style={iconStyle} />;
    default:
      return <></>;
  }
}

export const widgetMapPinIconList = [
  "bikes",
  "cars",
  "parking",
  "pois",
  "swimming",
  "water",
  "zoo",
]

export function WidgetMapPinIcon(props: DashboardIconProps) {
  const { icon, color, fontSize } = props;

  let iconStyle: React.CSSProperties = {
    color: color,
    fontSize: fontSize ? fontSize : "1.25rem"
  }

  switch (icon) {
    case "bikes":
      return <IconBike style={iconStyle} />;
    case "cars":
      return <IconCar style={iconStyle} />;
    case "parking":
      return <IconParking style={iconStyle} />;
    case "pois":
      return <IconPin style={iconStyle} />;
    case "swimming":
      return <IconSwimming style={iconStyle} />;
    case "water":
      return <IconHaze style={iconStyle} />;
    case "zoo":
      return <IconPaw style={iconStyle} />;
    default:
      return <></>;
  }
}
