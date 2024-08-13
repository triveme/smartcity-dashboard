import { ReactElement } from 'react';

import { visibilityEnum } from '@/types';
import DashboardIcons from './Icons/DashboardIcon';
import { visibilityOptions } from '@/utils/enumMapper';

type VisibilityDisplayProps = {
  visibility: visibilityEnum;
};

export default function VisibilityDisplay(
  props: VisibilityDisplayProps,
): ReactElement {
  const { visibility } = props;

  let bgColor;
  let textColor;
  let icon;
  const text = visibilityOptions.find((option) => option.value === visibility)
    ?.label;

  switch (visibility) {
    case 'invisible':
      icon = 'EyeSlash';
      bgColor = 'bg-[#D9D9D9]';
      textColor = 'text-[#3D4760]';
      break;
    case 'protected':
      icon = 'Key';
      bgColor = 'bg-[#FACC15]';
      textColor = 'text-[#3D4760]';
      break;
    case 'public':
    default:
      icon = 'Eye';
      bgColor = 'bg-[#049A1A]';
      textColor = 'text-white';
      break;
  }

  return (
    <div
      className={`${bgColor} ${textColor} flex justify-start items-center rounded-lg w-[140px] gap-3 py-1 px-2`}
    >
      <DashboardIcons iconName={icon} color={textColor} />
      {text}
    </div>
  );
}
