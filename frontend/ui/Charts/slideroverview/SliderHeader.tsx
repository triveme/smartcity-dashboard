import { ReactElement } from 'react';

type SliderHeaderProps = {
  labelCurrent?: string;
  labelMaximum?: string;
  fontColorCurrent?: string;
  fontColorMaximum?: string;
  fontColorGeneral?: string;
  colorCurrent?: string;
  colorMaximum?: string;
};

export default function SliderHeader(props: SliderHeaderProps): ReactElement {
  const {
    labelCurrent,
    labelMaximum,
    fontColorGeneral,
    colorCurrent,
    colorMaximum,
  } = props;

  return (
    <div className="flex flex-row whitespace-nowrap justify-between p-1">
      <div style={{ fontSize: '16px', color: fontColorGeneral || '#000000' }}>
        <div>Name</div>
      </div>
      <div className="flex flex-ro items-center">
        <div
          className="w-2.5 h-2.5 rounded-full mr-1"
          style={{ backgroundColor: colorCurrent || '#FFFFFF' }}
        />
        <div style={{ fontSize: '16px', color: fontColorGeneral || '#000000' }}>
          {labelCurrent || 'Aktuell'}
        </div>
      </div>
      <div className="flex flex-row items-center">
        <div
          className="w-2.5 h-2.5 rounded-full mr-1"
          style={{ backgroundColor: colorMaximum || '#000000' }}
        />
        <div style={{ fontSize: '16px', color: fontColorGeneral || '#000000' }}>
          {labelMaximum || 'Gesamt'}
        </div>
      </div>
    </div>
  );
}
