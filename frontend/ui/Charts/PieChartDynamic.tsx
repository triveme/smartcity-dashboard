'use client';

import { ReactElement, useEffect, useRef, useState } from 'react';
import PieChart from './PieChart';
import { CorporateInfo, Tab } from '@/types';
import eventBus, {
  Event,
  GEOJSON_FEATURE_HOVER_EVENT,
  GEOJSON_FEATURE_SELECTION_EVENT,
  YEAR_INDEX_SELECTION_EVENT,
} from '@/app/EventBus';
import {
  DUMMY_PIE_CHART_LABELS,
  DUMMY_PIE_CHART_VALUES,
} from '@/utils/objectHelper';

type PieChartDynamicProps = {
  tab: Tab;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tabData: any;
  corporateInfo: CorporateInfo;
};

export default function PieChartDynamic(
  props: PieChartDynamicProps,
): ReactElement {
  const { tab, tabData, corporateInfo } = props;

  const selectedYearIndex = useRef<number>(0);
  const selectedFeatures = useRef<string[]>([]);
  const hoveredFeature = useRef<string>('');
  const [data, setData] = useState<number[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [labels, setLabels] = useState<string[]>([]);

  const hoveredIndex = useRef<number>(-1);
  let playAnimation: boolean = false;

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
  }, [selectedYearIndex.current, hoveredFeature.current]);

  function handleYearIndexUpdate(dataFromEvent: Event): void {
    playAnimation = true;
    selectedYearIndex.current = dataFromEvent.data;
    filterData(
      dataFromEvent.data,
      selectedFeatures.current,
      hoveredFeature.current,
    );
  }

  function handleSelectedFeaturesUpdate(dataFromEvent: Event): void {
    playAnimation = true;
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
    sFeatures: string[],
    hFeature: string,
  ): void {
    if (tabData?.chartData) {
      let filteredData = [];
      if (tab.chartDynamicOnlyShowHover) {
        filteredData = hFeature
          ? tabData?.chartData?.filter((item: { id: string }) =>
              hFeature.includes(item.id),
            )
          : [];
      } else {
        filteredData =
          sFeatures.length > 0
            ? tabData?.chartData?.filter(
                (item: { id: string }) =>
                  sFeatures.includes(item.id) ||
                  sFeatures.includes('0' + item.id) ||
                  hFeature.includes(item.id),
              )
            : tab.chartDynamicNoSelectionDisplayAll === true
              ? tabData?.chartData
              : [];
      }

      const labels =
        filteredData.map((item: { name: string }) => item.name) ||
        tab.chartLabels ||
        [];
      setLabels(labels);

      const data: number[] =
        filteredData.map(
          (item: {
            id: string;
            values: [string, number][];
            highlighted?: boolean;
          }) => item.values[sYearIndex]?.[1],
        ) ||
        tabData?.chartValues ||
        [];

      hoveredIndex.current = filteredData.findIndex((item: { id: string }) =>
        hFeature.includes(item.id),
      );

      if (data.some((d) => d === null || d === undefined)) {
        setData([]);
        setError(true);
      } else {
        setError(false);
        setData(data);
      }
    }
  }

  return (
    <>
      {error && <p>Keine Daten.</p>}
      {!error && (
        <PieChart
          labels={labels === undefined ? DUMMY_PIE_CHART_LABELS : labels}
          data={data === undefined ? DUMMY_PIE_CHART_VALUES : data}
          fontSize={corporateInfo.pieChartFontSize}
          fontColor={corporateInfo.pieChartFontColor}
          currentValuesColors={
            corporateInfo.pieChartCurrentValuesColors || [
              '#4CAF50',
              '#2196F3',
              '#FF9800',
              '#F44336',
              '#9C27B0',
            ]
          }
          unit={tab.chartUnit || ''}
          allowImageDownload={tab.chartAllowImageDownload || false}
          pieChartRadius={tab.chartPieRadius || 70}
          playAnimation={playAnimation} // TODO improve
          highlightedColor={tab?.dynamicHighlightColor || '#0347a6'}
          unhighlightedColor={tab?.dynamicUnhighlightColor || '#647D9E'}
          highlightedIndex={hoveredIndex.current}
        />
      )}
    </>
  );
}
