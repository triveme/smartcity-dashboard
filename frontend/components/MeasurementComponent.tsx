'use client';

import React, { ReactElement, useEffect, useState } from 'react';
import LineChart from '@/ui/Charts/LineChart';
import InfoDisplayComponent from '@/ui/InfoDisplayComponent';
import IntervalButton from '@/ui/Buttons/IntervalButton';
import {
  roundToDecimal,
  calculateAverage,
  calculateDeviationPercentage,
} from '@/utils/mathHelper';
import ColumnChart from '@/ui/Charts/ColumnChart';

type MeasurementComponentProps = {
  dataValues: number[];
  timeValues: string[];
  valueWarning: number;
  valueAlarm: number;
  valueMax: number;
  unit: string;
  chartXAxisLabel?: string;
  chartYAxisLabel?: string;
  fontColor: string;
  axisColor: string;
};
export default function MeasurementComponent(
  props: MeasurementComponentProps,
): ReactElement {
  const {
    dataValues,
    timeValues,
    valueWarning,
    valueAlarm,
    valueMax,
    unit,
    chartXAxisLabel,
    chartYAxisLabel,
    fontColor,
    axisColor,
  } = props;

  const [dayActive, setDayActive] = useState(true);
  const [weekActive, setWeekActive] = useState(false);
  const [monthActive, setMonthActive] = useState(false);
  const [currentValue, setCurrentValue] = useState<number>(0);
  const [averageValue, setAverageValue] = useState<number>(0);
  const [deviationValue, setDeviationValue] = useState<number>(0);
  const [dataWeekValues, setDataWeekValues] = useState<number[]>([]);
  const [dataWeekDates, setDataWeekDates] = useState<string[]>([]);
  const [dataMonthValues, setDataMonthValues] = useState<number[]>(dataValues);
  const [dataMonthDates, setDataMonthDates] = useState<string[]>(timeValues);

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
      setCurrentValue(roundToDecimal(dataValues[dataValues.length - 1], 2));

      if (dataValues.length < 7) {
        setDataWeekValues([...dataValues]);
        setDataWeekDates([...timeValues]);
      } else {
        setDataWeekValues(dataValues.slice(-7));
        setDataWeekDates(timeValues.slice(-7));
      }

      setDataMonthValues(dataValues);
      setDataMonthDates(timeValues);

      setAverageValue(calculateAverage(dataValues));

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
            onClick={(): void => handleIntervalClick('day')}
          />
        </div>
        <div className="pr-4">
          <IntervalButton
            text="WOCHE"
            active={weekActive}
            onClick={(): void => handleIntervalClick('week')}
          />
        </div>
        <div>
          <IntervalButton
            text="MONAT"
            active={monthActive}
            onClick={(): void => handleIntervalClick('month')}
          />
        </div>
      </div>
      <div className="flex-grow flex w-full h-full">
        <div className="w-full h-full flex flex-col justify-center items-center">
          {dayActive && (
            <div className="text-center">
              <span className="text-[10.5rem] leading-none font-bold text-[#DE507D]">
                {currentValue}
              </span>
              <span className="text-[1.5rem] leading-none text-white">
                {unit}
              </span>
            </div>
          )}
          {weekActive && (
            <LineChart
              labels={dataWeekDates || undefined}
              data={[{ name: 'Woche', values: dataWeekValues }] || undefined}
              staticValues={[valueWarning, valueAlarm, valueMax]}
              staticValuesColors={['#FFA500', '#FF4500', '#00FF00']}
              xAxisLabel={chartXAxisLabel || ''}
              yAxisLabel={chartYAxisLabel || ''}
              allowZoom={false}
              isStepline={false}
              fontColor={fontColor}
              axisColor={axisColor}
            />
          )}
          {monthActive && (
            <LineChart
              labels={dataMonthDates || []}
              data={[{ name: 'Monat', values: dataMonthValues }] || []}
              staticValues={[valueWarning, valueAlarm, valueMax]}
              staticValuesColors={['#FFA500', '#FF4500', '#00FF00']}
              xAxisLabel={chartXAxisLabel || ''}
              yAxisLabel={chartYAxisLabel || ''}
              allowZoom={false}
              isStepline={false}
              fontColor={fontColor}
              axisColor={axisColor}
            />
          )}
          {dayActive && (
            <div className="info-displays grid grid-cols-1 md:grid-cols-4 gap-4 w-full mt-4">
              <InfoDisplayComponent
                headline="Mittelwert"
                value={`${averageValue.toFixed(2)} ${unit}`}
              />
              <InfoDisplayComponent
                icon="ArrowTrendDown"
                iconColor="#DE507D"
                headline="Abweichung"
                value={`${deviationValue.toFixed(2)} %`}
              />
              <InfoDisplayComponent
                icon="Circle"
                iconColor="#FFA500"
                headline="Warnung"
                value={`${valueWarning} ${unit}`}
              />
              <InfoDisplayComponent
                icon="Circle"
                iconColor="#FF4500"
                headline="Alarm"
                value={`${valueAlarm} ${unit}`}
              />
            </div>
          )}
        </div>
        <div className="w-1/4 flex flex-col justify-end pb-8 pr-2">
          <ColumnChart
            value={currentValue || 50} //50 is optional for testing can be removed
            chartLabels={[' ']} //1 is optional for testing can be removed
            maxValue={valueMax}
            valueWarning={valueWarning}
            valueAlarm={valueAlarm}
          />
          <div className="text-sm font-bold mb-2 text-center">
            Aktueller Stand
          </div>
        </div>
      </div>
    </div>
  );
}
