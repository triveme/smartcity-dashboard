'use client';

import React, { ReactElement, useEffect, useState } from 'react';
import LineChart from '@/ui/Charts/LineChart';
import InfoDisplayComponent from '@/ui/InfoDisplayComponent';
import IntervalButton from '@/ui/Buttons/IntervalButton';
import {
  roundToDecimal,
  calculateAverage,
  calculateDeviationPercentage,
  applyUserLocaleToNumber,
} from '@/utils/mathHelper';
import ColumnChart from '@/ui/Charts/ColumnChart';
import useAutoScaleFont from '@/app/custom-hooks/useAutoScaleFont';
import { DUMMY_CHART_DATA } from '@/utils/objectHelper';
import { generateResponsiveFontSize } from '@/utils/fontUtil';

type MeasurementComponentProps = {
  preview: boolean;
  dataValues: [string, number][];
  timeValues: string[];
  valueWarning: number;
  valueAlarm: number;
  valueMax: number;
  unit: string;
  chartXAxisLabel?: string;
  chartYAxisLabel?: string;

  bigValueFontSize: string;
  bigValueFontColor: string;

  topButtonBackgroundColor: string;
  topButtonInactiveBackgroundColor: string;
  topButtonHoverColor: string;
  topButtonHeaderSecondaryColor: string;
  topButtonFontColor: string;

  cardsBackgroundColor: string;
  cardsFontColor: string;
  cardsIconColors: string[];

  barColor: string;
  labelFontColor: string;
  gridColor: string;

  axisLineColor: string;
  axisTicksFontColor: string;
  axisLabelFontColor: string;

  currentValuesColors: string[];
};

