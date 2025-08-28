'use client';

import React, { useMemo, useState, useEffect, ReactElement } from 'react';
import { ListViewDetails } from './listview-details';
import { ListViewInfo } from './listview-info';
import { ListViewImage } from './listview-image';
import { ListViewMapArrow } from './listview-map-arrow';
import { ListViewFilter } from './listview-filter';
import { InterestingPlace } from '@/types/dataModels';
import { EMPTY_POI } from '@/utils/objectHelper';

type ListViewProps = {
  data: InterestingPlace[];
  listName: string;
  isFilteringAllowed?: boolean;
  poiBackgroundColor?: string;
  headlineYellowColor?: string;
  headlineGrayColor?: string;
  iconColor?: string;
  listviewItemBackgroundColor?: string;
  listviewItemBorderColor?: string;
  listviewItemBorderRadius?: string;
  listviewItemBorderSize?: string;
  listviewTitleFontSize?: string;
  listviewTitleFontWeight?: string;
  listviewDescriptionFontSize?: string;
  listviewCounterFontColor?: string;
  listviewCounterFontSize?: string;
  listviewFilterButtonBackgroundColor?: string;
  listviewFilterButtonBorderColor?: string;
  listviewFilterButtonFontColor?: string;
  listviewFilterButtonHoverBackgroundColor?: string;
  listviewBackButtonBackgroundColor?: string;
  listviewBackButtonHoverBackgroundColor?: string;
  listviewBackButtonFontColor?: string;
  listviewMapButtonBackgroundColor?: string;
  listviewMapButtonHoverBackgroundColor?: string;
  listviewMapButtonFontColor?: string;
  showAddress?: boolean;
  showCategory?: boolean;
};

