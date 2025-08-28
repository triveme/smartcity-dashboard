'use client';

import React, { useEffect, useState } from 'react';
import { InterestingPlace } from '@/types/dataModels';

type ListViewFilterProps = {
  listData: InterestingPlace[];
  setFilteredData: (data: InterestingPlace[]) => void;
  handleFilterClick: () => void;
  poiBackgroundColor?: string;
  headlineYellowColor?: string;
  iconColor?: string;
  // Filter button styling props
  listviewFilterButtonBackgroundColor?: string;
  listviewFilterButtonBorderColor?: string;
  listviewFilterButtonFontColor?: string;
  listviewFilterButtonHoverBackgroundColor?: string;
  listviewCounterFontColor?: string;
  listviewCounterFontSize?: string;
};

export function ListViewFilter(props: ListViewFilterProps): React.JSX.Element {
  const {
    listData,
    setFilteredData,
    handleFilterClick,
    poiBackgroundColor = '#F9FAFB',
    headlineYellowColor = '#FCD34D',
    iconColor = '#374151',
    listviewFilterButtonBackgroundColor = '#FFFFFF',
    listviewFilterButtonBorderColor = '#D1D5DB',
    listviewFilterButtonFontColor = '#374151',
    listviewFilterButtonHoverBackgroundColor = '#F9FAFB',
    listviewCounterFontColor = '#6B7280',
    listviewCounterFontSize = '14px',
  } = props;

  const [filteredInfosCheckbox, setFilteredInfosCheckbox] = useState<string[]>(
    [],
  );
  const [isChecked, setIsChecked] = useState<boolean[]>([]);
  const [uniqueInfoTypes, setUniqueInfoTypes] = useState<string[]>([]);

  const handleFilterReset = (): void => {
    setIsChecked(new Array(uniqueInfoTypes.length).fill(false));
    setFilteredInfosCheckbox([]);
    handleFilterClick();
  };

  const handleFilterCheckboxClick = (
    index: number,
    checked: boolean,
    type: string,
  ): void => {
    let typesToFilter: string[] = [...filteredInfosCheckbox];

    setIsChecked((isChecked) =>
      isChecked.map((item, i) => (i === index ? !item : item)),
    );

    if (checked) {
      typesToFilter = [...filteredInfosCheckbox, type];
    } else {
      typesToFilter.splice(filteredInfosCheckbox.indexOf(type), 1);
    }

    setFilteredInfosCheckbox(typesToFilter);
  };

  useEffect(() => {
    // Extract unique types from the listData
    const allTypes = listData.flatMap((poi) => poi.types);
    const uniqueTypes = Array.from(new Set(allTypes)).sort();
    setUniqueInfoTypes(uniqueTypes);
    setIsChecked(new Array(uniqueTypes.length).fill(false));
  }, [listData]);

  useEffect(() => {
    // Filter the data locally based on selected checkbox filters
    if (filteredInfosCheckbox.length > 0) {
      const filteredData = listData.filter((poi) =>
        poi.types.some((type) => filteredInfosCheckbox.includes(type)),
      );
      setFilteredData(filteredData);
    } else {
      setFilteredData(listData);
    }
  }, [filteredInfosCheckbox, listData, setFilteredData]);

  return (
    <div
      className="h-full w-full flex-[0_0_33%] flex flex-col p-5 rounded-2xl"
      style={{ backgroundColor: poiBackgroundColor }}
    >
      <div className="py-2 flex justify-between items-center">
        <h3
          className="text-lg font-bold"
          style={{ color: headlineYellowColor }}
        >
          Filter
        </h3>
        <button
          onClick={handleFilterClick}
          className="mr-1 border-2 h-7 w-7 rounded transition-colors flex items-center justify-center"
          style={{
            borderColor: listviewFilterButtonBorderColor,
            backgroundColor: listviewFilterButtonBackgroundColor,
            color: listviewFilterButtonFontColor,
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
          <span style={{ color: listviewFilterButtonFontColor }}>✕</span>
        </button>
      </div>

      <div className="overflow-y-auto flex-1">
        {uniqueInfoTypes.length > 0 ? (
          <div className="space-y-2">
            {uniqueInfoTypes.map((type, index) => (
              <label
                key={type}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  value={type}
                  checked={isChecked[index]}
                  onChange={(e) =>
                    handleFilterCheckboxClick(
                      index,
                      e.target.checked,
                      e.target.value,
                    )
                  }
                  className="rounded text-blue-600 focus:ring-blue-500"
                  style={{ accentColor: iconColor }}
                />
                <span
                  style={{
                    color: listviewCounterFontColor,
                    fontSize: listviewCounterFontSize,
                  }}
                >
                  {type}
                </span>
              </label>
            ))}
          </div>
        ) : (
          <p
            style={{
              color: listviewCounterFontColor,
              fontSize: listviewCounterFontSize,
            }}
          >
            Keine Filterkategorie erkannt
          </p>
        )}
      </div>

      <div className="py-2 pr-1">
        <div className="flex flex-col md:flex-row gap-2">
          <button
            onClick={handleFilterClick}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl transition-colors"
            style={{
              backgroundColor: listviewFilterButtonBackgroundColor,
              color: listviewFilterButtonFontColor,
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
            <span className="text-lg">←</span>
            Filter anwenden
          </button>
          <button
            onClick={handleFilterReset}
            className="px-4 py-2 border rounded-2xl transition-colors"
            style={{
              backgroundColor: listviewFilterButtonBackgroundColor,
              borderColor: listviewFilterButtonBorderColor,
              color: listviewFilterButtonFontColor,
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
            Filter Zurücksetzen
          </button>
        </div>
      </div>
    </div>
  );
}
