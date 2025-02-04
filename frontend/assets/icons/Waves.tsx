import { ReactElement } from 'react';
type SVGProps = {
  fontColor?: string;
  height?: string;
};

export default function Waves(props: SVGProps): ReactElement {
  const { fontColor = '#fff', height = 24 } = props;
  return (
    <svg
      width="26"
      height={height}
      viewBox="0 0 17 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.7442 5.77476L13.3273 3.11915L10.9216 5.77476L8.50473 3.11915L6.08784 5.77476L3.68217 3.11915L1.26527 5.77476L0.124023 4.52157L3.68217 0.623535L6.08784 3.27914L8.50473 0.623535L10.9216 3.27914L13.3273 0.623535L16.8752 4.52157L15.7442 5.77476Z"
        fill={fontColor}
      />
      <path
        d="M15.7442 13.7298L13.3273 11.0742L10.9216 13.7298L8.50473 11.0742L6.08784 13.7298L3.68217 11.0742L1.26527 13.7298L0.124023 12.4759L3.68217 8.57861L6.08784 11.2342L8.50473 8.57861L10.9216 11.2342L13.3273 8.57861L16.8745 12.4759L15.7442 13.7298Z"
        fill={fontColor}
      />
    </svg>
  );
}
