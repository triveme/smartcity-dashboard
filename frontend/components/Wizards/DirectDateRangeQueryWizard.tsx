'use client';

import { timeframeEnum } from '@/types';
import { WizardErrors } from '@/types/errors';
import WizardDropdownSelection from '@/ui/WizardDropdownSelection';
import WizardLabel from '@/ui/WizardLabel';
import { timeFrameWithoutLiveWithExakt } from '@/utils/enumMapper';
import { JSX, ReactElement, useState } from 'react';
import DatePicker from 'react-datepicker';

type DirectDateRangeQueryWizardProps = {
  errors?: WizardErrors;
  iconColor: string;
  borderColor: string;
  backgroundColor: string;
};

const DirectDateRangeQueryWizard = (
  props: DirectDateRangeQueryWizardProps,
): JSX.Element => {
  const { errors, iconColor, borderColor, backgroundColor } = props;

  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [extendedTimeframe, setExtendedTimeframe] = useState<
    timeframeEnum | ''
  >('');

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  const handleExtendedTimeframeChange = (value: string) => {
    setExtendedTimeframe(value as timeframeEnum);
  };

  return (
    <>
      <div className="flex flex-col w-full pb-2">
        <WizardLabel label="Erweiterte Zeitbereich" />
        <WizardDropdownSelection
          currentValue={
            timeFrameWithoutLiveWithExakt.find(
              (option) => option.value === extendedTimeframe,
            )?.label || ''
          }
          selectableValues={timeFrameWithoutLiveWithExakt.map(
            (option) => option.label,
          )}
          onSelect={(label: string | number): void => {
            const enumValue = timeFrameWithoutLiveWithExakt.find(
              (option) => option.label === label,
            )?.value;
            handleExtendedTimeframeChange(enumValue as timeframeEnum);
          }}
          error={errors && errors.timeValueError}
          iconColor={iconColor}
          borderColor={borderColor}
          backgroundColor={backgroundColor}
        />
      </div>
      <div className="flex gap-4">
        <div className="flex flex-col w-full pb-2">
          <WizardLabel label="Zeitbereich Begin" />
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            wrapperClassName="w-full min-w-0 flex-1"
            customInput={
              <input
                className="block h-14 w-full min-w-0 rounded-lg border-4 p-4 text-base"
                style={{
                  color: 'white',
                  backgroundColor: backgroundColor,
                  borderColor: borderColor,
                }}
              />
            }
            dateFormat={'yyyy-dd-MM'}
            maxDate={new Date()}
            // minDate={new Date()}
          />
        </div>
        <div className="flex flex-col w-full pb-2">
          <WizardLabel label="Zeitbereich Ende" />
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            wrapperClassName="w-full min-w-0 flex-1"
            customInput={
              <input
                className="block h-14 w-full min-w-0 rounded-lg border-4 p-4 text-base"
                style={{
                  color: 'white',
                  backgroundColor: backgroundColor,
                  borderColor: borderColor,
                }}
              />
            }
            dateFormat={'yyyy-dd-MM'}
            maxDate={new Date()}
            // minDate={new Date()}
          />
        </div>
      </div>
      <div className="mt-4 flex flex-row justify-center justify-center items-center gap-3">
        <button
          className="p-4 h-10 w-38 rounded-lg flex justify-center items-center"
          onClick={() => {}}
          //   style={}
        >
          <div className="flex items-center">
            <div className="hidden sm:block">Daten Unterladen</div>
          </div>
        </button>
      </div>
    </>
  );
};

export default DirectDateRangeQueryWizard;
