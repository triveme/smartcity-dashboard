import { ReactElement } from 'react';
import { FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import FontAwesomeIcons from './FontAwesomeIcons';
import LocalSvgIcons, { localSvgIconsList } from './LocalSvgIcons';

type DashboardIcons = {
  iconName: string;
  color?: string;
  size?: FontAwesomeIconProps['size']; // FontAwesome icon size
  className?: string;
  height?: string; // For SVG icons
};

export default function DashboardIcon(props: DashboardIcons): ReactElement {
  const {
    iconName,
    color = '#fff',
    size = 'lg',
    className,
    height = '24',
  } = props;

  // Check if iconName is in localSvgIcons
  const isSvgIcon = localSvgIconsList.some((icon) => icon.name === iconName);

  if (isSvgIcon) {
    // Render local SVG icon
    return (
      <LocalSvgIcons iconName={iconName} fontColor={color} height={height} />
    );
  } else {
    // Render FontAwesome icon
    return (
      <FontAwesomeIcons
        iconName={iconName}
        color={color}
        size={size}
        className={className}
      />
    );
  }
}
