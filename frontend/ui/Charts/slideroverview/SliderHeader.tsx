import { ReactElement } from 'react';

type SliderHeaderProps = {
  labels: string[];
  colors: string[];
};

export default function SliderHeader(props: SliderHeaderProps): ReactElement {
  const { labels, colors } = props;

  return (
    <div className="flex flex-row whitespace-nowrap justify-between p-1">
      <div style={{ fontSize: '16px' }}>
        <div>Name</div>
      </div>
      <div className="flex flex-ro items-center">
        <div
          className="w-2.5 h-2.5 rounded-full mr-1"
          style={{ backgroundColor: colors[0] || '#FFFFFF' }}
        />
        <div style={{ fontSize: '16px' }}>{labels[0] || 'Aktuell'}</div>
      </div>
      <div className="flex flex-row items-center">
        <div
          className="w-2.5 h-2.5 rounded-full mr-1"
          style={{ backgroundColor: colors[1] || '#000000' }}
        />
        <div style={{ fontSize: '16px' }}>{labels[1] || 'Gesamt'}</div>
      </div>
    </div>
  );
}
