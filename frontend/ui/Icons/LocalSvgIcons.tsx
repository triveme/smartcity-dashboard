import { ReactElement } from 'react';
import {
  Snowflake,
  ForestFire,
  PartlyCloudy,
  Waves,
  SoilMoisture,
  Trees,
  Climate,
  Heat,
  Mobility,
  Info,
  Emission,
  Dry,
  HumidityNormal,
  HumidityMedium,
  HumidityHigh,
  HumidityPercentage,
  RemoteSoil,
  Pollen,
  WaterLevelLow,
  WaterLevelNormal,
  WaterLevelHigh,
  ActionLink,
} from '../../assets/icons';

type IconType = 'fontawesome' | 'svg';

type IconOption = {
  name: string;
  type: IconType;
};

type DashboardSvgProps = {
  iconName: string;
  fontColor: string;
  height: string;
};

export const localSvgIconsList: IconOption[] = [
  { name: 'Snowflake', type: 'svg' },
  { name: 'ForestFire', type: 'svg' },
  { name: 'PartlyCloudy', type: 'svg' },
  { name: 'Waves', type: 'svg' },
  { name: 'SoilMoisture', type: 'svg' },
  { name: 'Trees', type: 'svg' },
  { name: 'Climate', type: 'svg' },
  { name: 'Heat', type: 'svg' },
  { name: 'Mobility', type: 'svg' },
  { name: 'Info', type: 'svg' },
  { name: 'Emission', type: 'svg' },
  { name: 'Dry', type: 'svg' },
  { name: 'HumidityNormal', type: 'svg' },
  { name: 'HumidityMedium', type: 'svg' },
  { name: 'HumidityHigh', type: 'svg' },
  { name: 'HumidityPercentage', type: 'svg' },
  { name: 'RemoteSoil', type: 'svg' },
  { name: 'Pollen', type: 'svg' },
  { name: 'WaterLevelLow', type: 'svg' },
  { name: 'WaterLevelNormal', type: 'svg' },
  { name: 'WaterLevelHigh', type: 'svg' },
  { name: 'ActionLink', type: 'svg' },
  // Add other SVG icons here
];

export default function LocalSvgIcons(props: DashboardSvgProps): ReactElement {
  const { iconName, fontColor, height } = props;

  switch (iconName) {
    case 'empty':
      return <div></div>;
    case 'Snowflake':
      return <Snowflake fontColor={fontColor} height={height} />;
    case 'ForestFire':
      return <ForestFire fontColor={fontColor} height={height} />;
    case 'PartlyCloudy':
      return <PartlyCloudy fontColor={fontColor} height={height} />;
    case 'Waves':
      return <Waves fontColor={fontColor} height={height} />;
    case 'SoilMoisture':
      return <SoilMoisture fontColor={fontColor} height={height} />;
    case 'Trees':
      return <Trees fontColor={fontColor} height={height} />;
    case 'Climate':
      return <Climate fontColor={fontColor} height={height} />;
    case 'Heat':
      return <Heat fontColor={fontColor} height={height} />;
    case 'Mobility':
      return <Mobility fontColor={fontColor} height={height} />;
    case 'Info':
      return <Info fontColor={fontColor} height={height} />;
    case 'Emission':
      return <Emission fontColor={fontColor} height={height} />;
    case 'Dry':
      return <Dry fontColor={fontColor} height={height} />;
    case 'HumidityNormal':
      return <HumidityNormal fontColor={fontColor} height={height} />;
    case 'HumidityMedium':
      return <HumidityMedium fontColor={fontColor} height={height} />;
    case 'HumidityHigh':
      return <HumidityHigh fontColor={fontColor} height={height} />;
    case 'HumidityPercentage':
      return <HumidityPercentage fontColor={fontColor} height={height} />;
    case 'RemoteSoil':
      return <RemoteSoil fontColor={fontColor} height={height} />;
    case 'Pollen':
      return <Pollen fontColor={fontColor} height={height} />;
    case 'WaterLevelLow':
      return <WaterLevelLow fontColor={fontColor} height={height} />;
    case 'WaterLevelNormal':
      return <WaterLevelNormal fontColor={fontColor} height={height} />;
    case 'WaterLevelHigh':
      return <WaterLevelHigh fontColor={fontColor} height={height} />;
    case 'ActionLink':
      return <ActionLink fontColor={fontColor} height={height} />;
    // Add other SVG icons here
    default:
      return <div></div>;
  }
}
