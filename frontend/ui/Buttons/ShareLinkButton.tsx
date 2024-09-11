'use client';

import { ReactElement, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCorporateInfosWithLogos } from '@/app/actions';
import { faShareNodes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getTenantOfPage } from '@/utils/tenantHelper';
import ShareLinkModal from '../ShareLinkModal';

type ShareLinkButtonProps = {
  type: string;
  id: string;
};

export default function ShareLinkButton(
  props: ShareLinkButtonProps,
): ReactElement {
  const { type, id } = props;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sharingUrl, setSharingUrl] = useState('');
  const tenant = getTenantOfPage();

  const { data } = useQuery({
    queryKey: ['corporate-info'],
    queryFn: () => getCorporateInfosWithLogos(tenant),
    enabled: false,
  });

  const handleShareClick = (): void => {
    const sharingUrl = generateShareLink();
    setSharingUrl(sharingUrl);
    setIsModalVisible(true);
  };

  const generateShareLink = (): string => {
    if (type && id && tenant) {
      const baseUrl = window.location.origin;
      const suffixUrl = `/${tenant}/${type}?id=${id}`;
      return baseUrl + suffixUrl;
    }
    return '';
  };

  const widgetStyle = {
    backgroundColor: data?.widgetPrimaryColor ?? '#3D4760',
    color: data?.widgetFontColor || '#FFF',
  };

  return (
    <>
      <button style={{ color: widgetStyle.color }}>
        <FontAwesomeIcon
          icon={faShareNodes}
          size="lg"
          onClick={handleShareClick}
        />
      </button>

      <ShareLinkModal
        modalStyle={widgetStyle}
        isVisible={isModalVisible}
        sharingUrl={sharingUrl}
        onClose={(): void => setIsModalVisible(false)}
      />
    </>
  );
}
