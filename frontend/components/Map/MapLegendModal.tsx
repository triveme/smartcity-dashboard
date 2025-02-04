'use client';
import { MapModalLegend } from '@/types';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import React, { ReactElement, CSSProperties } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationPin, faAnglesLeft } from '@fortawesome/free-solid-svg-icons';
import { determineIsMobileView } from '@/app/custom-hooks/isMobileView';
import { usePreventMapScroll } from '@/app/custom-hooks/usePreventMapScroll';
import { localSvgIconsList } from '@/ui/Icons/LocalSvgIcons';

type MapLegendModalProps = {
  mapLegendValues?: MapModalLegend[];
  mapLegendDisclaimer?: string[];
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

  const isSvgIcon = (iconName: string): boolean => {
    return localSvgIconsList.some((icon) => icon.name === iconName);
  };

  return (
    <div
      className="top-16 rounded-lg shadow-lg p-5 z-30 flex flex-col cursor-default"
      style={{
        ...menuStyle,
        ...getLegendModalStyle(),
      }}
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
            onTouchStart={onCloseModal}
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
                      <div
                        className="absolute"
                        style={{ top: isSvgIcon(legend.icon) ? '5px' : '0px' }}
                      >
                        <DashboardIcons
                          iconName={legend.icon}
                          color="#FFF"
                          size="sm"
                          height="12"
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

      {mapLegendDisclaimer && mapLegendDisclaimer.length > 0 && (
        <div className="mt-auto pt-2">
          <div>Haftungsausschluss:</div>
          <ul className="list-disc pl-5">
            {mapLegendDisclaimer.map((disc, index) => (
              <li key={`disclaimer${index}`}>{disc}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
