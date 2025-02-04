import { ReactElement } from 'react';
type SVGProps = {
  fontColor?: string;
  height?: string;
};

export default function Snowflake(props: SVGProps): ReactElement {
  const { fontColor, height = 24 } = props;
  return (
    <svg
      fill={fontColor}
      height={height}
      viewBox="0 0 48 48"
      width={height}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m0 0h48v48h-48z" fill={fontColor} fill-opacity=".01" />
      <g
        stroke={fontColor}
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="4"
      >
        <path d="m24 4v40" />
        <path d="m6.72461 14 34.64099 20" />
        <path d="m6.71923 33.9773 34.56217-19.9545" />
        <path d="m12 10 3 9-9 2" />
        <path d="m6 27 9 2-3 9" />
        <path d="m36 10-3 9 9 2" />
        <path d="m42 27-9 2 3 9" />
        <path d="m18 7 6 6 6-6" />
        <path d="m18 41 6-6 6 6" />
      </g>
    </svg>
  );
}
