'use client';

import { ReactElement, useEffect, useRef, useState } from 'react';
import { ChartData, Tab } from '@/types';
import eventBus, {
  GEOJSON_FEATURE_HOVER_EVENT,
  GEOJSON_FEATURE_SELECTION_EVENT,
  YEAR_INDEX_SELECTION_EVENT,
  Event,
} from '@/app/EventBus';
import Table from './Table';

type TableDynamicProps = {
  tab: Tab;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tabData: any;
};

export default function TableDynamic(props: TableDynamicProps): ReactElement {
  const { tab, tabData } = props;

  const selectedYearIndex = useRef<number>(0);
  const selectedFeatures = useRef<string[]>([]);
  const hoveredFeature = useRef<string>('');
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    eventBus.on(YEAR_INDEX_SELECTION_EVENT, handleYearIndexUpdate);
    eventBus.on(GEOJSON_FEATURE_SELECTION_EVENT, handleSelectedFeaturesUpdate);
    eventBus.on(GEOJSON_FEATURE_HOVER_EVENT, handleHoveredFeatureUpdate);

    return () => {
      eventBus.off(YEAR_INDEX_SELECTION_EVENT, handleYearIndexUpdate);
      eventBus.off(
        GEOJSON_FEATURE_SELECTION_EVENT,
        handleSelectedFeaturesUpdate,
      );
      eventBus.off(GEOJSON_FEATURE_HOVER_EVENT, handleHoveredFeatureUpdate);
    };
  }, []);

  useEffect(() => {
    filterData(
      selectedYearIndex.current,
      selectedFeatures.current,
      hoveredFeature.current,
    );
  }, [selectedYearIndex]);

  function handleSelectedFromTable(features: string[]): void {
    eventBus.emit(GEOJSON_FEATURE_SELECTION_EVENT, {
      data: features,
    });
  }

  function handleHoverFeatureFromTable(feature: string): void {
    eventBus.emit(GEOJSON_FEATURE_HOVER_EVENT, {
      data: feature,
    });
  }

  function handleYearIndexUpdate(dataFromEvent: Event): void {
    selectedYearIndex.current = dataFromEvent.data;
    filterData(
      dataFromEvent.data,
      selectedFeatures.current,
      hoveredFeature.current,
    );
  }

  function handleSelectedFeaturesUpdate(dataFromEvent: Event): void {
    selectedFeatures.current = dataFromEvent.data;
    filterData(
      selectedYearIndex.current,
      dataFromEvent.data,
      hoveredFeature.current,
    );
  }

  function handleHoveredFeatureUpdate(dataFromEvent: Event): void {
    hoveredFeature.current = dataFromEvent.data;
    filterData(
      selectedYearIndex.current,
      selectedFeatures.current,
      dataFromEvent.data,
    );
  }

  function filterData(
    sYearIndex: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sFeatures: string[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hFeature: string,
  ): void {
    if (tabData?.chartData) {
      const data: ChartData[] =
        tabData?.chartData?.map(
          (item: { name: string; values: [string, number][] }) => {
            const newItem: ChartData = { ...item };
            newItem.values = [item.values[sYearIndex]];
            return newItem;
          },
        ) || tabData?.chartData;

      if (data.some((d) => d === null || d === undefined)) {
        setData([]);
      } else {
        setData(data);
      }
    }
  }

  return (
    <Table
      data={data}
      fontColor={tab?.tableFontColor || '#000000'}
      headerColor={tab?.tableHeaderColor || '#005b9e'}
      oddRowColor={tab?.tableOddRowColor || '#2D3244'}
      evenRowColor={tab?.tableEvenRowColor || '#FFFFFF'}
      selectedRows={selectedFeatures.current || []}
      selectedYearIndex={selectedYearIndex.current}
      hoveredRow={hoveredFeature.current}
      sendSelectedToDynamicTable={handleSelectedFromTable}
      sendHoveredToDynamicTable={handleHoverFeatureFromTable}
      selectedColor={tab?.dynamicHighlightColor || '#3388ff'}
    />
  );
}
