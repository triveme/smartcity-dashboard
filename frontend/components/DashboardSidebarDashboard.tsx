import { ReactElement, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';

import DashboardIcons from '@/ui/Icons/DashboardIcon';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage } from '@/utils/tenantHelper';
import Link from 'next/link';
import { determineIsMobileView } from '@/app/custom-hooks/isMobileView';

type DashboardSidebarDashboardProps = {
  name: string;
  url: string;
  elementUrl: string;
  icon: string;
  onDashboardClick: () => void;
};

export default function DashboardSidebarDashboard(
  props: DashboardSidebarDashboardProps,
): ReactElement {
  const { name, icon, url, elementUrl, onDashboardClick } = props;
  const params = useParams();
  const [isHovered, setIsHovered] = useState(false);
  const isMobileView = determineIsMobileView();
  const defaultBgColor = '#3D4760';
  const tenant = getTenantOfPage();

  const { data } = useQuery({
    queryKey: ['corporate-info'],
    queryFn: () => getCorporateInfosWithLogos(tenant),
  });

  //Dynamic Styling
  const DynamicStyles = {
    menuActiveColor: data?.menuActiveColor || defaultBgColor,
    menuPrimaryColor: data?.menuPrimaryColor || defaultBgColor,
    menuHoverColor: data?.menuHoverColor || defaultBgColor,
  };

  const isActiveChild = (child: string): boolean => {
    if (params && params.url) {
      return params.url[params.url.length - 1] === child;
    }
    return false;
  };

  const handleMouseEnter = (): void => {
    setIsHovered(true);
  };

  const handleMouseLeave = (): void => {
    setIsHovered(false);
  };

  const determineBackgroundColor = (child: string): string => {
    if (isActiveChild(child)) {
      return data ? DynamicStyles.menuActiveColor : defaultBgColor;
    }

    return 'transparent';
  };

  const determineFontColor = (child: string): string => {
    if (isActiveChild(child)) {
      return data?.menuActiveFontColor ?? '#FFFFFF';
    } else if (isHovered) {
      return data?.menuHoverFontColor ?? '#FFF';
    } else {
      return data?.menuFontColor ?? '#000000';
    }
  };

  const menuStyle = {
    width: '100%',
    padding: '6px',
    cursor: 'pointer',
    backgroundColor: determineBackgroundColor(elementUrl),
    // For hover effect using dynamic color
    ...(isHovered && {
      backgroundColor: DynamicStyles.menuHoverColor || defaultBgColor,
    }),
    color: determineFontColor(elementUrl),
  };

  return (
    <div className="w-full pb-2">
      <Link className={`flex`} href={`/${tenant}/${url}`} target={'_self'}>
        <div
          style={menuStyle}
          className="flex flex-row justify-between items-center content-center p-1 rounded-lg"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={(): void => {
            if (isMobileView) {
              onDashboardClick();
            }
          }}
        >
          {icon && icon !== 'empty' && (
            <div className="w-4 h-4 flex items-center basis-1/5">
              <DashboardIcons
                iconName={icon}
                color={menuStyle.color || 'white'}
              />
            </div>
          )}

          <div className="basis-4/5">
            <button
              className="text-start"
              style={{ color: menuStyle.color || 'white' }}
            >
              {name}
            </button>
          </div>

          {/* <div className="basis-1/5"></div> */}
        </div>
      </Link>
    </div>
  );
}
