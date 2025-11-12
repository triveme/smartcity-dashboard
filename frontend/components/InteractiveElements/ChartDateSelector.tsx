'use client';

import { ReactElement, useEffect, useRef, useState } from 'react';
import { ChartData } from '@/types';
import eventBus, { Event, YEAR_INDEX_SELECTION_EVENT } from '@/app/EventBus';

type ChartDateSelectorProps = {
  data: ChartData[];
  dateSelectorBorderColor: string;
  dateSelectorBackgroundColorSelected: string;
  dateSelectorFontColorSelected: string;
  dateSelectorFontColorUnselected: string;
};

export default function ChartDateSelector(
  props: ChartDateSelectorProps,
): ReactElement {
  const {
    data,
    dateSelectorBorderColor,
    dateSelectorBackgroundColorSelected,
    dateSelectorFontColorSelected,
    dateSelectorFontColorUnselected,
  } = props;

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
    if (data) {
      const years: string[] = [];
      data[0].values.forEach((value) => {
        const valueConverted = value[0].split('-')[0];
        if (years.indexOf(valueConverted) == -1) {
          years.push(valueConverted);
        }
      });
      setYears(years);
    }
  }

  return (
    <>
      <table className="w-full">
        <tbody className="flex justify-between w-full">
          <tr>
            {years.map((d, index) => (
              <td
                className="text-center p-5 text-lg"
                style={{
                  fontWeight:
                    index == selectedYearIndex.current ? '800' : 'inherit',
                  cursor:
                    index == selectedYearIndex.current ? 'inherit' : 'pointer',
                  marginRight: '-1px',
                  border: '1px solid ' + dateSelectorBorderColor,
                  background:
                    index == selectedYearIndex.current
                      ? dateSelectorBackgroundColorSelected
                      : 'inherit',
                  color:
                    index == selectedYearIndex.current
                      ? dateSelectorFontColorSelected
                      : dateSelectorFontColorUnselected,
                  width: 100 / years.length + '%',
                }}
                key={d}
                onClick={() => updateYearIndex(index)}
              >
                {d}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </>
  );
}
