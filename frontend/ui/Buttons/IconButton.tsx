import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage } from '@/utils/tenantHelper';
import { useQuery } from '@tanstack/react-query';
import { ReactElement, useState } from 'react';
import DashboardIcons from '../Icons/DashboardIcon';

type IconButtonProps = {
  iconName: string;
  handleClick: () => void;
};

export default function IconButton(props: IconButtonProps): ReactElement {
  const { iconName, handleClick } = props;
  const [isHovered, setIsHovered] = useState(false);
  const tenant = getTenantOfPage();

  const { data } = useQuery({
    queryKey: ['corporate-info'],
    queryFn: () => getCorporateInfosWithLogos(tenant),
    enabled: false,
  });

  const handleMouseEnter = (): void => {
    setIsHovered(true);
  };

  const handleMouseLeave = (): void => {
    setIsHovered(false);
  };

  const buttonStyle = {
    color: data?.headerFontColor || '#3D4760',
    backgroundColor: data?.headerPrimaryColor || '#FFFFFF',
    ...(isHovered && {
      backgroundColor: data?.headerSecondaryColor || '#3D4760',
    }),
  };

  return (
    <div className="py-4 flex justify-center items-center content-center">
      <button
        className="p-2 h-10 w-full rounded-lg flex justify-center items-center content-center transition-colors ease-in-out duration-300"
        onClick={handleClick}
        style={buttonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <DashboardIcons iconName={iconName} color={data?.headerFontColor} />
      </button>
    </div>
  );
}
