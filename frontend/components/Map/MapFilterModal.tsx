'use client';
import React, { ReactElement, CSSProperties } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSliders, faAnglesLeft } from '@fortawesome/free-solid-svg-icons';
import CheckBox from '@/ui/CheckBox';
import { QueryDataEntities } from '@/types';
import { determineIsMobileView } from '@/app/custom-hooks/isMobileView';
import { usePreventMapScroll } from '@/app/custom-hooks/usePreventMapScroll';

type MapFilterModalProps = {
  mapFilterEntities: QueryDataEntities[];
  selectedFilters: (number | string)[];
  onFilterChange: (newSelectedFilters: (string | number)[]) => void;
  menuStyle?: CSSProperties;
  onCloseModal: () => void;
  isLegendModalOpen: boolean;
  isFullscreenMap?: boolean;
};

export default function MapFilterModal(
  props: MapFilterModalProps,
): ReactElement {
  const {
    mapFilterEntities,
    selectedFilters,
    onFilterChange,
    menuStyle,
    onCloseModal,
    isFullscreenMap,
  } = props;

  const isMobileView = determineIsMobileView();
  const scrollRef = usePreventMapScroll();

  // creates a new array with the first items of entity.values
  const createFilterEntitiesList = (
    entities: QueryDataEntities[],
  ): (string | number)[] => {
    return Array.from(
      // removes duplicate values
      new Set(
        entities
          .map((entity) =>
            entity.values.length > 0 ? entity.values[0] : undefined,
          )
          .filter((value): value is string | number => value !== undefined),
      ),
    ).sort((a, b) => {
      if (typeof a === 'string' && typeof b === 'string') {
        return a.localeCompare(b);
      } else if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
      } else {
        // If mixed types, convert to string for consistent comparison
        return a.toString().localeCompare(b.toString());
      }
    });
  };

  const handleSelectChange = (
    filter: string | number,
    checked: boolean,
  ): void => {
    const newSelectedFilters = checked
      ? [...selectedFilters, filter]
      : selectedFilters.filter((f) => f !== filter);

    onFilterChange(newSelectedFilters);
  };

  const getFilterModalStyle = (): CSSProperties => {
    if (isFullscreenMap && !isMobileView) {
      return {
        height: 'calc(100% - 9rem)',
        margin: '0.5rem',
        left: '19rem',
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
      className="top-16 rounded-lg shadow-lg p-5 overflow-y-auto z-30 flex flex-col cursor-default"
      style={{
        ...menuStyle,
        ...getFilterModalStyle(),
      }}
      ref={scrollRef}
    >
      <div>
        <div className="flex flex-row items-center justify-between mb-8">
          <div className="flex flex-row items-center justify-between">
            <FontAwesomeIcon
              icon={faSliders}
              color={menuStyle?.color || '#FFF'}
            />
            <h2 className="text-lg font-bold ml-2">Filter</h2>
          </div>
          <FontAwesomeIcon
            icon={faAnglesLeft}
            color={menuStyle?.color || '#FFF'}
            className="cursor-pointer"
            onClick={onCloseModal}
          />
        </div>

        {mapFilterEntities && mapFilterEntities.length > 0 && (
          <div
            className="flex flex-col gap-y-4 overflow-y-auto"
            style={{ maxHeight: '80vh' }}
          >
            {createFilterEntitiesList(mapFilterEntities).map((filter) => (
              <div key={`key-filter-${filter}`} className="flex items-center">
                <CheckBox
                  label={filter.toString()}
                  value={selectedFilters.includes(filter)}
                  handleSelectChange={(checked): void =>
                    handleSelectChange(filter, checked)
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
