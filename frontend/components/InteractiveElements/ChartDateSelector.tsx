'use client';

import { ReactElement, useEffect, useRef, useState } from 'react';
import { CorporateInfo, Tab } from '@/types';
import eventBus, { Event, YEAR_INDEX_SELECTION_EVENT } from '@/app/EventBus';

type ChartDateSelectorProps = {
  tab: Tab;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tabData: any;
  corporateInfo: CorporateInfo;
};

export default function ChartDateSelector(
  props: ChartDateSelectorProps,
): ReactElement {
  const { tabData, corporateInfo } = props;

  const selectedYearIndex = useRef<number>(0);
  const [years, setYears] = useState<string[]>([]);

  useEffect(() => {
    eventBus.on(YEAR_INDEX_SELECTION_EVENT, handleYearIndexUpdate);

    return () => {
      eventBus.off(YEAR_INDEX_SELECTION_EVENT, handleYearIndexUpdate);
    };
  }, []);

  useEffect(() => {
    filterData();
  }, [selectedYearIndex.current]);

  function updateYearIndex(yearIndex: number): void {
    selectedYearIndex.current = yearIndex;
    eventBus.emit(YEAR_INDEX_SELECTION_EVENT, {
      data: yearIndex,
    });
  }

  function handleYearIndexUpdate(dataFromEvent: Event): void {
    selectedYearIndex.current = dataFromEvent.data;
    filterData();
  }

  function filterData(): void {
    if (tabData?.chartData) {
      const years = tabData.chartData[0].values.map(
        (v: string) => v[0].split('-')[0],
      );
      setYears(years);
    }
  }

  return (
    <>
      <table className="w-full">
        <tbody className="flex justify-between w-full">
          {years.map((d, index) => (
            <span
              className="text-center p-5 text-lg"
              style={{
                fontWeight:
                  index == selectedYearIndex.current ? '800' : 'inherit',
                cursor:
                  index == selectedYearIndex.current ? 'inherit' : 'pointer',
                marginRight: '-1px',
                border: '1px solid ' + corporateInfo.fontColor,
                background:
                  index == selectedYearIndex.current
                    ? corporateInfo.fontColor
                    : 'inherit',
                color:
                  index == selectedYearIndex.current
                    ? corporateInfo.widgetPrimaryColor
                    : 'inherit',
                width: 100 / years.length + '%',
              }}
              key={d}
              onClick={() => updateYearIndex(index)}
            >
              {d}
            </span>
          ))}
        </tbody>
      </table>
    </>
  );
}
