'use client';
import React, { ReactElement, CSSProperties, JSX } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSliders, faAnglesLeft } from '@fortawesome/free-solid-svg-icons';
import CheckBox from '@/ui/CheckBox';
import { determineIsMobileView } from '@/app/custom-hooks/isMobileView';
import { usePreventMapScroll } from '@/app/custom-hooks/usePreventMapScroll';
import { QueryDataWithAttributes } from '@/types';
import { projectStatusOptions } from '@/utils/enumMapper';

type MapFilterModalProps = {
  uiFilterData?: QueryDataWithAttributes[];
  selectedFilters: Record<string, (string | number)[]>;
  onFilterChange: (newValues: (string | number)[], attribute: string) => void;
  menuStyle?: CSSProperties;
  onCloseModal: () => void;
  isLegendModalOpen: boolean;
  isFullscreenMap?: boolean;
  mapNames?: string[];
  handleMapNameFilterChange?: (mapIndex: number, checked: boolean) => void;
  selectedDataSources?: number[];
  isCombinedMap: boolean;
};

export default function MapFilterModal(
  props: MapFilterModalProps,
): ReactElement {
  const {
    uiFilterData,
    selectedFilters,
    onFilterChange,
    menuStyle,
    onCloseModal,
    isFullscreenMap,
    mapNames,
    handleMapNameFilterChange,
    selectedDataSources,
    isCombinedMap,
  } = props;

  const isMobileView = determineIsMobileView();
  const scrollRef = usePreventMapScroll();
  const handleSelectChange = (
    filterValue: string | number,
    checked: boolean,
    filterAttribute: string,
  ): void => {
    const currentAttributeValues = selectedFilters[filterAttribute] || [];
    const updatedAttributeValues = checked
      ? [...currentAttributeValues, filterValue]
      : currentAttributeValues.filter((f) => f !== filterValue);
    onFilterChange(updatedAttributeValues, filterAttribute);
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

  const renderFilter = (
    filterAttribute: string,
    values: { value: number | string; label?: string }[],
    selectedFiltersForThisAttribute: (number | string)[],
    handleSelectChange: (
      filterValue: number | string,
      checked: boolean,
      filterAttribute: string,
    ) => void,
  ): JSX.Element => (
    <div
      key={`key-filter-${filterAttribute}`}
      className="pb-3"
      onTouchStart={(e): void => e.stopPropagation()}
    >
      <h3 className="font-bold capitalize">
        {filterAttribute.replace('_', ' ')}
      </h3>
      {values.map((item, index) => {
        const isChecked = selectedFiltersForThisAttribute.includes(item.value);

        return (
          <div
            key={`key-${filterAttribute}-${index}`}
            className="flex items-center"
          >
            <CheckBox
              label={item.label?.toString() || 'Empty'}
              value={isChecked}
              handleSelectChange={(checked): void =>
                handleSelectChange(item.value, checked, filterAttribute)
              }
            />
          </div>
        );
      })}
    </div>
  );

  const renderMapNameFilter = (
    mapNames: string[],
    selectedDataSources: number[],
    handleMapNameFilterChange: (mapIndex: number, checked: boolean) => void,
  ): JSX.Element => (
    <div className="pb-3">
      <h3>Gruppierungen</h3>
      {mapNames.map((name, index) => (
        <div key={`map-name-${index}`} className="flex items-center">
          <CheckBox
            label={name}
            value={selectedDataSources?.includes(index)}
            handleSelectChange={(checked): void => {
              handleMapNameFilterChange(index, checked);
            }}
          />
        </div>
      ))}
    </div>
  );

  // Helper function to make sure touch input is being handled correctly
  const handleTouchStart = (e: React.TouchEvent): void => {
    e.stopPropagation();
  };

  return (
    <div
      className="top-16 rounded-lg shadow-lg p-5 overflow-y-auto z-30 flex flex-col cursor-default"
      style={{
        ...menuStyle,
        ...getFilterModalStyle(),
        touchAction: 'auto',
        WebkitTapHighlightColor: 'transparent',
      }}
      ref={scrollRef}
      onTouchStart={handleTouchStart}
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
            onTouchStart={onCloseModal}
          />
        </div>

        <div
          className="flex flex-col gap-y-4 overflow-y-auto"
          style={{ maxHeight: '80vh' }}
        >
          {/* Attribute filters */}
          {!isCombinedMap && uiFilterData && uiFilterData.length > 0 && (
            <>
              {uiFilterData?.map((filterGroup, index) => (
                <div key={`group-${index}`}>
                  {Object.entries(filterGroup).map(([attr, values]) => {
                    const selectionsForThisAttr = selectedFilters[attr] || [];
                    const formattedOptions = (
                      values as { value: string | number }[]
                    ).map((item) => {
                      //Add enums here that should be mapped
                      const projectOptionMatch = projectStatusOptions.find(
                        (opt) => opt.value === item.value,
                      );
                      return {
                        value: item.value,
                        label: projectOptionMatch
                          ? projectOptionMatch.label
                          : String(item.value),
                      };
                    });

                    return renderFilter(
                      attr,
                      formattedOptions,
                      selectionsForThisAttr,
                      handleSelectChange,
                    );
                  })}
                </div>
              ))}
            </>
          )}

          {/* Map Name filters */}
          {isCombinedMap && mapNames && mapNames.length > 0 && (
            <>
              {renderMapNameFilter(
                mapNames,
                selectedDataSources || [],
                handleMapNameFilterChange || ((): void => {}), // Handle undefined for single map
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
