import { ReactElement } from 'react';
import { useQuery } from '@tanstack/react-query';

import LineChart from './LineChart';
import { fetchOnDemandChartData } from '@/api/wizard-service-fiware';
import { CorporateInfo, MapModalWidget } from '@/types';
import DashboardIcons from '@/ui/Icons/DashboardIcon';
import BarChart from './BarChart';

type ChartWrapperProps = {
  queryId: string;
  entityId: string;
  attribute: string;
  ciColors: CorporateInfo;
  isLinechart?: boolean;
  mapWidgetValue?: MapModalWidget;
};

export default function ChartMapWrapper({
  queryId,
  entityId,
  attribute,
  ciColors,
  isLinechart = true,
  mapWidgetValue,
}: ChartWrapperProps): ReactElement {
  const { data } = useQuery({
    queryKey: ['chartData'],
    queryFn: () => fetchOnDemandChartData(queryId, entityId, attribute),
  });

  if (!data)
    return (
      <div>
        <div className="flex flex-row min-h-screen justify-center items-center text-2xl">
          <DashboardIcons
            iconName="Spinner"
            color={ciColors.headerPrimaryColor}
          />
          <p>Lädt...</p>
        </div>
      </div>
    );

  return (
    <>
      {isLinechart ? (
        <LineChart
          labels={undefined}
          xAxisLabel={mapWidgetValue?.chartXAxisLabel || ''}
          yAxisLabel={mapWidgetValue?.chartYAxisLabel || ''}
          data={[data]}
          allowImageDownload={false}
          staticValues={[]}
          staticValuesColors={[]}
          axisLabelFontColor={ciColors.lineChartAxisLabelFontColor || '#FFF'}
          axisLineColor={ciColors.lineChartAxisLineColor || '#FFF'}
          axisFontSize={ciColors.lineChartAxisTicksFontSize || '15'}
          gridColor={ciColors.lineChartGridColor || '#FFFFF'}
          legendFontSize={ciColors.lineChartLegendFontSize || '12'}
          legendFontColor={ciColors.lineChartLegendFontColor || '#FFFFF'}
          axisLabelSize={ciColors.lineChartAxisLabelSize || '13'}
          currentValuesColors={
            ciColors.lineChartCurrentValuesColors || [
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
          axisTicksFontColor={ciColors.lineChartTicksFontColor}
          filterColor={ciColors.lineChartFilterColor || '#F1B434'}
          filterTextColor={ciColors.lineChartFilterTextColor || '#1D2330'}
          decimalPlaces={mapWidgetValue?.decimalPlaces || 2}
          chartHasAutomaticZoom={mapWidgetValue?.chartHasAutomaticZoom || false}
          chartDateRepresentation={
            mapWidgetValue?.chartDateRepresentation || 'Default'
          }
          chartYAxisScale={mapWidgetValue?.chartYAxisScale || undefined}
          legendAlignment={'Top'}
          hasAdditionalSelection={false}
          showLegend={false}
          showTooltip={false}
          allowZoom={false}
          isStackedChart={false}
        />
      ) : (
        <BarChart
          chartDateRepresentation={'Default'}
          chartYAxisScale={undefined}
          labels={undefined}
          data={[data]}
          allowImageDownload={false}
          allowZoom={false}
          showLegend={false}
          staticValues={[]}
          staticValuesColors={[]}
          fontColor={ciColors.dashboardFontColor || '#FFFFF'}
          axisColor={ciColors.barChartAxisLineColor || '#FFFFF'}
          axisFontSize={ciColors.barChartAxisTicksFontSize || '14'}
          gridColor={ciColors.barChartGridColor || '#FFFFF'}
          legendFontSize={ciColors.barChartLegendFontSize || '14'}
          axisLabelSize={ciColors.barChartAxisLabelSize || '14'}
          currentValuesColors={
            ciColors.barChartCurrentValuesColors || [
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
          showTooltip={false}
          legendAlignment={'Top'}
          hasAdditionalSelection={false}
          isStackedChart={false}
          legendFontColor={ciColors.lineChartLegendFontColor || '#FFFFFF'}
          filterColor={ciColors.barChartFilterColor || '#F1B434'}
          filterTextColor={ciColors.barChartFilterTextColor || '#1D2330'}
          axisFontColor={ciColors.barChartAxisLabelFontColor || '#FFF'}
          decimalPlaces={2}
        />
      )}
    </>
  );
}
