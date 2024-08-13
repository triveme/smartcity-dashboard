'use client';

import { PanelWithContent } from '@/types';
import GeneralInfoMessageModal from '@/ui/GeneralInfoMessageModal';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { ReactElement, useState } from 'react';

type DashboardGeneralInfoMessageProps = {
  panel: PanelWithContent;
};

export default function DashboardGeneralInfoMessage(
  props: DashboardGeneralInfoMessageProps,
): ReactElement | null {
  const { panel } = props;
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleInfoButtonClicked = (): void => {
    setIsModalVisible(true);
  };

  return (
    <div className="justify-center items-center content-center">
      <button onClick={handleInfoButtonClicked}>
        <FontAwesomeIcon icon={faExclamationCircle} size="sm" />
      </button>
      <GeneralInfoMessageModal
        isVisible={isModalVisible}
        headline={'Information'}
        message={panel.generalInfo}
        onClose={(): void => setIsModalVisible(false)}
      />
    </div>
  );
}
