import { ReactElement, useState } from 'react';
import DashboardIcons from '../Icons/DashboardIcon';
import { useQuery } from '@tanstack/react-query';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage } from '@/utils/tenantHelper';

type SaveButtonProps = {
  handleSaveClick: () => void;
};

export default function SaveButton(props: SaveButtonProps): ReactElement {
  const { handleSaveClick } = props;
  const [isSaving, setIsSaving] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const tenant = getTenantOfPage();

  const onClick = async (): Promise<void> => {
    setIsSaving(true); // Disable the button
    try {
      await handleSaveClick();
    } finally {
      setIsSaving(false); // Re-enable the button regardless of success or failure
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
        className={`p-2 h-19 w-48 rounded-lg flex justify-evenly items-center align-middle content-center transition-colors ease-in-out duration-300 ${
          isSaving ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={onClick}
        disabled={isSaving}
        style={buttonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <DashboardIcons iconName="SaveIcon" color={logoColor} size="lg" />
        <div>Speichern</div>
      </button>
    </div>
  );
}
