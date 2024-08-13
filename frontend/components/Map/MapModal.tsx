'use client';
import {
  MapModalChartStyle,
  MapModalWidget,
  tabComponentSubTypeEnum,
} from '@/types';
import Radial180Chart from '@/ui/Charts/radial180/Radial180Chart';
import StageableChart from '@/ui/Charts/stageablechart/StageableChart';
import HorizontalDivider from '@/ui/HorizontalDivider';
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
  menuStyle?: CSSProperties;
  chartStyle?: MapModalChartStyle;
  onCloseModal: () => void;
};

export default function MapModal(props: MapModalProps): ReactElement {
  const {
    selectedMarker,
    mapWidgetValues,
    menuStyle,
    chartStyle,
    onCloseModal,
  } = props;

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
                {key.toUpperCase()}: <strong>{value.toString()}</strong>
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
                        value={27}
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
                        minValue={widget.chartMinimum || 0}
                        maxValue={widget.chartMaximum || 100}
                        unit={widget.chartUnit || ''}
                        staticValues={widget.chartStaticValues || []}
                        staticValuesColors={
                          widget.chartStaticValuesColors || []
                        }
                        value={25}
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
