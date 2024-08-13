'use client';
import { MapModalLegend } from '@/types';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import React, { ReactElement, CSSProperties } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationPin, faAnglesLeft } from '@fortawesome/free-solid-svg-icons';
import { determineIsMobileView } from '@/app/custom-hooks/isMobileView';
import { usePreventMapScroll } from '@/app/custom-hooks/usePreventMapScroll';

type MapLegendModalProps = {
  mapLegendValues?: MapModalLegend[];
  mapLegendDisclaimer?: string;
  menuStyle?: CSSProperties;
  onCloseModal: () => void;
  isFilterModalOpen: boolean;
  isFullscreenMap?: boolean;
};

export default function MapLegendModal(
  props: MapLegendModalProps,
): ReactElement {
  const {
    mapLegendValues,
    mapLegendDisclaimer,
    menuStyle,
    onCloseModal,
    isFilterModalOpen,
    isFullscreenMap,
  } = props;

  const isMobileView = determineIsMobileView();
  const scrollRef = usePreventMapScroll();

  const getLegendModalStyle = (): CSSProperties => {
    if (isFullscreenMap && !isMobileView) {
      return {
        height: 'calc(100% - 9rem)',
        margin: '0.5rem',
        left: isFilterModalOpen ? '38rem' : '19rem',
        width: '18rem',
        zIndex: 1000,
        fontSize: '1rem',
        position: 'fixed',
      };
    } else if (isFullscreenMap && isMobileView) {
      return {
        height: 'calc(100% - 6rem)',
        margin: '0.5rem',
        left: '3rem',
        width: '15rem',
        position: 'relative',
        zIndex: 1000,
        top: '0',
      };
    } else if (!isFullscreenMap && !isMobileView) {
      return {
        height: 'calc(100% - 6rem)',
        margin: '0.5rem',
        left: '3rem',
        width: '16rem',
        zIndex: 1000,
        position: 'absolute',
        top: '0',
      };
    } else {
      // Map panel widget and mobile view
      return {
        height: 'calc(100% - 7rem)',
        margin: '0.5rem',
        left: '0.25rem',
        width: '16rem',
        zIndex: 1000,
        position: 'absolute',
        top: '0',
      };
    }
  };

  return (
    <div
      className="top-16 rounded-lg shadow-lg p-5 z-30 flex flex-col cursor-default"
      style={{ ...menuStyle, ...getLegendModalStyle() }}
      ref={scrollRef}
    >
      <div className="overflow-y-auto">
        <div className="flex flex-row items-center justify-between mb-8">
          <h2 className="text-lg font-bold">Legende</h2>
          <FontAwesomeIcon
            icon={faAnglesLeft}
            color={menuStyle?.color || '#FFF'}
            className="cursor-pointer"
            onClick={onCloseModal}
          />
        </div>

        {mapLegendValues && mapLegendValues.length > 0 && (
          <div className="flex-grow overflow-y-auto mb-4">
            <div className="flex flex-col gap-y-4">
              {mapLegendValues.map((legend: MapModalLegend) => (
                <React.Fragment key={legend.label}>
                  <div className="flex items-center">
                    <div className="relative flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={faLocationPin}
                        color={legend.iconBackgroundColor}
                        size="2x"
                      />
                      <div className="absolute top-0">
                        <DashboardIcons
                          iconName={legend.icon}
                          color="#FFF"
                          size="sm"
                        />
                      </div>
                    </div>
                    <div className="ml-4">{legend.label}</div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {mapLegendDisclaimer && (
        <div className="mt-auto pt-2">
          <div>Haftungsausschluss: {mapLegendDisclaimer}</div>
        </div>
      )}
    </div>
  );
}
