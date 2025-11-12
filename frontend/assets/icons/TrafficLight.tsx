import { ReactElement } from 'react';
type SVGProps = {
  fillColor?: string;
  strokeColor?: string;
  size?: string;
};

export default function TrafficLight(props: SVGProps): ReactElement {
  const { fillColor = '#808080', strokeColor = '#3D3D3D', size = 120 } = props;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Glossy Circle with Border"
    >
      {/* Main circle with border */}
      <circle
        cx="60"
        cy="60"
        r="50"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="4"
      />

      {/* Narrow glossy highlight on top-right */}
      <path
        d="M 100 50 A 45 45 0 0 0 55 20"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        opacity="0.35"
      />
    </svg>
  );
}
