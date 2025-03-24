import React, { useState } from 'react';

type IntervalButtonProps = {
  text: string;
  active: boolean;
  backgroundColor: string;
  inactiveBackgroundColor: string;
  headerSecondaryColor: string;
  hoverColor: string;
  fontColor: string;
  onClick: () => void;
};

export default function IntervalButton(
  props: IntervalButtonProps,
): React.ReactElement {
  const {
    text,
    active,
    onClick,
    backgroundColor,
    inactiveBackgroundColor,
    headerSecondaryColor,
    hoverColor,
    fontColor,
  } = props;
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = (): void => {
    setIsHovered(true);
  };

  const handleMouseLeave = (): void => {
    setIsHovered(false);
  };

  const inactiveStyles = {
    backgroundColor: inactiveBackgroundColor || 'transparent',
    borderColor: headerSecondaryColor || '#3D4760',
    color: fontColor || '#FFF',
  };

  const hoverStyles = {
    backgroundColor: hoverColor || '#3D4760',
    borderColor: headerSecondaryColor || '#3D4760',
  };

  const buttonStyles = active
    ? {
        backgroundColor: backgroundColor || '#3D4760',
        borderColor: headerSecondaryColor || '#3D4760',
        ...(isHovered && hoverStyles),
        color: fontColor || '#FFF',
      }
    : isHovered
      ? hoverStyles
      : inactiveStyles;

  return (
    <button
      className={`font-semibold py-2 px-2 border-2 rounded-full transition duration-300 ease-in-out`}
      style={buttonStyles}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {text}
    </button>
  );
}
