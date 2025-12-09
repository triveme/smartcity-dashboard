'use client';

import { ReactElement, useEffect, useRef, useState } from 'react';
import { ChartData, CorporateInfo, Tab } from '@/types';
import eventBus, {
  Event,
  GEOJSON_FEATURE_HOVER_EVENT,
  GEOJSON_FEATURE_SELECTION_EVENT,
} from '@/app/EventBus';
import LineChart from './LineChart';
import { DUMMY_CHART_DATA } from '@/utils/objectHelper';

type LineChartDynamicProps = {
  tab: Tab;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tabData: any;
  corporateInfo: CorporateInfo;
};

export default function LineChartDynamic(
  props: LineChartDynamicProps,
): ReactElement {
  const { tab, tabData, corporateInfo } = props;

  const selectedFeatures = useRef<string[]>([]);
  const hoveredFeature = useRef<string>('');
  const [data, setData] = useState<ChartData[]>([]);
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    eventBus.on(GEOJSON_FEATURE_SELECTION_EVENT, handleSelectedFeaturesUpdate);
    eventBus.on(GEOJSON_FEATURE_HOVER_EVENT, handleHoveredFeatureUpdate);

    return () => {
      eventBus.off(
        GEOJSON_FEATURE_SELECTION_EVENT,
        handleSelectedFeaturesUpdate,
      );
      eventBus.off(GEOJSON_FEATURE_HOVER_EVENT, handleHoveredFeatureUpdate);
    };
  }, []);

  useEffect(() => {
    filterData(selectedFeatures.current, hoveredFeature.current);
  }, [selectedFeatures.current.length, hoveredFeature.current]);

  function handleSelectedFeaturesUpdate(dataFromEvent: Event): void {
    selectedFeatures.current = dataFromEvent.data;
    filterData(dataFromEvent.data, hoveredFeature.current);
  }

  function handleHoveredFeatureUpdate(dataFromEvent: Event): void {
    hoveredFeature.current = dataFromEvent.data;
    filterData(selectedFeatures.current, dataFromEvent.data);
  }

  function filterData(sFeatures: string[], hFeature: string): void {
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

      const labels =
        filteredData.map((item: { name: string }) => item.name) ||
        tab.chartLabels ||
        [];
      setLabels(labels);
      const data: ChartData[] = filteredData.map(
        (item: {
          id: string;
          values: [string, number][];
          highlighted?: boolean;
        }) => {
          item.highlighted = hFeature ? hFeature.includes(item.id) : undefined;
          return item;
        },
      );
      if (data.some((d) => d === null || d === undefined)) {
        setData([]);
      } else {
        setData(data);
      }
    }
  }

  return (
    <>
      <LineChart
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
        labels={labels}
        data={data === undefined ? DUMMY_CHART_DATA : data}
        xAxisLabel={tab.chartXAxisLabel || ''}
        yAxisLabel={tab.chartYAxisLabel || ''}
        allowImageDownload={tab.chartAllowImageDownload || false}
        allowZoom={tab.mapAllowZoom || false}
        isStepline={tab.isStepline || false}
        isStackedChart={tab?.isStackedChart || false}
        showLegend={tab.showLegend || false}
        staticValues={tab.chartStaticValues || []}
        staticValuesColors={tab.chartStaticValuesColors || []}
        staticValuesTicks={tab.chartStaticValuesTicks || []}
        staticValuesTexts={tab.chartStaticValuesTexts || []}
        axisLabelFontColor={corporateInfo.lineChartAxisLabelFontColor || '#FFF'}
        axisLineColor={corporateInfo.lineChartAxisLineColor || '#FFF'}
        axisFontSize={corporateInfo.lineChartAxisTicksFontSize || '15'}
        gridColor={corporateInfo.lineChartGridColor || '#FFFFF'}
        legendFontSize={corporateInfo.lineChartLegendFontSize || '12'}
        legendFontColor={corporateInfo.lineChartLegendFontColor || '#FFFFF'}
        axisLabelSize={corporateInfo.lineChartAxisLabelSize || '13'}
        currentValuesColors={
          corporateInfo.lineChartCurrentValuesColors || [
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
        axisTicksFontColor={corporateInfo.lineChartTicksFontColor}
        legendAlignment={tab.chartLegendAlign || 'Top'}
        hasAdditionalSelection={tab.chartHasAdditionalSelection || false}
        filterColor={corporateInfo.lineChartFilterColor || '#F1B434'}
        filterTextColor={corporateInfo.lineChartFilterTextColor || '#1D2330'}
        decimalPlaces={tab?.decimalPlaces || 0}
        chartHasAutomaticZoom={tab?.chartHasAutomaticZoom}
        playAnimation={hoveredFeature.current == ''}
        highlightedColor={tab?.dynamicHighlightColor || '#0347a6'}
        unhighlightedColor={tab?.dynamicUnhighlightColor || '#647D9E'}
        chartAggregationMode={tab?.chartAggregationMode}
      />
    </>
  );
}
