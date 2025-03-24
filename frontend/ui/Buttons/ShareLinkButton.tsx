'use client';

import { ReactElement, useState } from 'react';
import { faShareNodes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getTenantOfPage } from '@/utils/tenantHelper';
import ShareLinkModal from '../ShareLinkModal';

type ShareLinkButtonProps = {
  type: string;
  id: string;
  widgetPrimaryColor?: string;
  widgetFontColor?: string;
};

export default function ShareLinkButton(
  props: ShareLinkButtonProps,
): ReactElement {
  const { type, id, widgetPrimaryColor, widgetFontColor } = props;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [sharingUrl, setSharingUrl] = useState('');
  const tenant = getTenantOfPage();

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
    backgroundColor: widgetPrimaryColor ?? '#3D4760',
    color: widgetFontColor || '#FFF',
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
