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
];

type DashboardIconProps = {
  icon: string;
  color: string;
};

export function DashboardIcon(props: DashboardIconProps) {
  const { icon, color } = props;

  switch (icon) {
    case "money":
      return <AttachMoneyIcon style={{ color: color, fontSize: "1.25rem" }} />;
    case "accessibility":
      return (
        <AccessibilityIcon style={{ color: color, fontSize: "1.25rem" }} />
      );
    case "accessible":
      return <AccessibleIcon style={{ color: color, fontSize: "1.25rem" }} />;
    case "tree":
      return <ParkIcon style={{ color: color, fontSize: "1.25rem" }} />;
    case "book":
      return <AutoStoriesIcon style={{ color: color, fontSize: "1.25rem" }} />;
    case "battery":
      return (
        <BatteryChargingFullIcon
          style={{ color: color, fontSize: "1.25rem" }}
        />
      );
    case "phone":
      return <CallIcon style={{ color: color, fontSize: "1.25rem" }} />;
    case "camera":
      return <CameraAltIcon style={{ color: color, fontSize: "1.25rem" }} />;
    case "cloud":
      return <CloudIcon style={{ color: color, fontSize: "1.25rem" }} />;
    case "house":
      return <HomeIcon style={{ color: color, fontSize: "1.25rem" }} />;
    case "parking":
      return <LocalParkingIcon style={{ color: color, fontSize: "1.25rem" }} />;
    case "water":
      return <WaterIcon style={{ color: color, fontSize: "1.25rem" }} />;
    case "dashboard":
      return <DashIcon style={{ color: color, fontSize: "1.25rem" }} />;
    case "trash":
      return <DeleteIcon style={{ color: color, fontSize: "1.25rem" }} />;
    case "bike":
      return (
        <DirectionsBikeIcon style={{ color: color, fontSize: "1.25rem" }} />
      );
    case "bus":
      return (
        <DirectionsBusIcon style={{ color: color, fontSize: "1.25rem" }} />
      );
    case "nightlight":
      return <NightlightIcon style={{ color: color, fontSize: "1.25rem" }} />;
    case "daylight":
      return <LightModeIcon style={{ color: color, fontSize: "1.25rem" }} />;
    case "flash":
      return <FlashOnIcon style={{ color: color, fontSize: "1.25rem" }} />;
    case "education":
      return <SchoolIcon style={{ color: color, fontSize: "1.25rem" }} />;
    case "healthcare":
      return (
        <LocalHospitalIcon style={{ color: color, fontSize: "1.25rem" }} />
      );
    case "light":
      return (
        <WbIncandescentIcon style={{ color: color, fontSize: "1.25rem" }} />
      );
    case "hotel":
      return <HotelIcon style={{ color: color, fontSize: "1.25rem" }} />;
    case "run":
      return (
        <DirectionsRunIcon style={{ color: color, fontSize: "1.25rem" }} />
      );
    case "drink":
      return <LocalBarIcon style={{ color: color, fontSize: "1.25rem" }} />;
    case "eat":
      return <LocalDiningIcon style={{ color: color, fontSize: "1.25rem" }} />;
    case "cable":
      return (
        <ElectricalServicesIcon style={{ color: color, fontSize: "1.25rem" }} />
      );
    case "child":
      return (
        <ChildFriendlyIcon style={{ color: color, fontSize: "1.25rem" }} />
      );
    case "electriccar":
      return <ElectricCarIcon style={{ color: color, fontSize: "1.25rem" }} />;
    case "car":
      return (
        <DirectionsCarIcon style={{ color: color, fontSize: "1.25rem" }} />
      );
    case "traffic":
      return <TrafficIcon style={{ color: color, fontSize: "1.25rem" }} />;
    case "air":
      return <AirIcon style={{ color: color, fontSize: "1.25rem" }} />;
    case "swim":
      return <PoolIcon style={{ color: color, fontSize: "1.25rem" }} />;
    case "right":
      return <ChevronRightIcon style={{ color: color, fontSize: "1.25rem" }} />;
    default:
      return <ChevronRightIcon style={{ color: color, fontSize: "1.25rem" }} />;
  }
}
