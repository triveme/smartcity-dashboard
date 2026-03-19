import { ReactElement } from 'react';

export const BUILDING_PATH = 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z';

type SVGProps = {
  fontColor?: string;
  height?: string;
};

export default function Building(props: SVGProps): ReactElement {
  const { fontColor = '#fff', height = '24' } = props;
  return (
    <svg
      width="24"
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={BUILDING_PATH} fill={fontColor} />
    </svg>
  );
}
