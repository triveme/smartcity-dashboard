'use client';

import { ReactElement } from 'react';

import { ChartData, SliderOverviewType } from '@/types';
import SliderHeader from './SliderHeader';
import { SliderWithKnobs } from './SliderWithKnobs';
import { useSearchParams } from 'next/navigation';

type SliderOverviewProps = {
  data: ChartData[];
  currentCapacityAttribute: string;
  maximumCapacityAttribute: string;

  fontColorCurrent: string;
  fontColorMaximum: string;
  fontColorGeneral: string;
  colorCurrent: string;
  colorMaximum: string;
};
export default function SliderOverview(
  props: SliderOverviewProps,
): ReactElement {
  const {
    data,
    currentCapacityAttribute,
    maximumCapacityAttribute,
    fontColorCurrent,
    fontColorMaximum,
    fontColorGeneral,
    colorCurrent,
    colorMaximum,
  } = props;
  const sliders: SliderOverviewType[] = [];

  const searchParams = useSearchParams();
  const entityId = searchParams.get('entityId');

  try {
    const filteredData =
      entityId && entityId.length > 0
        ? data.filter((x) => x.id === entityId || x.name === entityId)
        : data;
    for (let i = 0; i < filteredData.length; i++) {
      const currentCapacityIndex = filteredData[i].values.findIndex(
        (value) => value[0] === currentCapacityAttribute,
      );
      const maximumCapacityIndex = filteredData[i].values.findIndex(
        (value) => value[0] === maximumCapacityAttribute,
      );
      const slider: SliderOverviewType = {
        name: filteredData[i].name,
        capacityCurrent: filteredData[i].values[currentCapacityIndex][1],
        capacityMax: filteredData[i].values[maximumCapacityIndex][1],
      };
      sliders.push(slider);
    }
  } catch (error) {
    console.error('Error in SliderOverview', error);
  }

  return (
    <div className="h-full p-3">
      <div className="w-full flex flex-col p-3">
        <SliderHeader
          fontColorCurrent={fontColorCurrent}
          fontColorMaximum={fontColorMaximum}
          fontColorGeneral={fontColorGeneral}
          colorCurrent={colorCurrent}
          colorMaximum={colorMaximum}
        />
        <div>
          {sliders.map((obj, index) => {
            return (
              <div
                key={'SliderWrapper-div-' + obj.name + index}
                className="flex flex-row"
              >
                <SliderWithKnobs
                  name={obj.name}
                  currentValue={obj.capacityCurrent}
                  maximumValue={obj.capacityMax}
                  fontColorCurrent={fontColorCurrent}
                  fontColorMaximum={fontColorMaximum}
                  fontColorGeneral={fontColorGeneral}
                  colorCurrent={colorCurrent}
                  colorMaximum={colorMaximum}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
