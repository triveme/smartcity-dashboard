import { ReactElement } from 'react';
type SVGProps = {
  fontColor?: string;
  height?: string;
};

export default function HumidityNormal(props: SVGProps): ReactElement {
  const { fontColor = '#fff', height = 22 } = props;
  return (
    <svg
      width="20"
      height={height}
      viewBox="0 0 21 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.25 0L9.11667 1.15815C8.75 1.53285 0.25 10.3212 0.25 17.781C0.25 23.4015 4.75 28 10.25 28C15.75 28 20.25 23.4015 20.25 17.781C20.25 10.3552 11.75 1.53285 11.3833 1.15815L10.25 0ZM5.25 16.0779C6.18333 16.0779 6.91667 16.8272 6.91667 17.781C6.91667 19.6545 8.41667 21.1873 10.25 21.1873C11.1833 21.1873 11.9167 21.9367 11.9167 22.8905C11.9167 23.8443 11.1833 24.5937 10.25 24.5937C6.58333 24.5937 3.58333 21.528 3.58333 17.781C3.58333 16.8272 4.31667 16.0779 5.25 16.0779Z"
        fill={fontColor}
      />
    </svg>
  );
}
