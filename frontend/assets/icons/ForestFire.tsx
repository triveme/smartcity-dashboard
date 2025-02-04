import { ReactElement } from 'react';
type SVGProps = {
  fontColor?: string;
  height?: string;
};

export default function ForestFire(props: SVGProps): ReactElement {
  const { fontColor, height = 24 } = props;
  return (
    <svg
      width="24"
      height={height}
      viewBox="0 0 15 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.28571 0C6.42857 3.75 0 5.625 0 9.375C0 13.125 4.28571 15 4.28571 15C2.18571 11.2875 8.57143 9.375 8.57143 5.625C8.57143 1.875 4.28571 0 4.28571 0ZM10.7143 5.625C12.8571 9.375 6.42857 11.25 6.42857 15H12.8571C13.7143 15 15 14.0625 15 11.25C15 7.5 10.7143 5.625 10.7143 5.625Z"
        fill={fontColor}
      />
    </svg>
  );
}
