'use client';

import { ReactElement, useEffect, useState } from 'react';
import PieChart from './PieChart';
import { CorporateInfo, Tab } from '@/types';
import eventBus, {
  GEOJSON_FEATURE_SELECTION_EVENT,
  YEAR_INDEX_SELECTION_EVENT,
} from '@/app/EventBus';

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

  const [selectedYearIndex, setSelectedYearIndex] = useState<number>(0);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [data, setData] = useState<number[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [labels, setLabels] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);

  useEffect(() => {
    eventBus.on(GEOJSON_FEATURE_SELECTION_EVENT, handleSelectedFeaturesUpdate);

    return () => {
      eventBus.off(
        GEOJSON_FEATURE_SELECTION_EVENT,
        handleSelectedFeaturesUpdate,
      );
    };
  }, []);

  useEffect(() => {
    filterData(selectedYearIndex, selectedFeatures);
  }, [selectedYearIndex]);

  function handleYearIndexUpdate(yearIndex: number): void {
    setSelectedYearIndex(yearIndex);
    eventBus.emit(YEAR_INDEX_SELECTION_EVENT, {
      data: yearIndex,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handleSelectedFeaturesUpdate(dataFromEvent: any): void {
    setSelectedFeatures(dataFromEvent.data);
    filterData(selectedYearIndex, dataFromEvent.data);
  }

  function filterData(sYearIndex: number, sFeatures: string[]): void {
    if (tabData?.chartData) {
      const labels =
        sFeatures.length > 0
          ? tabData?.chartData
              ?.filter(
                (item: { id: string }) =>
                  sFeatures.includes(item.id) ||
                  sFeatures.includes('0' + item.id),
              )
              .map((item: { name: string }) => item.name)
          : tabData?.chartData?.map((item: { name: string }) => item.name) ||
            tab.chartLabels ||
            [];
      setLabels(labels);
      const data: number[] =
        sFeatures.length > 0
          ? tabData?.chartData
              ?.filter(
                (item: { id: string }) =>
                  sFeatures.includes(item.id) ||
                  sFeatures.includes('0' + item.id),
              )
              .map(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (item: { values: any[][] }) => item.values[sYearIndex]?.[1],
              )
          : tabData?.chartData?.map(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (item: { values: any[][] }) => item.values[sYearIndex]?.[1],
            ) ||
            tabData?.chartValues ||
            [];
      if (data.some((d) => d === null || d === undefined)) {
        setData([]);
        setError(true);
      } else {
        setError(false);
        setData(data);
      }
      const years = tabData.chartData[0].values.map(
        (v: string) => v[0].split('-')[0],
      );
      setYears(years);
    }
  }

  return (
    <>
      <p>
        {years.map((d, index) => (
          <span key={d} onClick={() => handleYearIndexUpdate(index)}>
            {d},
          </span>
        ))}
      </p>
      {error && (
        <p>
          - No data available for the selected year. Please select another year.
        </p>
      )}
      {!error && (
        <PieChart
          labels={labels}
          data={data}
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
        />
      )}
    </>
  );
}
