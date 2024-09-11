'use client';
import {
  MapModalChartStyle,
  MapModalWidget,
  QueryDataAttributeValues,
  tabComponentSubTypeEnum,
} from '@/types';
import Radial180Chart from '@/ui/Charts/radial180/Radial180Chart';
import StageableChart from '@/ui/Charts/stageablechart/StageableChart';
import HorizontalDivider from '@/ui/HorizontalDivider';
import { roundToDecimalIfValueHasDecimal } from '@/utils/mathHelper';
import React, { ReactElement, CSSProperties } from 'react';

type Marker = {
  position: [number, number];
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details: any;
};

type MapModalProps = {
  selectedMarker: Marker;
  mapWidgetValues?: MapModalWidget[];
  mapQueryDataAttributeValues?: QueryDataAttributeValues[];
  menuStyle?: CSSProperties;
  chartStyle?: MapModalChartStyle;
  onCloseModal: () => void;
};

export default function MapModal(props: MapModalProps): ReactElement {
  const {
    selectedMarker,
    mapWidgetValues,
    mapQueryDataAttributeValues,
    menuStyle,
    chartStyle,
    onCloseModal,
  } = props;

  const getChartValueBasedOnAttrName = (widgetAttribute: string): number => {
    const value = mapQueryDataAttributeValues?.find(
      (queryData) => queryData.attrName === widgetAttribute,
    );

    const rawValue = value?.values?.[value.values.length - 1];

    if (typeof rawValue === 'number') {
      const numValue = Number(rawValue);
      // if value has decimals, then round to 1 decimal point
      return roundToDecimalIfValueHasDecimal(numValue, 1);
    }

    return 25;
  };

  function getMarkerDetailsValue(value: string | number): string {
    if (typeof value === 'number') {
      return roundToDecimalIfValueHasDecimal(value, 1).toString();
    }
    return value;
  }

  return (
    <div
      className="fixed top-16 right-0 w-full md:w-72 h-full shadow-lg p-5 overflow-y-auto z-50 flex flex-col justify-between pb-40"
      style={menuStyle}
    >
      <div>
        <h2 className="text-xl font-bold mb-4">{selectedMarker.title}</h2>
        <div>
          {Object.entries(selectedMarker.details).map(([key, value]) =>
            typeof value === 'string' || typeof value === 'number' ? (
              <div key={key}>
                {key.toUpperCase()}:{' '}
                <strong>{getMarkerDetailsValue(value)}</strong>
              </div>
            ) : null,
          )}
        </div>
        <HorizontalDivider />
        {mapWidgetValues && mapWidgetValues.length > 0 && (
          <div className="flex flex-col gap-y-4">
            {mapWidgetValues.map((widget: MapModalWidget) => (
              <>
                <div className="flex flex-col items-center">
                  <div className="w-full h-60">
                    {widget.componentSubType ===
                      tabComponentSubTypeEnum.degreeChart180 && (
                      <Radial180Chart
                        minValue={widget.chartMinimum || 0}
                        maxValue={widget.chartMaximum || 100}
                        unit={widget.chartUnit || ''}
                        value={getChartValueBasedOnAttrName(widget.attributes)}
                        mainColor={
                          chartStyle?.dashboardSecondaryColor || '#3D4760'
                        }
                        secondaryColor={
                          chartStyle?.dashboardFontColor || '#FFF'
                        }
                        fontColor={chartStyle?.dashboardFontColor || '#FFF'}
                      />
                    )}
                    {widget.componentSubType ===
                      tabComponentSubTypeEnum.stageableChart && (
                      <StageableChart
                        tiles={widget.tiles || 5}
                        minValue={widget.chartMinimum || 0}
                        maxValue={widget.chartMaximum || 100}
                        unit={widget.chartUnit || ''}
                        staticValues={widget.chartStaticValues || []}
                        staticValuesColors={
                          widget.chartStaticValuesColors || []
                        }
                        value={getChartValueBasedOnAttrName(widget.attributes)}
                      />
                    )}
                  </div>
                </div>
                <HorizontalDivider />
              </>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <div className="cursor-pointer underline" onClick={onCloseModal}>
          Schließen
        </div>
      </div>
    </div>
  );
}