export function ListView(props: ListViewProps): ReactElement {
  const {
    data,
    listName,
    isFilteringAllowed = true,
    poiBackgroundColor = '#2D3244',
    headlineYellowColor = '#FCD34D',
    headlineGrayColor = '#D1D5DB',
    iconColor = '#E5E7EB',
    listviewItemBackgroundColor = '#3D4760',
    listviewItemBorderColor = '#4B5563',
    listviewItemBorderRadius = '8px',
    listviewItemBorderSize = '1px',
    listviewTitleFontSize = '16px',
    listviewTitleFontWeight = '600',
    listviewDescriptionFontSize = '14px',
    listviewCounterFontColor = '#9CA3AF',
    listviewCounterFontSize = '14px',
    listviewFilterButtonBackgroundColor = '#4B5563',
    listviewFilterButtonBorderColor = '#6B7280',
    listviewFilterButtonFontColor = '#E5E7EB',
    listviewFilterButtonHoverBackgroundColor = '#5B6478',
    listviewBackButtonBackgroundColor = '#6B7280',
    listviewBackButtonHoverBackgroundColor = '#4B5563',
    listviewBackButtonFontColor = '#FFFFFF',
    listviewMapButtonBackgroundColor = '#3B82F6',
    listviewMapButtonHoverBackgroundColor = '#2563EB',
    listviewMapButtonFontColor = '#FFFFFF',
    showAddress = true,
    showCategory = true,
  } = props;

  console.log('DATA LISTVIEW', JSON.stringify(data[0], null, 2));

  const [poiData, setPoiData] = useState<InterestingPlace[]>(data);
  const [pointOfInterestDetailsOpen, setPointOfInterestDetailsOpen] =
    useState(false);
  const [selectedPointOfInterest, setSelectedPointOfInterest] =
    useState<InterestingPlace>(EMPTY_POI);
  const [selectedPointOfInterestIndex, setSelectedPointOfInterestIndex] =
    useState(-1);
  const [filteredInfos, setFilteredInfos] = useState<InterestingPlace[]>(data);
  const [pointOfInterestFilterOpen, setPointOfInterestFilterOpen] =
    useState(false);

  // Event bus placeholder functions
  const publishShowOnMapEvent = (location: {
    lat: number;
    lng: number;
    markerId: string;
  }): void => {
    // TODO: Implement event bus communication
    console.log('Event Bus: Show on map requested', location);
  };

  const publishFilterChangeEvent = (filteredData: InterestingPlace[]): void => {
    // TODO: Implement event bus communication
    console.log('Event Bus: Filter changed', filteredData);
  };

  const handlePoiClick = (index: number): void => {
    setPointOfInterestDetailsOpen(true);
    setSelectedPointOfInterest(filteredInfos[index]); // Use filteredInfos instead of poiData
    setSelectedPointOfInterestIndex(index);
  };

  const handlePoiClose = (): void => {
    setPointOfInterestDetailsOpen(false);
    setSelectedPointOfInterest(EMPTY_POI);
    setSelectedPointOfInterestIndex(-1);
  };

  const handleDisplayOnMapClick = (
    markerId: string,
    lat: number,
    lng: number,
  ): void => {
    // Publish event to show location on external map via event bus
    publishShowOnMapEvent({ lat, lng, markerId });
  };

  const handleFilterClick = (): void => {
    setPointOfInterestFilterOpen(!pointOfInterestFilterOpen);
  };

  useEffect(() => {
    setPoiData(data);
    setFilteredInfos(data);
  }, [data]);

  // Publish filter changes to event bus
  useEffect(() => {
    publishFilterChangeEvent(filteredInfos);
  }, [filteredInfos]);

  const poiList = useMemo(() => {
    return (
      <div className="flex flex-col gap-1 p-1 pt-0 overflow-hidden">
        {filteredInfos.map((info, index) => {
          return (
            <div
              key={`Interesting-POI-Box-${index}-${info.name}`}
              className="h-32 flex flex-row p-3 w-full min-w-0"
              style={{
                backgroundColor: listviewItemBackgroundColor,
                borderColor: listviewItemBorderColor,
                borderRadius: listviewItemBorderRadius,
                borderWidth: listviewItemBorderSize,
                borderStyle: 'solid',
              }}
            >
              <ListViewImage key={`Listview-Image-Box-${index}`} info={info} />
              <ListViewInfo
                key={`Listview-Info-Box-${index}`}
                info={info}
                poiBackgroundColor={poiBackgroundColor}
                titleColor={headlineYellowColor}
                descriptionColor={headlineGrayColor}
                iconColor={iconColor}
                titleFontSize={listviewTitleFontSize}
                titleFontWeight={listviewTitleFontWeight}
                descriptionFontSize={listviewDescriptionFontSize}
                showAddress={showAddress}
                showCategory={showCategory}
              />
              <ListViewMapArrow
                key={`Listview-Map-Arrow-${index}`}
                index={index}
                handlePoiClick={handlePoiClick}
                iconColor={iconColor}
              />
            </div>
          );
        })}
      </div>
    );
  }, [
    filteredInfos,
    poiBackgroundColor,
    headlineYellowColor,
    headlineGrayColor,
    iconColor,
    listviewItemBackgroundColor,
    listviewItemBorderColor,
    listviewItemBorderRadius,
    listviewItemBorderSize,
    listviewTitleFontSize,
    listviewTitleFontWeight,
    listviewDescriptionFontSize,
  ]);

  return (
    <div className="w-full h-full flex flex-col pb-2">
      {pointOfInterestDetailsOpen ? (
        <ListViewDetails
          info={selectedPointOfInterest!}
          handleBackClick={handlePoiClose}
          handleDisplayOnMapClick={handleDisplayOnMapClick}
          index={selectedPointOfInterestIndex}
          poiBackgroundColor={poiBackgroundColor}
          headlineYellowColor={headlineYellowColor}
          headlineGrayColor={headlineGrayColor}
          iconColor={iconColor}
          listviewBackButtonBackgroundColor={listviewBackButtonBackgroundColor}
          listviewBackButtonHoverBackgroundColor={
            listviewBackButtonHoverBackgroundColor
          }
          listviewBackButtonFontColor={listviewBackButtonFontColor}
          listviewMapButtonBackgroundColor={listviewMapButtonBackgroundColor}
          listviewMapButtonHoverBackgroundColor={
            listviewMapButtonHoverBackgroundColor
          }
          listviewMapButtonFontColor={listviewMapButtonFontColor}
        />
      ) : (
        <div className="h-full w-full flex flex-col">
          {pointOfInterestFilterOpen === true ? (
            <ListViewFilter
              listData={poiData}
              setFilteredData={setFilteredInfos}
              handleFilterClick={handleFilterClick}
              poiBackgroundColor={poiBackgroundColor}
              headlineYellowColor={headlineYellowColor}
              iconColor={iconColor}
              listviewFilterButtonBackgroundColor={
                listviewFilterButtonBackgroundColor
              }
              listviewFilterButtonBorderColor={listviewFilterButtonBorderColor}
              listviewFilterButtonFontColor={listviewFilterButtonFontColor}
              listviewFilterButtonHoverBackgroundColor={
                listviewFilterButtonHoverBackgroundColor
              }
              listviewCounterFontColor={listviewCounterFontColor}
              listviewCounterFontSize={listviewCounterFontSize}
            />
          ) : (
            <div className="h-full w-full flex flex-col p-1">
              <div className="flex flex-row w-full justify-between items-center">
                <p
                  style={{
                    color: listviewCounterFontColor,
                    fontSize: listviewCounterFontSize,
                  }}
                >
                  {filteredInfos.length !== poiData.length
                    ? `${filteredInfos.length} / `
                    : null}{' '}
                  {poiData.length} {listName}
                </p>
                {isFilteringAllowed && (
                  <button
                    onClick={handleFilterClick}
                    className="flex items-center gap-2 px-3 py-1 border rounded-2xl"
                    style={{
                      backgroundColor: listviewFilterButtonBackgroundColor,
                      borderColor: listviewFilterButtonBorderColor,
                      color: listviewFilterButtonFontColor,
                      fontSize: listviewCounterFontSize,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        listviewFilterButtonHoverBackgroundColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        listviewFilterButtonBackgroundColor;
                    }}
                  >
                    Filter
                  </button>
                )}
              </div>
              <div className="overflow-y-auto overflow-x-hidden mt-1 flex-1">
                {poiList}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
