import { ReactElement, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage } from '@/utils/tenantHelper';

type CancelButtonProps = {
  closeWindow?: boolean;
  onClick?: () => void;
};

export default function CancelButton(props: CancelButtonProps): ReactElement {
  const { closeWindow, onClick } = props;
  const router = useRouter();
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
    backgroundColor: data?.cancelButtonColor || '#8388A4',
    ...(isHovered && {
      backgroundColor: data?.cancelHoverButtonColor || '#6C7188',
    }),
    color: data?.dashboardFontColor || '#2B3244',
  };

  const handleCancelButtonClick = (): void => {
    if (closeWindow && onClick) {
      onClick();
    } else {
      router.back();
    }
  };

  return (
    <div>
      <button
        className="p-2 h-19 w-48 rounded-lg flex justify-evenly items-center content-center transition-colors ease-in-out duration-300"
        onClick={handleCancelButtonClick}
        style={buttonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div>Abbrechen</div>
      </button>
    </div>
  );
}
