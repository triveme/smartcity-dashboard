import { fetchOnDemandChartData } from '@/api/wizard-service-fiware';
import { MapModalWidget } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { ReactElement, useEffect, useState } from 'react';
import ValuesToImageComponent from './ValuesToImageComponent';

type ValuesToImageMapWrapperProps = {
  queryId: string;
  entityId: string;
  attribute: string;
  mapWidgetValue: MapModalWidget;
};

export default function ValuesToImageMapWrapper(
  props: ValuesToImageMapWrapperProps,
): ReactElement {
  const { queryId, entityId, attribute, mapWidgetValue } = props;

  const { data } = useQuery({
    queryKey: ['chartData'],
    queryFn: () => fetchOnDemandChartData(queryId, entityId, attribute),
  });

  const [value, setValue] = useState<string>('');

  useEffect(() => {
    if (data && data.values && data.values.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const latestValueElem: any = data.values[data.values.length - 1];
      let val = '';
      if (Array.isArray(latestValueElem)) {
        val = latestValueElem[1].toString();
      } else {
        val = latestValueElem.toString();
      }
      setValue(val);
      console.log(val);
    }
  }, [data]);

  return (
    <>
      {value && <ValuesToImageComponent value={value} modal={mapWidgetValue} />}
    </>
  );
}
