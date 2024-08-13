import { ReactElement, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import DashboardIcons from '../Icons/DashboardIcon';
import { useQuery } from '@tanstack/react-query';
import { getCorporateInfosWithLogos } from '@/app/actions';

export default function CreateButton(): ReactElement {
  const pathname = usePathname();
  const { push } = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleCreateButtonClick = (): void => {
    push(`${pathname}/edit`);
  };

  const { data } = useQuery({
    queryKey: ['corporate-info'],
    queryFn: () => getCorporateInfosWithLogos(),
    enabled: false,
  });

  const handleMouseEnter = (): void => {
    setIsHovered(true);
  };

  const handleMouseLeave = (): void => {
    setIsHovered(false);
  };

  const buttonStyle = {
    backgroundColor: data?.saveButtonColor || '#91D9FF',
    ...(isHovered && {
      backgroundColor: data?.saveHoverButtonColor || '#82C3E5',
    }),
    color: data?.dashboardFontColor || '#2B3244',
  };

  const logoColor = data?.dashboardFontColor || '#2B3244';

  return (
    <div>
      <button
        className="p-4 h-10 w-48 rounded-lg flex justify-evenly items-center content-center transition-colors ease-in-out duration-300"
        onClick={handleCreateButtonClick}
        style={buttonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <DashboardIcons iconName="Plus" color={logoColor} />
        <div>Neu erstellen</div>
      </button>
    </div>
  );
}
