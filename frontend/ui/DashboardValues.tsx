import { ReactElement } from 'react';
import { roundToDecimal } from '@/utils/mathHelper';

type DashboardValuesProps = {
  decimalPlaces: number;
  value: string | number;
  unit: string;
  fontColor: string;
};

export function DashboardValues(props: DashboardValuesProps): ReactElement {
  const { decimalPlaces, value, unit, fontColor } = props;

  let formattedValue;

  if (typeof value === 'number') {
    if (!isNaN(decimalPlaces)) {
      formattedValue = roundToDecimal(value, decimalPlaces);
    } else {
      formattedValue = value;
    }
  } else {
    formattedValue = value;
  }

  return (
    <div
      className="h-full flex justify-center items-center content-center"
      style={{ color: fontColor }}
    >
      <div className="text-5xl">{formattedValue}</div>
      <div className="text-sm ml-2">{unit || ''}</div>
    </div>
  );
}
