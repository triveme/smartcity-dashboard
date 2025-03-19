/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';
import {
  CorporateInfo,
  MapModalChartStyle,
  MapModalWidget,
  tabComponentSubTypeEnum,
  tabComponentTypeEnum,
} from '@/types';
import Radial180Chart from '@/ui/Charts/radial180/Radial180Chart';
import StageableChart from '@/ui/Charts/stageablechart/StageableChart';
import ImageComponent from '@/ui/ImageComponent';
import { roundToDecimalIfValueHasDecimal } from '@/utils/mathHelper';
import React, { ReactElement, CSSProperties } from 'react';
import { DashboardValues } from '@/ui/DashboardValues';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import IconWithLink from '@/ui/IconWithLink';
import JumpoffButton from '@/ui/Buttons/JumpoffButton';

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
  ciColors?: CorporateInfo;
};

export default function MapModal(props: MapModalProps): ReactElement {
  const {
    selectedMarker,
    mapWidgetValues,
    menuStyle,
    chartStyle,
    ciColors,
    onCloseModal,
  } = props;

  const fontStyle: CSSProperties = {
    color: ciColors?.informationTextFontColor ?? '#FFF',
    fontSize: ciColors?.informationTextFontSize ?? '14px',
  };

  const getAttributeChartValueFromMapObject = (
    widgetAttribute: string,
  ): number => {
    if (
      selectedMarker &&
      selectedMarker.details &&
      selectedMarker.details[widgetAttribute]
    ) {
      const chartValue = selectedMarker.details[widgetAttribute].value;
      if (typeof chartValue !== 'number') {
        return Number(roundToDecimalIfValueHasDecimal(chartValue, 1));
      } else {
        return roundToDecimalIfValueHasDecimal(chartValue, 1);
      }
    }

    return 25;
  };

  const getFontSizeForValueWidget = (value: string | number): string => {
    if (typeof value === 'number') {
      return '20';
    } else {
      return '20';
    }
  };

  const getUnitFontSizeForValueWidget = (value: string | number): string => {
    if (typeof value === 'number') {
      return '20';
    } else {
      return '20';
    }
  };

  return (
    <>
      <div
        key={`map-modal-${selectedMarker.title}`}
        className="fixed top-16 right-0 w-full lg:w-72 h-[calc(100%-4rem)] shadow-lg p-5 overflow-y-auto z-50"
        style={menuStyle}
      >
        {/* Modal header */}
        <div className="flex pb-8">
          <div className="flex-grow overflow-hidden">
            <div className="relative">
              <button onClick={onCloseModal} className="absolute top-0 right-0">
                <FontAwesomeIcon icon={faTimesCircle} size="lg" />
              </button>
              <h2 className="text-xl font-bold mb-4">{selectedMarker.title}</h2>
            </div>
          </div>
        </div>
        <div>
          {mapWidgetValues && mapWidgetValues.length > 0 && (
            <div className="flex flex-col gap-y-8">
              {mapWidgetValues.map((widget: MapModalWidget, index: number) => (
                <div key={`widget-key-${index}`}>
                  <div className="flex w-full items-center justify-center">
                    {widget.componentType === tabComponentTypeEnum.value && (
                      <div className="flex flex-col w-full">
                        {widget.title && (
                          <h2 className="text-center font-semibold mb-4">
                            {widget.title}
                          </h2>
                        )}
                        <DashboardValues
                          decimalPlaces={0}
                          value={
                            selectedMarker.details[widget.attributes]?.value ||
                            '0'
                          }
                          unit={widget.chartUnit || ''}
                          staticValues={widget.chartStaticValues || []}
                          staticValuesColors={
                            widget.chartStaticValuesColors || []
                          }
                          staticValuesTexts={
                            widget.chartStaticValuesTexts || []
                          }
                          staticValuesLogos={
                            widget.chartStaticValuesLogos || []
                          }
                          fontSize={getFontSizeForValueWidget(
                            selectedMarker.details[widget.attributes]?.value ||
                              0,
                          )}
                          unitFontSize={getUnitFontSizeForValueWidget(
                            selectedMarker.details[widget.attributes]?.value ||
                              0,
                          )}
                          fontColor={ciColors?.wertFontColor || '#FFF'}
                        />
                      </div>
                    )}
                    {widget.componentSubType ===
                      tabComponentSubTypeEnum.degreeChart180 && (
                      <div className="flex flex-col w-full h-44">
                        {widget.title && (
                          <h2 className="text-center font-semibold">
                            {widget.title}
                          </h2>
                        )}
                        <Radial180Chart
                          minValue={widget.chartMinimum || 0}
                          maxValue={widget.chartMaximum || 100}
                          unit={widget.chartUnit || ''}
                          value={getAttributeChartValueFromMapObject(
                            widget.attributes,
                          )}
                          fontColor={
                            chartStyle?.degreeChart180FillColor || '#FFF'
                          }
                          fontSize={chartStyle?.degreeChart180FontSize || '11'}
                          unitFontSize={
                            chartStyle?.degreeChart180UnitFontSize || '11'
                          }
                          backgroundColor={
                            chartStyle?.degreeChart180BgColor || '#3D4760'
                          }
                          fillColor={
                            chartStyle?.degreeChart180FillColor || '#FFF'
                          }
                        />
                      </div>
                    )}
                    {widget.componentSubType ===
                      tabComponentSubTypeEnum.stageableChart && (
                      <div className="flex flex-col w-full h-60">
                        {widget.title && (
                          <h2 className="text-center font-semibold">
                            {widget.title}
                          </h2>
                        )}
                        <StageableChart
                          tiles={widget.chartStaticValues?.length || 5}
                          minValue={widget.chartMinimum || 0}
                          maxValue={widget.chartMaximum || 100}
                          unit={widget.chartUnit || ''}
                          staticValues={widget.chartStaticValues || []}
                          staticValuesColors={
                            widget.chartStaticValuesColors || []
                          }
                          staticValuesTexts={
                            widget.chartStaticValuesTexts || []
                          }
                          value={getAttributeChartValueFromMapObject(
                            widget.attributes,
                          )}
                          showAxisLabels={widget.showAxisLabels}
                        />
                      </div>
                    )}
                    {widget.componentType === tabComponentTypeEnum.image && (
                      <div className="w-full h-40">
                        <ImageComponent
                          imageUrl={
                            selectedMarker?.details[widget?.attributes]?.value
                          }
                        />
                      </div>
                    )}
                    {widget.componentType ===
                      tabComponentTypeEnum.information &&
                      widget.componentSubType ===
                        tabComponentSubTypeEnum.text && (
                        <div
                          style={fontStyle}
                          className={`h-full w-full ql-editor no-border-ql-editor`}
                          dangerouslySetInnerHTML={{
                            __html: widget.textValue || '',
                          }}
                        />
                      )}
                    {widget.componentType ===
                      tabComponentTypeEnum.information &&
                      widget.componentSubType ===
                        tabComponentSubTypeEnum.iconWithLink && (
                        <IconWithLink
                          icon={widget.icon || ''}
                          iconColor={widget.iconColor}
                          iconText={widget.iconText}
                          iconUrl={widget.iconUrl || ''}
                        />
                      )}
                    {widget.componentType === 'Button' &&
                      widget.componentSubType === 'jumpoff-url' && (
                        <div className="w-12 sm:w-48">
                          <JumpoffButton panel={widget} />
                        </div>
                      )}

                    {widget.componentType === 'Button' &&
                      widget.componentSubType === 'jumpoff-attribute' && (
                        <div className="w-12 sm:w-48">
                          <JumpoffButton
                            panel={widget}
                            url={
                              selectedMarker.details[widget.jumpoffAttribute!]
                                ?.value
                            }
                          />
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
