'use client';

import { ReactElement, useEffect, useRef, useState } from 'react';
import { ChartData, CorporateInfo, Tab } from '@/types';
import eventBus, {
  Event,
  GEOJSON_FEATURE_HOVER_EVENT,
  GEOJSON_FEATURE_SELECTION_EVENT,
  YEAR_INDEX_SELECTION_EVENT,
} from '@/app/EventBus';
import BarChart from './BarChart';
import { DUMMY_CHART_DATA } from '@/utils/objectHelper';

type BarChartDynamicProps = {
  tab: Tab;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tabData: any;
  corporateInfo: CorporateInfo;
};

export default function BarChartDynamic(
  props: BarChartDynamicProps,
): ReactElement {
  const { tab, tabData, corporateInfo } = props;

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
  }, [selectedYearIndex, hoveredFeature]);

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
          sFeatures.length > 0 || hFeature != ''
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

      const data: ChartData[] =
        filteredData.map(
          (item: {
            id: string;
            values: [string, number][];
            highlighted?: boolean;
          }) => {
            const newItem = { ...item };
            newItem.values =
              item.values.length > sYearIndex
                ? [item.values[sYearIndex]]
                : [item.values[0]];
            newItem.highlighted = hFeature
              ? hFeature.includes(item.id)
              : undefined;
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
    <>
      <BarChart
        chartYAxisScaleChartMinValue={
          tab?.chartYAxisScaleChartMinValue !== undefined &&
          tab?.chartYAxisScaleChartMinValue !== null
            ? tab.chartYAxisScaleChartMinValue
            : undefined
        }
        chartYAxisScaleChartMaxValue={
          tab?.chartYAxisScaleChartMaxValue !== undefined &&
          tab?.chartYAxisScaleChartMaxValue !== null
            ? tab.chartYAxisScaleChartMaxValue
            : undefined
        }
        chartYAxisScale={
          tab?.chartYAxisScale !== undefined && tab?.chartYAxisScale !== null
            ? tab.chartYAxisScale
            : undefined
        }
        chartDateRepresentation={tab?.chartDateRepresentation || 'Default'}
        data={data === undefined ? DUMMY_CHART_DATA : data}
        xAxisLabel={tab.chartXAxisLabel || ''}
        yAxisLabel={tab.chartYAxisLabel || ''}
        allowImageDownload={tab.chartAllowImageDownload || false}
        allowZoom={tab.mapAllowZoom || false}
        showLegend={tab.showLegend || false}
        staticValues={tab.chartStaticValues || []}
        staticValuesColors={tab.chartStaticValuesColors || []}
        staticValuesTicks={tab.chartStaticValuesTicks || []}
        staticValuesTexts={tab.chartStaticValuesTexts || []}
        fontColor={corporateInfo.dashboardFontColor || '#FFFFF'}
        axisColor={corporateInfo.barChartAxisLineColor || '#FFFFF'}
        axisFontSize={corporateInfo.barChartAxisTicksFontSize || '14'}
        gridColor={corporateInfo.barChartGridColor || '#FFFFF'}
        legendFontSize={corporateInfo.barChartLegendFontSize || '14'}
        axisLabelSize={corporateInfo.barChartAxisLabelSize || '14'}
        currentValuesColors={
          corporateInfo.barChartCurrentValuesColors || [
            '#70AAFF',
            '#70AAFF',
            '#70AAFF',
            '#70AAFF',
            '#70AAFF',
            '#70AAFF',
            '#70AAFF',
            '#70AAFF',
            '#70AAFF',
            '#70AAFF',
          ]
        }
        showGrid={false}
        legendAlignment={tab.chartLegendAlign || 'Top'}
        hasAdditionalSelection={tab.chartHasAdditionalSelection || false}
        isStackedChart={tab.isStackedChart || false}
        legendFontColor={corporateInfo.lineChartLegendFontColor || '#FFFFFF'}
        filterColor={corporateInfo.barChartFilterColor || '#F1B434'}
        filterTextColor={corporateInfo.barChartFilterTextColor || '#1D2330'}
        axisFontColor={corporateInfo.barChartAxisLabelFontColor || '#FFF'}
        decimalPlaces={tab?.decimalPlaces || 0}
        showXAxis={false} // only needed if multiple dates are selected
        playAnimation={hoveredFeature.current == ''}
        highlightedColor={tab?.dynamicHighlightColor || '#0347a6'}
        unhighlightedColor={tab?.dynamicUnhighlightColor || '#647D9E'}
        chartHoverSingleValue={tab?.chartHoverSingleValue || false}
        showTimestampOnHover={
          tab?.barChartShowTimestampOnHover !== undefined
            ? tab.barChartShowTimestampOnHover
            : true
        }
      />
    </>
  );
}
