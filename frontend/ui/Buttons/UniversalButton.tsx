import { ReactElement, useState } from 'react';
import DashboardIcons from '../Icons/DashboardIcon';
import { useQuery } from '@tanstack/react-query';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage } from '@/utils/tenantHelper';

type UniversalButtonProps = {
  label?: string;
  handleClick: () => void;
};

export default function UniversalButton(
  props: UniversalButtonProps,
): ReactElement {
  const { label, handleClick } = props;
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const tenant = getTenantOfPage();

  const onClick = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await handleClick();
    } finally {
      setIsLoading(false);
    }
  };

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
        className={`py-2 px-4 h-19 min-w-48 w-fit rounded-lg flex justify-evenly items-center align-middle content-center transition-colors ease-in-out duration-300 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={onClick}
        disabled={isLoading}
        style={buttonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-center justify-center">
          {!isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <DashboardIcons iconName="Download" />
              <p className="hidden sm:block">{label}</p>
            </div>
          ) : (
            <DashboardIcons iconName="Spinner" />
          )}
        </div>
      </button>
    </div>
  );
}
