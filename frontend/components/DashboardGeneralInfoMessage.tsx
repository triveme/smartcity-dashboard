'use client';
import React, { ReactElement, useState } from 'react';

import { PanelWithContent } from '@/types';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import GeneralInfoMessageModal from '@/ui/GeneralInfoMessageModal';

type DashboardGeneralInfoMessageProps = {
  panel: PanelWithContent;
  infoModalBackgroundColor: string;
  infoModalFontColor: string;
};

export default function DashboardGeneralInfoMessage(
  props: DashboardGeneralInfoMessageProps,
): ReactElement | null {
  const { panel, infoModalBackgroundColor, infoModalFontColor } = props;
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleInfoButtonClicked = (): void => {
    setIsModalVisible(true);
  };

  return (
    <div className="justify-center items-center content-center h-4/6 overflow-y-auto">
      <button onClick={handleInfoButtonClicked}>
        <FontAwesomeIcon icon={faExclamationCircle} size="sm" />
      </button>
      <GeneralInfoMessageModal
        isVisible={isModalVisible}
        headline={'Information'}
        message={panel.generalInfo}
        onClose={(): void => setIsModalVisible(false)}
        infoModalBackgroundColor={infoModalBackgroundColor}
        infoModalFontColor={infoModalFontColor}
      />
    </div>
  );
}