export default function MeasurementComponent(
  props: MeasurementComponentProps,
): ReactElement {
  const {
    preview,
    dataValues,
    timeValues,
    valueWarning,
    valueAlarm,
    valueMax,
    unit,

    bigValueFontSize,
    bigValueFontColor,

    topButtonBackgroundColor,
    topButtonInactiveBackgroundColor,
    topButtonHeaderSecondaryColor,
    topButtonHoverColor,
    topButtonFontColor,

    cardsBackgroundColor,
    cardsFontColor,
    cardsIconColors,

    barColor,
    labelFontColor,
    gridColor,

    axisLineColor,
    axisTicksFontColor,
    axisLabelFontColor,
    currentValuesColors,
  } = props;

  const [dayActive, setDayActive] = useState(true);
  const [weekActive, setWeekActive] = useState(false);
  const [monthActive, setMonthActive] = useState(false);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [averageValue, setAverageValue] = useState<number>(0);
  const [deviationValue, setDeviationValue] = useState<number>(0);
  const [dataWeek, setDataWeek] = useState<[string, number][]>([]);
  const [dataMonth, setDataMonth] = useState<[string, number][]>(dataValues);

  const bigValueFontStyle = bigValueFontColor || '#FFF';
  const labelFontStyle = labelFontColor || '#FFF';

  const autoScaleFont = useAutoScaleFont({
    minSize: 12,
    maxSize: 14,
    divisor: 60,
  });

  const handleIntervalClick = (interval: string): void => {
    switch (interval) {
      case 'day':
        setDayActive(true);
        setWeekActive(false);
        setMonthActive(false);
        break;
      case 'week':
        setDayActive(false);
        setWeekActive(true);
        setMonthActive(false);
        break;
      case 'month':
        setDayActive(false);
        setWeekActive(false);
        setMonthActive(true);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    if (dataValues && dataValues.length > 0) {
      setCurrentValue(roundToDecimal(dataValues[dataValues.length - 1][1]));

      if (dataValues.length < 7) {
        setDataWeek([...dataValues]);
      } else {
        setDataWeek(dataValues.slice(-7));
      }

      setDataMonth(dataValues);

      setAverageValue(calculateAverage(dataValues.map((entry) => entry[1])));

      if (averageValue !== 0) {
        setDeviationValue(
          calculateDeviationPercentage(currentValue, averageValue),
        );
      }
    }
  }, [averageValue, currentValue, dataValues, timeValues]);

  return (
    <div className="measurement-component w-full h-full flex flex-col">
      <div className="interval-buttons pt-4 pl-2 p-2 flex justify-left">
        <div className="pr-4">
          <IntervalButton
            text="HEUTE"
            active={dayActive}
            backgroundColor={topButtonBackgroundColor}
            inactiveBackgroundColor={topButtonInactiveBackgroundColor}
            headerSecondaryColor={topButtonHeaderSecondaryColor}
            hoverColor={topButtonHoverColor}
            fontColor={topButtonFontColor}
            onClick={(): void => handleIntervalClick('day')}
          />
        </div>
        <div className="pr-4">
          <IntervalButton
            text="WOCHE"
            active={weekActive}
            backgroundColor={topButtonBackgroundColor}
            inactiveBackgroundColor={topButtonInactiveBackgroundColor}
            headerSecondaryColor={topButtonHeaderSecondaryColor}
            hoverColor={topButtonHoverColor}
            fontColor={topButtonFontColor}
            onClick={(): void => handleIntervalClick('week')}
          />
        </div>
        <div>
          <IntervalButton
            text="MONAT"
            active={monthActive}
            backgroundColor={topButtonBackgroundColor}
            inactiveBackgroundColor={topButtonInactiveBackgroundColor}
            headerSecondaryColor={topButtonHeaderSecondaryColor}
            hoverColor={topButtonHoverColor}
            fontColor={topButtonFontColor}
            onClick={(): void => handleIntervalClick('month')}
          />
        </div>
      </div>
      <div className="flex-grow flex w-full h-full">
        <div className="w-full h-full flex flex-col justify-center items-center pl-2 pr-2">
          {dayActive && (
            <div className="text-center" style={{ color: bigValueFontStyle }}>
              <div className="text-xs uppercase tracking-wide opacity-75 mb-2">
                Heutiger Durchschnitt
              </div>
              <div className="flex items-baseline justify-center gap-2">
                <span
                  className="leading-none font-bold"
                  style={{
                    fontSize: generateResponsiveFontSize(
                      parseInt(bigValueFontSize || '14', 10),
                    ),
                  }}
                >
                  {applyUserLocaleToNumber(
                    currentValue,
                    navigator.language || 'de-DE',
                  )}
                </span>
                <span className="text-[1.5rem] leading-none font-medium">
                  {unit}
                </span>
              </div>
            </div>
          )}
          {weekActive && (
            <LineChart
              labels={!preview ? dataWeek.map((entry) => entry[0]) : undefined}
              data={
                !preview
                  ? [{ name: 'Woche', values: dataWeek }]
                  : [DUMMY_CHART_DATA[0]]
              }
              staticValues={[valueWarning, valueAlarm, valueMax]}
              staticValuesColors={[
                cardsIconColors[2],
                cardsIconColors[3],
                '#FFFFFF',
              ]}
              xAxisLabel={'Zeit'}
              yAxisLabel={`Pegelstand in ${unit}` || ''}
              allowImageDownload={false}
              allowZoom={false}
              isStepline={false}
              isStackedChart={false}
              axisLabelFontColor={axisLabelFontColor}
              axisLineColor={axisLineColor}
              axisTicksFontColor={axisTicksFontColor}
              legendFontSize={'11'}
              legendFontColor="#FFFFF"
              axisFontSize={'11'}
              axisLabelSize={'11'}
              currentValuesColors={currentValuesColors || []}
              gridColor={gridColor}
              legendAlignment="Top"
              hasAdditionalSelection={false}
              showTooltip={false}
              chartDateRepresentation={'Default'}
            />
          )}
          {monthActive && (
            <LineChart
              labels={!preview ? dataMonth.map((entry) => entry[0]) : undefined}
              data={
                !preview
                  ? [{ name: 'Monat', values: dataMonth }]
                  : [DUMMY_CHART_DATA[0]]
              }
              staticValues={[valueWarning, valueAlarm, valueMax]}
              staticValuesColors={[
                cardsIconColors[2],
                cardsIconColors[3],
                '#FFFFFF',
              ]}
              xAxisLabel={'Zeit'}
              yAxisLabel={`Pegelstand in ${unit}` || ''}
              allowImageDownload={false}
              allowZoom={false}
              isStepline={false}
              isStackedChart={false}
              axisLabelFontColor={axisLabelFontColor}
              axisLineColor={axisLineColor}
              axisTicksFontColor={axisTicksFontColor}
              legendFontSize={'11'}
              legendFontColor="#FFFFF"
              axisFontSize={'11'}
              axisLabelSize={'11'}
              currentValuesColors={currentValuesColors}
              gridColor={gridColor}
              legendAlignment="Top"
              hasAdditionalSelection={false}
              showTooltip={false}
              chartDateRepresentation={'Default'}
            />
          )}
          {dayActive && (
            <div className="hidden lg:block">
              <div className="info-displays grid grid-cols-1 lg:grid-cols-4 gap-4 w-full mt-4">
                <InfoDisplayComponent
                  icon="Circle"
                  headline="Mittelwert"
                  backgroundColor={cardsBackgroundColor}
                  fontColor={cardsFontColor}
                  iconColor={cardsIconColors[0]}
                  value={`${applyUserLocaleToNumber(roundToDecimal(averageValue, 2), navigator.language || 'de-DE')} ${unit}`}
                />
                <InfoDisplayComponent
                  icon="ArrowTrendDown"
                  backgroundColor={cardsBackgroundColor}
                  fontColor={cardsFontColor}
                  iconColor={cardsIconColors[1]}
                  headline="Abweichung"
                  value={`${applyUserLocaleToNumber(roundToDecimal(deviationValue, 2), navigator.language || 'de-DE')} %`}
                />
                <InfoDisplayComponent
                  icon="Circle"
                  backgroundColor={cardsBackgroundColor}
                  fontColor={cardsFontColor}
                  iconColor={cardsIconColors[2]}
                  headline="Warnung"
                  value={`${applyUserLocaleToNumber(valueWarning, navigator.language || 'de-DE')} ${unit}`}
                />
                <InfoDisplayComponent
                  icon="Circle"
                  backgroundColor={cardsBackgroundColor}
                  fontColor={cardsFontColor}
                  iconColor={cardsIconColors[3]}
                  headline="Alarm"
                  value={`${applyUserLocaleToNumber(valueAlarm, navigator.language || 'de-DE')} ${unit}`}
                />
              </div>
            </div>
          )}
        </div>
        <div className="w-1/4 flex flex-col justify-end pb-8 pr-2">
          <ColumnChart
            value={currentValue || 50}
            chartLabels={[' ']}
            maxValue={valueMax}
            valueWarning={valueWarning}
            valueAlarm={valueAlarm}
            barColor={barColor}
            gridColor={gridColor}
            warningColor={cardsIconColors[2]}
            alarmColor={cardsIconColors[3]}
            axisTicksFontColor={axisTicksFontColor}
          />
          <div
            className="font-bold mb-2 text-center"
            style={{
              fontSize: `${autoScaleFont}px`,
              color: `${labelFontStyle}`,
            }}
          >
            Aktueller Stand
          </div>
        </div>
      </div>
    </div>
  );
}
