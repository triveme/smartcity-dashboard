import { ReactElement } from 'react';

import { ChartData, SliderOverviewType } from '@/types';
import SliderHeader from './SliderHeader';
import { SliderWithKnobs } from './SliderWithKnobs';

type SliderOverviewProps = {
  data: ChartData[];
};
export default function SliderOverview(
  props: SliderOverviewProps,
): ReactElement {
  const { data } = props;
  const sliders: SliderOverviewType[] = [];
  for (let i = 0; i < data.length; i++) {
    const slider: SliderOverviewType = {
      name: data[i].name,
      capacityCurrent: data[i].values[0][1],
      capacityMax: data[i].values[1][1],
    };
    sliders.push(slider);
  }

  return (
    <div className="h-full p-3">
      <div className="w-full flex flex-col p-3">
        <SliderHeader labels={[]} colors={[]} />
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
                  fontColorCurrent={'#000000'}
                  fontColorMaximum={'#FFFFFF'}
                  fontColorGeneral={'#FFFFFF'}
                  colorCurrent={'#DC2626'}
                  colorMaximum={'#000000'}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
