import { ReactElement } from 'react';
import DashboardIcons from './Icons/DashboardIcon';
import { useQuery } from '@tanstack/react-query';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { getTenantOfPage } from '@/utils/tenantHelper';

type InfoDisplayComponentProps = {
  headline: string;
  value: string;
  icon?: string;
  iconColor?: string;
  backgroundColor?: string;
  fontColor?: string;
};

export default function InfoDisplayComponent(
  props: InfoDisplayComponentProps,
): ReactElement {
  const { headline, value, icon, iconColor, backgroundColor, fontColor } =
    props;

  const tenant = getTenantOfPage();
  const { data } = useQuery({
    queryKey: ['corporate-info'],
    queryFn: () => getCorporateInfosWithLogos(tenant),
    enabled: false,
  });

  const boxStyle = {
    borderRadius: data?.widgetBorderRadius || '8px',
    backgroundColor: backgroundColor,
    color: fontColor,
    borderColor: data?.widgetBorderColor || '#59647D',
  };

  return (
    <div
      className="flex flex-col items-center p-4 pl-2 border-2"
      style={boxStyle}
    >
      <div className="text-sm font-bold">{headline}</div>
      <div className="text-lg flex items-center">
        {icon && iconColor && (
          <span className="mr-2">
            <DashboardIcons iconName={icon} color={iconColor} />
          </span>
        )}
        {value}
      </div>
    </div>
  );
}
